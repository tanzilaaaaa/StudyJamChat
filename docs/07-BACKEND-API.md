# Backend API Documentation

## 🌐 Overview

The StudyJam backend is a Node.js + Express + Socket.io server that handles real-time chat functionality, message persistence, and file sharing.

**Live Server**: https://studyjamchat.onrender.com

---

## 🏗️ Architecture

```
Client (React Native App)
    ↓
Socket.io Connection
    ↓
Backend Server (Express + Socket.io)
    ↓
File Storage (rooms-data.json)
```

---

## 📡 Socket.io Events

### **Client → Server Events**

#### 1. `join-room`
Join a chat room to start receiving messages.

**Payload:**
```javascript
{
  roomId: "web-dev-study-group",
  userId: "user-123",
  userName: "John Doe"
}
```

**Response:**
Server emits `room-history` with all previous messages.

**Example:**
```javascript
socketService.joinRoom('web-dev-study-group');
```

---

#### 2. `send-message`
Send a new message to a room.

**Payload:**
```javascript
{
  roomId: "web-dev-study-group",
  message: {
    id: "1234567890",
    text: "Hello everyone!",
    userId: "user-123",
    userName: "John Doe",
    timestamp: "2024-12-07T10:30:00Z",
    reactions: [],
    fileInfo: {  // Optional
      name: "document.pdf",
      size: 123456,
      type: "application/pdf",
      base64: "base64-encoded-file-data"
    }
  }
}
```

**Response:**
Server broadcasts `new-message` to all clients in the room.

**Example:**
```javascript
socketService.sendMessage(roomId, {
  id: Date.now().toString(),
  text: "Hello!",
  userId: currentUser.uid,
  userName: currentUser.displayName,
  timestamp: new Date().toISOString(),
  reactions: []
});
```

---

#### 3. `pin-message`
Pin a message to the room's pinboard.

**Payload:**
```javascript
{
  roomId: "web-dev-study-group",
  message: {
    id: "1234567890",
    text: "Important announcement",
    userId: "user-123",
    userName: "John Doe",
    timestamp: "2024-12-07T10:30:00Z"
  }
}
```

**Response:**
Server broadcasts `message-pinned` to all clients.

**Example:**
```javascript
socketService.pinMessage(roomId, message);
```

---

#### 4. `unpin-message`
Remove a message from the pinboard.

**Payload:**
```javascript
{
  roomId: "web-dev-study-group",
  messageId: "1234567890"
}
```

**Response:**
Server broadcasts `message-unpinned` to all clients.

**Example:**
```javascript
socketService.unpinMessage(roomId, messageId);
```

---

#### 5. `delete-messages`
Delete multiple messages from a room.

**Payload:**
```javascript
{
  roomId: "web-dev-study-group",
  messageIds: ["1234567890", "0987654321"]
}
```

**Response:**
Server broadcasts `messages-deleted` to all clients.

**Example:**
```javascript
socketService.deleteMessages(roomId, selectedMessageIds);
```

---

#### 6. `leave-room`
Leave a chat room (stop receiving messages).

**Payload:**
```javascript
{
  roomId: "web-dev-study-group"
}
```

**Example:**
```javascript
socketService.leaveRoom(roomId);
```

---

### **Server → Client Events**

#### 1. `room-history`
Sent when a client joins a room. Contains all previous messages and pinned messages.

**Payload:**
```javascript
{
  messages: [
    {
      id: "1234567890",
      text: "Hello!",
      userId: "user-123",
      userName: "John Doe",
      timestamp: "2024-12-07T10:30:00Z",
      reactions: []
    }
  ],
  pinnedMessages: [
    {
      id: "0987654321",
      text: "Important info",
      userId: "user-456",
      userName: "Jane Smith",
      timestamp: "2024-12-07T09:00:00Z"
    }
  ]
}
```

**Listen:**
```javascript
socketService.onRoomHistory((data) => {
  setMessages(data.messages);
  setPinnedMessages(data.pinnedMessages);
});
```

