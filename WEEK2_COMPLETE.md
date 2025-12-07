# Week 2: Backend + Real-time Chat - COMPLETE! ✅

## What We Built

### Backend
- ✅ Express + Socket.io server
- ✅ Real-time messaging
- ✅ Room management (3 courses)
- ✅ Message pinning
- ✅ In-memory storage

### Frontend
- ✅ Socket service for connection management
- ✅ Chat room screen with real-time messaging
- ✅ Pinboard screen for pinned messages
- ✅ Dashboard navigation to chat rooms

## How to Test

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
You should see: `Server running on port 3000`

### 2. Start Frontend (Terminal 2)
```bash
npm start
```

### 3. Test the Flow
1. Login to the app
2. Click on any course card (Web Development, Database Systems, or Data Analytics)
3. You'll enter the chat room
4. Type a message and click "Send"
5. Long-press any message to pin it
6. Click the 📌 button in header to see pinned messages

## Features Working

✅ **Real-time Messaging**
- Send messages instantly
- Messages appear for all users in the room
- Auto-scroll to latest message

✅ **Message Pinning**
- Long-press message → Pin
- View all pinned messages in Pinboard
- Unpin from Pinboard

✅ **Multiple Rooms**
- 3 separate chat rooms (courses)
- Each room has independent messages
- Room-specific pinboards

## Testing with Multiple Users

To test real-time features with multiple users:

1. Open the app on multiple devices/simulators
2. Login with different accounts
3. Join the same chat room
4. Send messages from one device
5. See them appear instantly on other devices

## Socket.io Connection

The app connects to: `http://localhost:3000`

**Note:** If testing on a physical device, change the URL in `src/socketService.js` to your computer's IP address:
```javascript
const SOCKET_URL = 'http://YOUR_IP_ADDRESS:3000';
```

Find your IP:
- Mac: System Preferences → Network
- Windows: `ipconfig` in command prompt

## Next Steps (Week 3)

- [ ] File sharing with document picker
- [ ] Message reactions (emoji)
- [ ] Link previews
- [ ] User typing indicators
- [ ] Read receipts

## Code Structure

```
Frontend:
- app/chat-room.js      → Chat UI with messaging
- app/pinboard.js       → Pinned messages view
- app/dashboard.js      → Course list (updated)
- src/socketService.js  → Socket.io connection manager

Backend:
- backend/server.js     → Express + Socket.io server
```

## Troubleshooting

**Messages not sending?**
- Check backend is running
- Check console for socket connection logs
- Verify Socket URL in socketService.js

**Can't connect to backend?**
- Make sure port 3000 is not blocked
- Try restarting both backend and frontend
- Check firewall settings

**App crashes?**
- Clear cache: `npm start -- --clear`
- Check for any console errors

## Demo for Viva

**What to show:**
1. Backend server running
2. Login to app
3. Navigate to a course chat room
4. Send messages in real-time
5. Pin a message
6. View pinboard
7. Explain Socket.io connection

**What to explain:**
- How Socket.io enables real-time communication
- Event-driven architecture (emit/on)
- Room concept for separating courses
- Message flow: Client → Server → All clients in room

Great job! Week 2 is complete! 🎉
