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

// Get available missions
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const [missions] = await db.execute(`
      SELECT m.*, um.status, um.started_at, um.completed_at
      FROM missions m
      LEFT JOIN user_missions um ON m.id = um.mission_id AND um.user_id = ?
      WHERE m.is_active = TRUE
      ORDER BY m.difficulty ASC, m.type ASC
    `, [req.user.userId]);

    res.json({ missions });
  } catch (error) {
    console.error('Get available missions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's current mission
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const [missions] = await db.execute(`
      SELECT m.*, um.status, um.started_at, um.completed_at, um.progress
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ? AND um.status = 'IN_PROGRESS'
      ORDER BY um.started_at DESC
      LIMIT 1
    `, [req.user.userId]);

    if (missions.length === 0) {
      return res.json({ mission: null });
    }

    res.json({ mission: missions[0] });
  } catch (error) {
    console.error('Get current mission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get completed missions
router.get('/completed', authenticateToken, async (req, res) => {
  try {
    const [missions] = await db.execute(`
      SELECT m.*, um.started_at, um.completed_at
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ? AND um.status = 'COMPLETED'
      ORDER BY um.completed_at DESC
    `, [req.user.userId]);

    res.json({ missions });
  } catch (error) {
    console.error('Get completed missions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start mission
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const missionId = req.params.id;

    // Check if mission exists and is active
    const [missions] = await db.execute(
      'SELECT * FROM missions WHERE id = ? AND is_active = TRUE',
      [missionId]
    );

    if (missions.length === 0) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    // Check if user already has this mission
    const [existing] = await db.execute(
      'SELECT * FROM user_missions WHERE user_id = ? AND mission_id = ?',
      [req.user.userId, missionId]
    );

    if (existing.length > 0) {
      if (existing[0].status === 'IN_PROGRESS') {
        return res.status(400).json({ error: 'Mission already in progress' });
      } else if (existing[0].status === 'COMPLETED') {
        return res.status(400).json({ error: 'Mission already completed' });
      }
    }

    // Check if user has another mission in progress
    const [currentMissions] = await db.execute(
      'SELECT * FROM user_missions WHERE user_id = ? AND status = "IN_PROGRESS"',
      [req.user.userId]
    );

    if (currentMissions.length > 0) {
      return res.status(400).json({ error: 'You already have a mission in progress' });
    }

    // Start the mission
    await db.execute(
      'INSERT INTO user_missions (user_id, mission_id, status, progress) VALUES (?, ?, "IN_PROGRESS", "{}")',
      [req.user.userId, missionId]
    );

    res.json({
      message: 'Mission started successfully',
      mission: missions[0]
    });

  } catch (error) {
    console.error('Start mission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete mission
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const missionId = req.params.id;

    // Get user's mission
    const [userMissions] = await db.execute(`
      SELECT um.*, m.reward_money, m.reward_experience, m.reward_software_id
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = ? AND um.mission_id = ? AND um.status = 'IN_PROGRESS'
    `, [req.user.userId, missionId]);

    if (userMissions.length === 0) {
      return res.status(404).json({ error: 'Mission not found or not in progress' });
    }

    const userMission = userMissions[0];

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Update mission status
      await connection.execute(
        'UPDATE user_missions SET status = "COMPLETED", completed_at = NOW() WHERE id = ?',
        [userMission.id]
      );

      // Give rewards
      if (userMission.reward_money > 0) {
        await connection.execute(
          'UPDATE users SET money = money + ? WHERE id = ?',
          [userMission.reward_money, req.user.userId]
        );
      }

      if (userMission.reward_experience > 0) {
        await connection.execute(
          'UPDATE users SET experience = experience + ? WHERE id = ?',
          [userMission.reward_experience, req.user.userId]
        );
      }

      // Give software reward if any
      if (userMission.reward_software_id) {
        // Get user's active hardware
        const [hardware] = await connection.execute(
          'SELECT id FROM hardware WHERE user_id = ? AND is_active = TRUE LIMIT 1',
          [req.user.userId]
        );

        if (hardware.length > 0) {
          await connection.execute(
            'INSERT INTO user_software (user_id, software_id, hardware_id) VALUES (?, ?, ?)',
            [req.user.userId, userMission.reward_software_id, hardware[0].id]
          );
        }
      }

      await connection.commit();
      connection.release();

      res.json({
        message: 'Mission completed successfully',
        rewards: {
          money: userMission.reward_money,
          experience: userMission.reward_experience,
          software_id: userMission.reward_software_id
        }
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Complete mission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Abandon mission
router.post('/:id/abandon', authenticateToken, async (req, res) => {
  try {
    const missionId = req.params.id;

    const [result] = await db.execute(
      'UPDATE user_missions SET status = "FAILED" WHERE user_id = ? AND mission_id = ? AND status = "IN_PROGRESS"',
      [req.user.userId, missionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mission not found or not in progress' });
    }

    res.json({
      message: 'Mission abandoned successfully'
    });

  } catch (error) {
    console.error('Abandon mission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update mission progress
router.put('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const missionId = req.params.id;
    const { progress } = req.body;

    const [result] = await db.execute(
      'UPDATE user_missions SET progress = ? WHERE user_id = ? AND mission_id = ? AND status = "IN_PROGRESS"',
      [JSON.stringify(progress), req.user.userId, missionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mission not found or not in progress' });
    }

    res.json({
      message: 'Mission progress updated successfully'
    });

  } catch (error) {
    console.error('Update mission progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;