---

#### 2. `new-message`
Broadcast when someone sends a message.

**Payload:**
```javascript
{
  id: "1234567890",
  text: "Hello everyone!",
  userId: "user-123",
  userName: "John Doe",
  timestamp: "2024-12-07T10:30:00Z",
  reactions: [],
  fileInfo: {  // Optional
    name: "document.pdf",
    size: 123456,
    type: "application/pdf",
    base64: "..."
  }
}
```

**Listen:**
```javascript
socketService.onNewMessage((message) => {
  setMessages(prev => [...prev, message]);
});
```

---

#### 3. `message-pinned`
Broadcast when a message is pinned.

**Payload:**
```javascript
{
  id: "1234567890",
  text: "Important announcement",
  userId: "user-123",
  userName: "John Doe",
  timestamp: "2024-12-07T10:30:00Z"
}
```

**Listen:**
```javascript
socketService.onMessagePinned((message) => {
  setPinnedMessages(prev => [...prev, message]);
});
```

---

#### 4. `message-unpinned`
Broadcast when a message is unpinned.

**Payload:**
```javascript
{
  messageId: "1234567890"
}
```

**Listen:**
```javascript
socketService.onMessageUnpinned((data) => {
  setPinnedMessages(prev => 
    prev.filter(msg => msg.id !== data.messageId)
  );
});
```

---

#### 5. `messages-deleted`
Broadcast when messages are deleted.

**Payload:**
```javascript
{
  messageIds: ["1234567890", "0987654321"]
}
```

**Listen:**
```javascript
socketService.onMessagesDeleted((data) => {
  setMessages(prev => 
    prev.filter(msg => !data.messageIds.includes(msg.id))
  );
});
```

---

#### 6. `connect`
Fired when socket successfully connects to server.

**Listen:**
```javascript
socket.on('connect', () => {
  console.log('Connected to server');
});
```

---

#### 7. `disconnect`
Fired when socket disconnects from server.

**Listen:**
```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

---

## 📁 Data Persistence

### **Storage File: `rooms-data.json`**

The server stores all chat data in a JSON file with this structure:

```json
{
  "web-dev-study-group": {
    "messages": [
      {
        "id": "1234567890",
        "text": "Hello!",
        "userId": "user-123",
        "userName": "John Doe",
        "timestamp": "2024-12-07T10:30:00Z",
        "reactions": []
      }
    ],
    "pinnedMessages": [
      {
        "id": "0987654321",
        "text": "Important",
        "userId": "user-456",
        "userName": "Jane Smith",
        "timestamp": "2024-12-07T09:00:00Z"
      }
    ]
  },
  "database-study-group": {
    "messages": [],
    "pinnedMessages": []
  }
}
```

### **How It Works:**

1. **On server start:** Reads `rooms-data.json`
2. **On new message:** Adds to memory and saves to file
3. **On pin/unpin:** Updates memory and saves to file
4. **On delete:** Removes from memory and saves to file

### **Benefits:**
- Messages persist across server restarts
- No database needed
- Simple and fast
- Easy to backup

---

## 🔧 Server Configuration

### **Environment Variables**

```bash
PORT=3000                    # Server port (default: 3000)
NODE_ENV=production          # Environment (development/production)
```

### **CORS Configuration**

The server allows connections from:
- `http://localhost:8081` (Expo development)
- `http://192.168.*.*:8081` (Local network)
- Any origin in production

```javascript
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || 
        origin.includes('localhost') || 
        origin.includes('192.168') ||
        process.env.NODE_ENV === 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
```

---

## 🚀 Running the Server

