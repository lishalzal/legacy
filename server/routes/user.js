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

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, email, rank, experience, money, bitcoins, created_at, last_login FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;

    // Check if username or email already exists
    if (username) {
      const [existing] = await db.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, req.user.userId]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    if (email) {
      const [existing] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.userId]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Update profile
    const updates = [];
    const params = [];

    if (username) {
      updates.push('username = ?');
      params.push(username);
    }

    if (email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.user.userId);

    await db.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Get basic stats
    const [users] = await db.execute(
      'SELECT rank, experience, money, bitcoins FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get hardware count
    const [hardwareCount] = await db.execute(
      'SELECT COUNT(*) as count FROM hardware WHERE user_id = ?',
      [req.user.userId]
    );

    // Get software count
    const [softwareCount] = await db.execute(
      'SELECT COUNT(*) as count FROM user_software WHERE user_id = ?',
      [req.user.userId]
    );

    // Get completed missions count
    const [missionsCount] = await db.execute(
      'SELECT COUNT(*) as count FROM user_missions WHERE user_id = ? AND status = "COMPLETED"',
      [req.user.userId]
    );

    // Get completed processes count
    const [processesCount] = await db.execute(
      'SELECT COUNT(*) as count FROM processes WHERE user_id = ? AND status = "COMPLETED"',
      [req.user.userId]
    );

    // Get bank accounts count
    const [bankCount] = await db.execute(
      'SELECT COUNT(*) as count FROM bank_accounts WHERE user_id = ?',
      [req.user.userId]
    );

    // Get bitcoin wallets count
    const [bitcoinCount] = await db.execute(
      'SELECT COUNT(*) as count FROM bitcoin_wallets WHERE user_id = ?',
      [req.user.userId]
    );

    const stats = {
      rank: users[0].rank,
      experience: users[0].experience,
      money: users[0].money,
      bitcoins: users[0].bitcoins,
      hardware_count: hardwareCount[0].count,
      software_count: softwareCount[0].count,
      missions_completed: missionsCount[0].count,
      processes_completed: processesCount[0].count,
      bank_accounts: bankCount[0].count,
      bitcoin_wallets: bitcoinCount[0].count
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user logs
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const [logs] = await db.execute(`
      SELECT l.*, h.name as hardware_name
      FROM logs l
      JOIN hardware h ON l.hardware_id = h.id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.userId, parseInt(limit), parseInt(offset)]);

    res.json({ logs });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get online players
router.get('/online', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, rank, last_login FROM users WHERE is_online = TRUE AND id != ? ORDER BY last_login DESC LIMIT 20',
      [req.user.userId]
    );

    res.json({ online_users: users });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top players
router.get('/ranking', authenticateToken, async (req, res) => {
  try {
    const { type = 'experience', limit = 10 } = req.query;

    let orderBy = 'experience DESC';
    if (type === 'money') {
      orderBy = 'money DESC';
    } else if (type === 'rank') {
      orderBy = 'rank DESC';
    }

    const [users] = await db.execute(
      `SELECT id, username, rank, experience, money FROM users WHERE is_banned = FALSE ORDER BY ${orderBy} LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({ ranking: users });
  } catch (error) {
    console.error('Get ranking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;