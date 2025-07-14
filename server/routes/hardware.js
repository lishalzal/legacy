const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

// Get user's hardware
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [hardware] = await db.execute(
      'SELECT * FROM hardware WHERE user_id = ? ORDER BY is_active DESC, created_at ASC',
      [req.user.userId]
    );

    res.json({ hardware });
  } catch (error) {
    console.error('Get hardware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific hardware details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [hardware] = await db.execute(
      'SELECT * FROM hardware WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (hardware.length === 0) {
      return res.status(404).json({ error: 'Hardware not found' });
    }

    res.json({ hardware: hardware[0] });
  } catch (error) {
    console.error('Get hardware details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Buy new hardware
router.post('/buy', authenticateToken, async (req, res) => {
  try {
    const { name, type, cpu_level, ram_level, hdd_level, internet_level, firewall_level, antivirus_level } = req.body;

    // Calculate total cost
    const costs = {
      PC: 1000,
      SERVER: 5000,
      LAPTOP: 2000
    };

    const baseCost = costs[type] || 1000;
    const cpuCost = (cpu_level - 1) * 500;
    const ramCost = (ram_level - 1) * 300;
    const hddCost = (hdd_level - 1) * 200;
    const internetCost = (internet_level - 1) * 400;
    const firewallCost = firewall_level * 1000;
    const antivirusCost = antivirus_level * 800;

    const totalCost = baseCost + cpuCost + ramCost + hddCost + internetCost + firewallCost + antivirusCost;

    // Check if user has enough money
    const [users] = await db.execute(
      'SELECT money FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (users[0].money < totalCost) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Deduct money from user
      await connection.execute(
        'UPDATE users SET money = money - ? WHERE id = ?',
        [totalCost, req.user.userId]
      );

      // Create new hardware
      const [result] = await connection.execute(
        'INSERT INTO hardware (user_id, name, type, cpu_level, ram_level, hdd_level, internet_level, firewall_level, antivirus_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user.userId, name, type, cpu_level, ram_level, hdd_level, internet_level, firewall_level, antivirus_level]
      );

      await connection.commit();
      connection.release();

      res.status(201).json({
        message: 'Hardware purchased successfully',
        hardware_id: result.insertId,
        cost: totalCost
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Buy hardware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upgrade hardware
router.put('/:id/upgrade', authenticateToken, async (req, res) => {
  try {
    const { cpu_level, ram_level, hdd_level, internet_level, firewall_level, antivirus_level } = req.body;

    // Get current hardware
    const [hardware] = await db.execute(
      'SELECT * FROM hardware WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (hardware.length === 0) {
      return res.status(404).json({ error: 'Hardware not found' });
    }

    const current = hardware[0];

    // Calculate upgrade costs
    const cpuCost = (cpu_level - current.cpu_level) * 500;
    const ramCost = (ram_level - current.ram_level) * 300;
    const hddCost = (hdd_level - current.hdd_level) * 200;
    const internetCost = (internet_level - current.internet_level) * 400;
    const firewallCost = (firewall_level - current.firewall_level) * 1000;
    const antivirusCost = (antivirus_level - current.antivirus_level) * 800;

    const totalCost = cpuCost + ramCost + hddCost + internetCost + firewallCost + antivirusCost;

    if (totalCost <= 0) {
      return res.status(400).json({ error: 'No upgrades selected' });
    }

    // Check if user has enough money
    const [users] = await db.execute(
      'SELECT money FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users[0].money < totalCost) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Deduct money from user
      await connection.execute(
        'UPDATE users SET money = money - ? WHERE id = ?',
        [totalCost, req.user.userId]
      );

      // Update hardware
      await connection.execute(
        'UPDATE hardware SET cpu_level = ?, ram_level = ?, hdd_level = ?, internet_level = ?, firewall_level = ?, antivirus_level = ? WHERE id = ?',
        [cpu_level, ram_level, hdd_level, internet_level, firewall_level, antivirus_level, req.params.id]
      );

      await connection.commit();
      connection.release();

      res.json({
        message: 'Hardware upgraded successfully',
        cost: totalCost
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Upgrade hardware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set active hardware
router.put('/:id/activate', authenticateToken, async (req, res) => {
  try {
    // Deactivate all user's hardware
    await db.execute(
      'UPDATE hardware SET is_active = FALSE WHERE user_id = ?',
      [req.user.userId]
    );

    // Activate the selected hardware
    const [result] = await db.execute(
      'UPDATE hardware SET is_active = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hardware not found' });
    }

    res.json({ message: 'Hardware activated successfully' });

  } catch (error) {
    console.error('Activate hardware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete hardware
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [hardware] = await db.execute(
      'SELECT * FROM hardware WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (hardware.length === 0) {
      return res.status(404).json({ error: 'Hardware not found' });
    }

    if (hardware[0].is_active) {
      return res.status(400).json({ error: 'Cannot delete active hardware' });
    }

    await db.execute(
      'DELETE FROM hardware WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    res.json({ message: 'Hardware deleted successfully' });

  } catch (error) {
    console.error('Delete hardware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get hardware specifications
router.get('/specs/types', authenticateToken, async (req, res) => {
  try {
    const specs = {
      PC: {
        baseCost: 1000,
        maxLevels: {
          cpu: 10,
          ram: 10,
          hdd: 10,
          internet: 10,
          firewall: 5,
          antivirus: 5
        }
      },
      SERVER: {
        baseCost: 5000,
        maxLevels: {
          cpu: 20,
          ram: 20,
          hdd: 20,
          internet: 15,
          firewall: 10,
          antivirus: 10
        }
      },
      LAPTOP: {
        baseCost: 2000,
        maxLevels: {
          cpu: 8,
          ram: 8,
          hdd: 8,
          internet: 8,
          firewall: 3,
          antivirus: 3
        }
      }
    };

    res.json({ specs });
  } catch (error) {
    console.error('Get hardware specs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;