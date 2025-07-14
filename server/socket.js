const jwt = require('jsonwebtoken');
const db = require('./config/database');

module.exports = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);

    // Add user to connected users
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      username: socket.username,
      connectedAt: new Date()
    });

    // Update user's online status
    await db.execute(
      'UPDATE users SET is_online = TRUE WHERE id = ?',
      [socket.userId]
    );

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Send initial data
    socket.emit('connected', {
      message: 'Connected to Hacker Experience',
      userId: socket.userId,
      username: socket.username
    });

    // Handle process updates
    socket.on('process_update', async (data) => {
      try {
        const { process_id } = data;
        
        const [processes] = await db.execute(
          'SELECT * FROM processes WHERE id = ? AND user_id = ?',
          [process_id, socket.userId]
        );

        if (processes.length > 0) {
          socket.emit('process_updated', {
            process: processes[0]
          });
        }
      } catch (error) {
        console.error('Process update error:', error);
      }
    });

    // Handle chat messages
    socket.on('chat_message', async (data) => {
      try {
        const { message, target_user_id } = data;

        if (target_user_id && connectedUsers.has(target_user_id)) {
          // Private message
          io.to(`user_${target_user_id}`).emit('private_message', {
            from: socket.username,
            from_id: socket.userId,
            message: message,
            timestamp: new Date()
          });
        } else {
          // Global message (if implemented)
          io.emit('global_message', {
            from: socket.username,
            from_id: socket.userId,
            message: message,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Chat message error:', error);
      }
    });

    // Handle notifications
    socket.on('notification', async (data) => {
      try {
        const { type, message, target_user_id } = data;

        if (target_user_id && connectedUsers.has(target_user_id)) {
          io.to(`user_${target_user_id}`).emit('notification', {
            type: type,
            message: message,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Notification error:', error);
      }
    });

    // Handle process completion
    socket.on('process_completed', async (data) => {
      try {
        const { process_id, result } = data;

        // Update process in database
        await db.execute(
          'UPDATE processes SET status = "COMPLETED", progress = 100, end_time = NOW(), result = ? WHERE id = ? AND user_id = ?',
          [result, process_id, socket.userId]
        );

        // Notify user
        socket.emit('process_completed', {
          process_id: process_id,
          result: result
        });
      } catch (error) {
        console.error('Process completion error:', error);
      }
    });

    // Handle mission updates
    socket.on('mission_update', async (data) => {
      try {
        const { mission_id, progress } = data;

        // Update mission progress
        await db.execute(
          'UPDATE user_missions SET progress = ? WHERE user_id = ? AND mission_id = ? AND status = "IN_PROGRESS"',
          [JSON.stringify(progress), socket.userId, mission_id]
        );

        socket.emit('mission_updated', {
          mission_id: mission_id,
          progress: progress
        });
      } catch (error) {
        console.error('Mission update error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.username} (${socket.userId})`);

      // Remove user from connected users
      connectedUsers.delete(socket.userId);

      // Update user's online status
      await db.execute(
        'UPDATE users SET is_online = FALSE WHERE id = ?',
        [socket.userId]
      );
    });
  });

  // Periodic tasks
  setInterval(async () => {
    try {
      // Update process progress for running processes
      const [runningProcesses] = await db.execute(
        'SELECT * FROM processes WHERE status = "RUNNING"'
      );

      for (const process of runningProcesses) {
        const startTime = new Date(process.start_time);
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);

        // Calculate progress based on elapsed time
        const [hardware] = await db.execute(
          'SELECT * FROM hardware WHERE id = ?',
          [process.hardware_id]
        );

        if (hardware.length > 0) {
          const duration = calculateProcessDuration(process.type, hardware[0]);
          const progress = Math.min(100, Math.floor((elapsed / duration) * 100));

          if (progress >= 100) {
            // Complete the process
            await db.execute(
              'UPDATE processes SET status = "COMPLETED", progress = 100, end_time = NOW(), result = ? WHERE id = ?',
              [generateProcessResult(process.type, process.target_ip), process.id]
            );

            // Notify user if online
            if (connectedUsers.has(process.user_id)) {
              const userSocket = connectedUsers.get(process.user_id);
              io.to(userSocket.socketId).emit('process_completed', {
                process_id: process.id,
                result: generateProcessResult(process.type, process.target_ip)
              });
            }
          } else {
            // Update progress
            await db.execute(
              'UPDATE processes SET progress = ? WHERE id = ?',
              [progress, process.id]
            );

            // Notify user if online
            if (connectedUsers.has(process.user_id)) {
              const userSocket = connectedUsers.get(process.user_id);
              io.to(userSocket.socketId).emit('process_updated', {
                process_id: process.id,
                progress: progress
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Periodic task error:', error);
    }
  }, 5000); // Run every 5 seconds

  // Helper functions (same as in processes.js)
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
};