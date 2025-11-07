const WebSocket = require('ws');
const http = require('http');
const url = require('url');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store rooms and their participants
const rooms = new Map();

// Helper to broadcast to all clients in a room except sender
function broadcastToRoom(roomId, message, excludeUserId = null) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.forEach((client) => {
    if (client.userId !== excludeUserId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

// Helper to send room state to a new participant
function sendRoomState(ws, roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const participants = Array.from(room.values()).map(client => ({
    id: client.userId,
    name: client.username,
    isCameraOn: client.state?.isCameraOn ?? true,
    isMicMuted: client.state?.isMicMuted ?? false,
    isHandRaised: client.state?.isHandRaised ?? false,
  }));

  const roomState = {
    type: 'room_state',
    participants,
    currentVideo: room.currentVideo || null,
    messages: room.messages || [],
  };

  ws.send(JSON.stringify(roomState));
}

wss.on('connection', (ws, req) => {
  const query = url.parse(req.url, true).query;
  const roomId = req.url.split('/room/')[1]?.split('?')[0];
  const userId = query.userId;
  const username = decodeURIComponent(query.username || 'Anonymous');

  if (!roomId || !userId) {
    ws.close(1008, 'Missing roomId or userId');
    return;
  }

  console.log(`${username} (${userId}) connected to room: ${roomId}`);

  // Initialize room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
    rooms.get(roomId).messages = [];
    rooms.get(roomId).currentVideo = null;
  }

  const room = rooms.get(roomId);
  
  // Add client to room
  room.set(userId, { 
    ws, 
    userId, 
    username,
    state: {
      isCameraOn: true,
      isMicMuted: false,
      isHandRaised: false,
    }
  });

  // Send current room state to new participant
  sendRoomState(ws, roomId);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'join':
          // Broadcast join event to others
          broadcastToRoom(roomId, message, userId);
          break;

        case 'leave':
          broadcastToRoom(roomId, message, userId);
          break;

        case 'chat':
          // Store message in room history
          const chatMessage = {
            id: message.timestamp,
            userId: message.userId,
            username: message.username,
            text: message.text,
          };
          room.messages.push(chatMessage);
          
          // Keep only last 100 messages
          if (room.messages.length > 100) {
            room.messages.shift();
          }

          // Broadcast to all others
          broadcastToRoom(roomId, message, userId);
          break;

        case 'playback':
          // Broadcast playback control to all others
          broadcastToRoom(roomId, message, userId);
          break;

        case 'participant_state':
          // Update participant state
          const participant = room.get(userId);
          if (participant) {
            participant.state = { ...participant.state, ...message.state };
          }
          
          // Broadcast state change to others
          broadcastToRoom(roomId, message, userId);
          break;

        case 'video_change':
          // Update room's current video
          room.currentVideo = message.videoId;
          
          // Broadcast to all others
          broadcastToRoom(roomId, message, userId);
          break;

        case 'reaction':
          // Broadcast reaction to all participants (including sender for animation)
          const reactionMessage = {
            type: 'reaction',
            userId: message.userId,
            username: message.username,
            emoji: message.emoji,
            timestamp: message.timestamp,
          };
          // Broadcast to everyone including sender
          room.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(JSON.stringify(reactionMessage));
            }
          });
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`${username} (${userId}) disconnected from room: ${roomId}`);
    
    // Remove client from room
    room.delete(userId);

    // Broadcast leave event
    broadcastToRoom(roomId, {
      type: 'leave',
      userId,
      username,
      timestamp: Date.now(),
    });

    // Clean up empty rooms
    if (room.size === 0) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