### **Development**

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:3000`

### **Production**

```bash
cd backend
npm install
npm start
```

Server runs on port specified by `PORT` environment variable.

---

## 📊 Server Endpoints

### **REST API**

#### `GET /`
Health check endpoint.

**Response:**
```json
{
  "message": "StudyJam Chat Server is running",
  "timestamp": "2024-12-07T10:30:00Z"
}
```

**Example:**
```bash
curl https://studyjamchat.onrender.com
```

---

#### `GET /rooms`
Get list of all chat rooms.

**Response:**
```json
{
  "rooms": [
    "web-dev-study-group",
    "database-study-group",
    "algorithms-study-group"
  ]
}
```

**Example:**
```bash
curl https://studyjamchat.onrender.com/rooms
```

---

#### `GET /rooms/:roomId`
Get messages and pinned messages for a specific room.

**Response:**
```json
{
  "roomId": "web-dev-study-group",
  "messages": [...],
  "pinnedMessages": [...]
}
```

**Example:**
```bash
curl https://studyjamchat.onrender.com/rooms/web-dev-study-group
```

---

## 🔐 Security Considerations

### **Current Implementation**

The current server has minimal security:
- No authentication required
- Anyone can send/delete messages
- No rate limiting
- No message validation

### **Recommended Improvements**

For production use, consider adding:

1. **Authentication:**
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (isValidToken(token)) {
    next();
  } else {
    next(new Error('Authentication error'));
  }
});
```

2. **Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

3. **Message Validation:**
```javascript
socket.on('send-message', (data) => {
  if (!data.message.text || data.message.text.length > 1000) {
    return socket.emit('error', 'Invalid message');
  }
  // Process message
});
```

4. **File Size Limits:**
```javascript
if (fileInfo && fileInfo.base64.length > 10 * 1024 * 1024) {
  return socket.emit('error', 'File too large');
}
```

---

## 🐛 Error Handling

### **Connection Errors**

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Retry connection
});
```

### **Server Errors**

```javascript
socket.on('error', (error) => {
  console.error('Server error:', error);
  Alert.alert('Error', error.message);
});
```

### **Timeout Handling**

```javascript
const timeout = setTimeout(() => {
  if (!socket.connected) {
    console.log('Connection timeout');
    socket.disconnect();
  }
}, 10000);

socket.on('connect', () => {
  clearTimeout(timeout);
});
```

---

## 📈 Performance Optimization

### **Current Optimizations**

1. **In-memory storage:** Fast message retrieval
2. **Batch saves:** Only save to file when needed
3. **Room-based broadcasting:** Only send to relevant clients

### **Potential Improvements**

1. **Database:** Use MongoDB or PostgreSQL for better scalability
2. **Caching:** Use Redis for frequently accessed data
3. **Message pagination:** Load messages in chunks
4. **Compression:** Compress large files before sending

---

## 🧪 Testing the API

### **Using Socket.io Client**

```javascript
const io = require('socket.io-client');
const socket = io('https://studyjamchat.onrender.com');

socket.on('connect', () => {
  console.log('Connected!');
  
  // Join room
  socket.emit('join-room', {
    roomId: 'test-room',
    userId: 'test-user',
    userName: 'Test User'
  });
  
  // Send message
  socket.emit('send-message', {
    roomId: 'test-room',
    message: {
      id: Date.now().toString(),
      text: 'Test message',
      userId: 'test-user',
      userName: 'Test User',
      timestamp: new Date().toISOString(),
      reactions: []
    }
  });
});

socket.on('new-message', (message) => {
  console.log('Received:', message);
});
```

### **Using curl**

```bash
# Health check
curl https://studyjamchat.onrender.com

# Get rooms
curl https://studyjamchat.onrender.com/rooms

# Get room data
curl https://studyjamchat.onrender.com/rooms/web-dev-study-group
```

---

## 📝 Summary

The StudyJam backend provides:
- Real-time bidirectional communication via Socket.io
- Message persistence in JSON file
- Room-based chat organization
- Pin/unpin functionality
- Message deletion
- File sharing support
- Simple REST API for room information

The server is deployed on Render and accessible at https://studyjamchat.onrender.com.
