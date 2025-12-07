# StudyJam Backend Server

Backend server for StudyJam Chat application with real-time messaging using Socket.io.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:3000`

## API Endpoints

### REST API
- `GET /api/rooms` - Get all chat rooms
- `GET /api/rooms/:roomId` - Get specific room details

### Socket.io Events

#### Client → Server
- `join-room` - Join a chat room
- `send-message` - Send a message
- `pin-message` - Pin a message
- `unpin-message` - Unpin a message
- `add-reaction` - Add reaction to message

#### Server → Client
- `room-messages` - Receive all messages in room
- `pinned-messages` - Receive pinned messages
- `new-message` - Receive new message
- `message-pinned` - Message was pinned
- `message-unpinned` - Message was unpinned
- `reaction-added` - Reaction was added

## Project Structure
```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env              # Environment variables
└── README.md         # Documentation
```
