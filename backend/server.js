const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// File path for persistent storage
const DATA_FILE = path.join(__dirname, 'rooms-data.json');

// Load rooms from file or initialize with defaults
let rooms = {};

function loadRooms() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      rooms = JSON.parse(data);
      console.log('Loaded rooms from file:', Object.keys(rooms));
    } else {
      // Initialize with default rooms
      rooms = {
        'web-dev-study-group': {
          id: 'web-dev-study-group',
          name: 'Web Dev Study Group',
          messages: [],
          pinnedMessages: []
        },
        'database-project-team': {
          id: 'database-project-team',
          name: 'Database Project Team',
          messages: [],
          pinnedMessages: []
        }
      };
      saveRooms();
      console.log('Initialized default rooms');
    }
  } catch (error) {
    console.error('Error loading rooms:', error);
    rooms = {};
  }
}

function saveRooms() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(rooms, null, 2), 'utf8');
    console.log('Saved rooms to file');
  } catch (error) {
    console.error('Error saving rooms:', error);
  }
}

// Load rooms on startup
loadRooms();

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    
    // Create room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {
        id: roomId,
        name: roomId,
        messages: [],
        pinnedMessages: []
      };
      saveRooms(); // Persist to file
      console.log(`Created new room: ${roomId}`);
    }
    
    // Send existing messages to the user
    socket.emit('room-messages', rooms[roomId].messages);
    socket.emit('pinned-messages', rooms[roomId].pinnedMessages);
  });

  // Send message
  socket.on('send-message', (data) => {
    const { roomId, message } = data;
    
    if (rooms[roomId]) {
      const newMessage = {
        id: Date.now().toString(),
        text: message.text,
        userId: message.userId,
        userName: message.userName,
        timestamp: new Date().toISOString(),
        reactions: [],
        ...(message.fileInfo && { fileInfo: message.fileInfo })
      };
      
      rooms[roomId].messages.push(newMessage);
      saveRooms(); // Persist to file
      
      // Broadcast to all users in the room
      io.to(roomId).emit('new-message', newMessage);
    }
  });

  // Pin message
  socket.on('pin-message', (data) => {
    const { roomId, messageId } = data;
    
    if (rooms[roomId]) {
      const message = rooms[roomId].messages.find(m => m.id === messageId);
      if (message && !rooms[roomId].pinnedMessages.find(p => p.id === messageId)) {
        rooms[roomId].pinnedMessages.push(message);
        saveRooms(); // Persist to file
        io.to(roomId).emit('message-pinned', message);
      }
    }
  });

  // Unpin message
  socket.on('unpin-message', (data) => {
    const { roomId, messageId } = data;
    console.log(`Unpin request received - Room: ${roomId}, Message: ${messageId}`);
    
    if (rooms[roomId]) {
      const beforeCount = rooms[roomId].pinnedMessages.length;
      rooms[roomId].pinnedMessages = rooms[roomId].pinnedMessages.filter(
        m => m.id !== messageId
      );
      const afterCount = rooms[roomId].pinnedMessages.length;
      console.log(`Pinned messages: ${beforeCount} -> ${afterCount}`);
      
      saveRooms(); // Persist to file
      io.to(roomId).emit('message-unpinned', messageId);
      console.log(`Broadcasted unpin event for message: ${messageId}`);
    } else {
      console.log(`Room ${roomId} not found`);
    }
  });

  // Add reaction
  socket.on('add-reaction', (data) => {
    const { roomId, messageId, emoji, userId } = data;
    
    if (rooms[roomId]) {
      const message = rooms[roomId].messages.find(m => m.id === messageId);
      if (message) {
        const existingReaction = message.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (!existingReaction.users.includes(userId)) {
            existingReaction.users.push(userId);
            existingReaction.count++;
          }
        } else {
          message.reactions.push({
            emoji,
            users: [userId],
            count: 1
          });
        }
        saveRooms(); // Persist to file
        io.to(roomId).emit('reaction-added', { messageId, reactions: message.reactions });
      }
    }
  });

  // Delete messages
  socket.on('delete-messages', (data) => {
    const { roomId, messageIds } = data;
    console.log(`Delete request received - Room: ${roomId}, Messages: ${messageIds.length}`);
    
    if (rooms[roomId]) {
      const beforeCount = rooms[roomId].messages.length;
      
      // Remove messages from messages array
      rooms[roomId].messages = rooms[roomId].messages.filter(
        m => !messageIds.includes(m.id)
      );
      
      // Also remove from pinned messages if they were pinned
      rooms[roomId].pinnedMessages = rooms[roomId].pinnedMessages.filter(
        m => !messageIds.includes(m.id)
      );
      
      const afterCount = rooms[roomId].messages.length;
      console.log(`Messages: ${beforeCount} -> ${afterCount}`);
      
      saveRooms(); // Persist to file
      io.to(roomId).emit('messages-deleted', messageIds);
      console.log(`Broadcasted delete event for ${messageIds.length} messages`);
    } else {
      console.log(`Room ${roomId} not found`);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// REST API endpoints
app.get('/api/rooms', (req, res) => {
  const roomList = Object.values(rooms).map(room => ({
    id: room.id,
    name: room.name,
    messageCount: room.messages.length,
    pinnedCount: room.pinnedMessages.length
  }));
  res.json(roomList);
});

app.get('/api/rooms/:roomId', (req, res) => {
  const room = rooms[req.params.roomId];
  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
