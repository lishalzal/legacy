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

// Get user's software
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { hardware_id, folder_id } = req.query;
    
    let query = `
      SELECT us.*, s.name, s.type, s.level, s.description, s.price, s.is_public
      FROM user_software us
      JOIN software s ON us.software_id = s.id
      WHERE us.user_id = ?
    `;
    let params = [req.user.userId];

    if (hardware_id) {
      query += ' AND us.hardware_id = ?';
      params.push(hardware_id);
    }

    if (folder_id) {
      query += ' AND us.folder_id = ?';
      params.push(folder_id);
    } else if (folder_id === null) {
      query += ' AND us.folder_id IS NULL';
    }

    query += ' ORDER BY s.name ASC';

    const [software] = await db.execute(query, params);

    res.json({ software });
  } catch (error) {
    console.error('Get software error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available software to buy
router.get('/store', authenticateToken, async (req, res) => {
  try {
    const [software] = await db.execute(
      'SELECT * FROM software WHERE is_public = TRUE ORDER BY price ASC'
    );

    res.json({ software });
  } catch (error) {
    console.error('Get store software error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Buy software
router.post('/buy', authenticateToken, async (req, res) => {
  try {
    const { software_id, hardware_id } = req.body;

    // Get software details
    const [software] = await db.execute(
      'SELECT * FROM software WHERE id = ? AND is_public = TRUE',
      [software_id]
    );

    if (software.length === 0) {
      return res.status(404).json({ error: 'Software not found' });
    }

    // Check if user owns the hardware
    const [hardware] = await db.execute(
      'SELECT * FROM hardware WHERE id = ? AND user_id = ?',
      [hardware_id, req.user.userId]
    );

    if (hardware.length === 0) {
      return res.status(404).json({ error: 'Hardware not found' });
    }

    // Check if user already has this software on this hardware
    const [existing] = await db.execute(
      'SELECT * FROM user_software WHERE user_id = ? AND software_id = ? AND hardware_id = ?',
      [req.user.userId, software_id, hardware_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'You already own this software on this hardware' });
    }

    // Check if user has enough money
    const [users] = await db.execute(
      'SELECT money FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users[0].money < software[0].price) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Deduct money from user
      await connection.execute(
        'UPDATE users SET money = money - ? WHERE id = ?',
        [software[0].price, req.user.userId]
      );

      // Add software to user's inventory
      await connection.execute(
        'INSERT INTO user_software (user_id, software_id, hardware_id) VALUES (?, ?, ?)',
        [req.user.userId, software_id, hardware_id]
      );

      await connection.commit();
      connection.release();

      res.status(201).json({
        message: 'Software purchased successfully',
        cost: software[0].price
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Buy software error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Install/uninstall software
router.put('/:id/install', authenticateToken, async (req, res) => {
  try {
    const { is_installed } = req.body;

    const [result] = await db.execute(
      'UPDATE user_software SET is_installed = ? WHERE id = ? AND user_id = ?',
      [is_installed, req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Software not found' });
    }

    res.json({
      message: `Software ${is_installed ? 'installed' : 'uninstalled'} successfully`
    });

  } catch (error) {
    console.error('Install software error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Move software to folder
router.put('/:id/move', authenticateToken, async (req, res) => {
  try {
    const { folder_id } = req.body;

    const [result] = await db.execute(
      'UPDATE user_software SET folder_id = ? WHERE id = ? AND user_id = ?',
      [folder_id, req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Software not found' });
    }

    res.json({
      message: 'Software moved successfully'
    });

  } catch (error) {
    console.error('Move software error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete software from inventory
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM user_software WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Software not found' });
    }

    res.json({
      message: 'Software removed from inventory'
    });

  } catch (error) {
    console.error('Delete software error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get folders
router.get('/folders', authenticateToken, async (req, res) => {
  try {
    const { hardware_id } = req.query;
    
    let query = 'SELECT * FROM folders WHERE user_id = ?';
    let params = [req.user.userId];

    if (hardware_id) {
      query += ' AND hardware_id = ?';
      params.push(hardware_id);
    }

    query += ' ORDER BY name ASC';

    const [folders] = await db.execute(query, params);

    res.json({ folders });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create folder
router.post('/folders', authenticateToken, async (req, res) => {
  try {
    const { name, hardware_id } = req.body;

    // Check if user owns the hardware
    const [hardware] = await db.execute(
      'SELECT * FROM hardware WHERE id = ? AND user_id = ?',
      [hardware_id, req.user.userId]
    );

    if (hardware.length === 0) {
      return res.status(404).json({ error: 'Hardware not found' });
    }

    const [result] = await db.execute(
      'INSERT INTO folders (user_id, hardware_id, name) VALUES (?, ?, ?)',
      [req.user.userId, hardware_id, name]
    );

    res.status(201).json({
      message: 'Folder created successfully',
      folder_id: result.insertId
    });

  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete folder
router.delete('/folders/:id', authenticateToken, async (req, res) => {
  try {
    // Move all software out of the folder first
    await db.execute(
      'UPDATE user_software SET folder_id = NULL WHERE folder_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    // Delete the folder
    const [result] = await db.execute(
      'DELETE FROM folders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json({
      message: 'Folder deleted successfully'
    });

  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get text files
router.get('/text', authenticateToken, async (req, res) => {
  try {
    const { hardware_id, folder_id } = req.query;
    
    let query = 'SELECT * FROM text_files WHERE user_id = ?';
    let params = [req.user.userId];

    if (hardware_id) {
      query += ' AND hardware_id = ?';
      params.push(hardware_id);
    }

    if (folder_id) {
      query += ' AND folder_id = ?';
      params.push(folder_id);
    } else if (folder_id === null) {
      query += ' AND folder_id IS NULL';
    }

    query += ' ORDER BY name ASC';

    const [files] = await db.execute(query, params);

    res.json({ files });
  } catch (error) {
    console.error('Get text files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create text file
router.post('/text', authenticateToken, async (req, res) => {
  try {
    const { name, content, hardware_id, folder_id } = req.body;

    // Check if user owns the hardware
    const [hardware] = await db.execute(
      'SELECT * FROM hardware WHERE id = ? AND user_id = ?',
      [hardware_id, req.user.userId]
    );

    if (hardware.length === 0) {
      return res.status(404).json({ error: 'Hardware not found' });
    }

    const [result] = await db.execute(
      'INSERT INTO text_files (user_id, hardware_id, folder_id, name, content) VALUES (?, ?, ?, ?, ?)',
      [req.user.userId, hardware_id, folder_id, name, content]
    );

    res.status(201).json({
      message: 'Text file created successfully',
      file_id: result.insertId
    });

  } catch (error) {
    console.error('Create text file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update text file
router.put('/text/:id', authenticateToken, async (req, res) => {
  try {
    const { name, content } = req.body;

    const [result] = await db.execute(
      'UPDATE text_files SET name = ?, content = ? WHERE id = ? AND user_id = ?',
      [name, content, req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      message: 'Text file updated successfully'
    });

  } catch (error) {
    console.error('Update text file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete text file
router.delete('/text/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM text_files WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      message: 'Text file deleted successfully'
    });

  } catch (error) {
    console.error('Delete text file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;