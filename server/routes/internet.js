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

// Get internet connections (NPCs and players)
router.get('/connections', authenticateToken, async (req, res) => {
  try {
    const [connections] = await db.execute(`
      SELECT ic.*, u.username as player_name
      FROM internet_connections ic
      LEFT JOIN users u ON ic.user_id = u.id
      WHERE ic.is_online = TRUE
      ORDER BY ic.level ASC
    `);

    res.json({ connections });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Scan for targets
router.post('/scan', authenticateToken, async (req, res) => {
  try {
    const { target_ip } = req.body;

    // Find the target
    const [targets] = await db.execute(
      'SELECT * FROM internet_connections WHERE ip = ? AND is_online = TRUE',
      [target_ip]
    );

    if (targets.length === 0) {
      return res.status(404).json({ error: 'Target not found or offline' });
    }

    const target = targets[0];

    // Basic scan result
    const scanResult = {
      ip: target.ip,
      name: target.name,
      type: target.type,
      level: target.level,
      firewall_level: target.firewall_level,
      antivirus_level: target.antivirus_level,
      is_online: target.is_online
    };

    res.json({ scan_result: scanResult });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Port scan
router.post('/portscan', authenticateToken, async (req, res) => {
  try {
    const { target_ip } = req.body;

    // Find the target
    const [targets] = await db.execute(
      'SELECT * FROM internet_connections WHERE ip = ? AND is_online = TRUE',
      [target_ip]
    );

    if (targets.length === 0) {
      return res.status(404).json({ error: 'Target not found or offline' });
    }

    const target = targets[0];

    // Generate random open ports based on target level
    const openPorts = [];
    const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3306, 5432, 8080];
    
    for (const port of commonPorts) {
      if (Math.random() < (target.level / 10)) {
        openPorts.push(port);
      }
    }

    res.json({
      target_ip: target.ip,
      open_ports: openPorts,
      scan_complete: true
    });
  } catch (error) {
    console.error('Port scan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's IP
router.get('/myip', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT ip FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ ip: users[0].ip });
  } catch (error) {
    console.error('Get IP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset IP
router.post('/resetip', authenticateToken, async (req, res) => {
  try {
    // Generate new random IP
    const newIP = generateRandomIP();

    await db.execute(
      'UPDATE users SET ip = ? WHERE id = ?',
      [newIP, req.user.userId]
    );

    res.json({
      message: 'IP reset successfully',
      new_ip: newIP
    });
  } catch (error) {
    console.error('Reset IP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to generate random IP
function generateRandomIP() {
  return `${Math.floor(Math.random() * 255) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

module.exports = router;