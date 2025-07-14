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

// Get user's processes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [processes] = await db.execute(`
      SELECT p.*, s.name as software_name, s.type as software_type
      FROM processes p
      JOIN software s ON p.software_id = s.id
      WHERE p.user_id = ?
      ORDER BY p.start_time DESC
    `, [req.user.userId]);

    res.json({ processes });
  } catch (error) {
    console.error('Get processes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start a new process
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { software_id, hardware_id, target_ip, type } = req.body;

    // Check if user owns the software and hardware
    const [userSoftware] = await db.execute(
      'SELECT * FROM user_software WHERE user_id = ? AND software_id = ? AND hardware_id = ? AND is_installed = TRUE',
      [req.user.userId, software_id, hardware_id]
    );

    if (userSoftware.length === 0) {
      return res.status(400).json({ error: 'Software not found or not installed' });
    }

    // Calculate process duration based on type and hardware specs
    const [hardware] = await db.execute(
      'SELECT * FROM hardware WHERE id = ? AND user_id = ?',
      [hardware_id, req.user.userId]
    );

    if (hardware.length === 0) {
      return res.status(404).json({ error: 'Hardware not found' });
    }

    const duration = calculateProcessDuration(type, hardware[0]);

    // Create the process
    const [result] = await db.execute(
      'INSERT INTO processes (user_id, hardware_id, software_id, target_ip, type, status, progress) VALUES (?, ?, ?, ?, ?, "RUNNING", 0)',
      [req.user.userId, hardware_id, software_id, target_ip, type]
    );

    // Schedule process completion
    setTimeout(async () => {
      try {
        await db.execute(
          'UPDATE processes SET status = "COMPLETED", progress = 100, end_time = NOW(), result = ? WHERE id = ?',
          [generateProcessResult(type, target_ip), result.insertId]
        );
      } catch (error) {
        console.error('Process completion error:', error);
      }
    }, duration * 1000);

    res.status(201).json({
      message: 'Process started successfully',
      process_id: result.insertId,
      duration: duration
    });

  } catch (error) {
    console.error('Start process error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel process
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.execute(
      'UPDATE processes SET status = "FAILED", end_time = NOW() WHERE id = ? AND user_id = ? AND status = "RUNNING"',
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Process not found or not running' });
    }

    res.json({
      message: 'Process cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel process error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get process details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [processes] = await db.execute(`
      SELECT p.*, s.name as software_name, s.type as software_type
      FROM processes p
      JOIN software s ON p.software_id = s.id
      WHERE p.id = ? AND p.user_id = ?
    `, [req.params.id, req.user.userId]);

    if (processes.length === 0) {
      return res.status(404).json({ error: 'Process not found' });
    }

    res.json({ process: processes[0] });
  } catch (error) {
    console.error('Get process details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function calculateProcessDuration(type, hardware) {
  const baseDurations = {
    'DOWNLOAD': 30,
    'UPLOAD': 30,
    'DELETE': 10,
    'HIDE': 15,
    'SEEK': 10,
    'AV': 60,
    'LOG': 5,
    'FORMAT': 120,
    'HACK': 45,
    'BANK_HACK': 90,
    'INSTALL': 20,
    'UNINSTALL': 15,
    'PORT_SCAN': 25,
    'RESEARCH': 40,
    'NMAP': 35,
    'ANALYZE': 30,
    'DOOM': 180,
    'RESET_IP': 10,
    'RESET_PWD': 20,
    'DDOS': 300,
    'INSTALL_WEBSERVER': 60
  };

  const baseDuration = baseDurations[type] || 30;
  
  // Adjust based on hardware specs
  const cpuMultiplier = 1 - (hardware.cpu_level - 1) * 0.05;
  const ramMultiplier = 1 - (hardware.ram_level - 1) * 0.03;
  const internetMultiplier = 1 - (hardware.internet_level - 1) * 0.04;

  return Math.max(5, Math.floor(baseDuration * cpuMultiplier * ramMultiplier * internetMultiplier));
}

function generateProcessResult(type, target_ip) {
  const results = {
    'DOWNLOAD': `Successfully downloaded files from ${target_ip}`,
    'UPLOAD': `Successfully uploaded files to ${target_ip}`,
    'DELETE': `Successfully deleted files from ${target_ip}`,
    'HIDE': `Successfully hid files on ${target_ip}`,
    'SEEK': `Found hidden files on ${target_ip}`,
    'AV': `Antivirus scan completed on ${target_ip}`,
    'LOG': `Log analysis completed for ${target_ip}`,
    'FORMAT': `Successfully formatted drive on ${target_ip}`,
    'HACK': `Successfully hacked ${target_ip}`,
    'BANK_HACK': `Successfully hacked bank account on ${target_ip}`,
    'INSTALL': `Software installed successfully on ${target_ip}`,
    'UNINSTALL': `Software uninstalled successfully from ${target_ip}`,
    'PORT_SCAN': `Port scan completed for ${target_ip}`,
    'RESEARCH': `Research completed for ${target_ip}`,
    'NMAP': `Network mapping completed for ${target_ip}`,
    'ANALYZE': `System analysis completed for ${target_ip}`,
    'DOOM': `DOOM virus deployed on ${target_ip}`,
    'RESET_IP': 'IP address reset successfully',
    'RESET_PWD': 'Password reset successfully',
    'DDOS': `DDoS attack completed on ${target_ip}`,
    'INSTALL_WEBSERVER': `Web server installed on ${target_ip}`
  };

  return results[type] || 'Process completed successfully';
}

module.exports = router;