const rooms = new Map(); // Store active rooms and their participants

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // User joins a room
    socket.on('join-room', ({ roomId, userId, username, avatar }) => {
      socket.join(roomId);
      
      // Add user to room
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      rooms.get(roomId).set(socket.id, { userId, username, avatar, socketId: socket.id });

      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        userId,
        username,
        avatar,
        socketId: socket.id
      });

      // Send current participants to the new user
      const participants = Array.from(rooms.get(roomId).values());
      socket.emit('room-participants', participants);

      console.log(`👤 ${username} joined room: ${roomId}`);
    });

    // Leave room
    socket.on('leave-room', ({ roomId, userId, username }) => {
      socket.leave(roomId);
      
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
        }
      }

      socket.to(roomId).emit('user-left', { userId, username, socketId: socket.id });
      console.log(`👋 ${username} left room: ${roomId}`);
    });

    // Video sync events
    socket.on('video-play', ({ roomId, timestamp }) => {
      socket.to(roomId).emit('video-play', { timestamp });
    });

    socket.on('video-pause', ({ roomId, timestamp }) => {
      socket.to(roomId).emit('video-pause', { timestamp });
    });

    socket.on('video-seek', ({ roomId, timestamp }) => {
      socket.to(roomId).emit('video-seek', { timestamp });
    });

    socket.on('video-change', ({ roomId, videoUrl, videoType }) => {
      socket.to(roomId).emit('video-change', { videoUrl, videoType });
    });

    // Chat messages
    socket.on('send-message', ({ roomId, message, userId, username, avatar, timestamp }) => {
      io.to(roomId).emit('receive-message', {
        message,
        userId,
        username,
        avatar,
        timestamp,
        id: Date.now()
      });
    });

    // Emoji reactions
    socket.on('send-emoji', ({ roomId, emoji, userId, username }) => {
      socket.to(roomId).emit('receive-emoji', {
        emoji,
        userId,
        username,
        id: Date.now()
      });
    });

    // WebRTC signaling for voice chat
    socket.on('webrtc-offer', ({ roomId, offer, targetSocketId }) => {
      socket.to(targetSocketId).emit('webrtc-offer', {
        offer,
        senderSocketId: socket.id
      });
    });

    socket.on('webrtc-answer', ({ roomId, answer, targetSocketId }) => {
      socket.to(targetSocketId).emit('webrtc-answer', {
        answer,
        senderSocketId: socket.id
      });
    });

    socket.on('webrtc-ice-candidate', ({ roomId, candidate, targetSocketId }) => {
      socket.to(targetSocketId).emit('webrtc-ice-candidate', {
        candidate,
        senderSocketId: socket.id
      });
    });

    // Typing indicator
    socket.on('typing-start', ({ roomId, username }) => {
      socket.to(roomId).emit('user-typing', { username });
    });

    socket.on('typing-stop', ({ roomId }) => {
      socket.to(roomId).emit('user-stopped-typing');
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      
      // Remove user from all rooms
      rooms.forEach((participants, roomId) => {
        if (participants.has(socket.id)) {
          const user = participants.get(socket.id);
          participants.delete(socket.id);
          
          if (participants.size === 0) {
            rooms.delete(roomId);
          }
          
          socket.to(roomId).emit('user-left', {
            userId: user.userId,
            username: user.username,
            socketId: socket.id
          });
        }
      });
    });
  });
};
