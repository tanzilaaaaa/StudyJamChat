# StudyJam Chat: Complete Project Setup Guide

## Project Structure
```
studyjam/
├── app/                    # React Native frontend (Expo)
│   ├── login.js
│   ├── signup.js
│   ├── dashboard.js
│   ├── chat-room.js       # TO BE CREATED
│   ├── pinboard.js        # TO BE CREATED
│   └── layout.js
├── backend/               # Node.js + Socket.io backend
│   ├── server.js
│   ├── package.json
│   └── README.md
├── src/
│   ├── firebaseConfig.js
│   ├── socketService.js   # TO BE CREATED
│   └── api.js             # TO BE CREATED
└── package.json
```

## Week 1: ✅ COMPLETED
- Authentication (Login/Signup with Firebase)
- Dashboard UI
- Basic navigation

## Week 2: Backend + Real-time Chat (IN PROGRESS)

### Step 1: Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm run dev
```

Server will run on `http://localhost:3000`

### Step 2: Frontend Setup

1. Go back to root directory:
```bash
cd ..
```

2. Install Socket.io client:
```bash
npm install socket.io-client
```

3. Install document picker for file sharing:
```bash
npx expo install expo-document-picker
```

### Step 3: Test the Connection

1. Start backend server (in one terminal):
```bash
cd backend
npm run dev
```

2. Start Expo app (in another terminal):
```bash
npm start
```

## Features Implementation Status

### Week 1 ✅
- [x] User Authentication
- [x] Login/Signup UI
- [x] Dashboard UI
- [x] Firebase Integration

### Week 2 🚧
- [x] Backend server setup
- [x] Socket.io integration
- [ ] Chat room UI
- [ ] Real-time messaging
- [ ] Message list with virtualization

### Week 3 📅
- [ ] Pin/Unpin messages
- [ ] Pinboard screen
- [ ] File picker integration
- [ ] File sharing
- [ ] Message reactions

### Week 4 📅
- [ ] Testing & QA
- [ ] Bug fixes
- [ ] Documentation
- [ ] Demo video
- [ ] APK build

## API Configuration

Update your backend URL in the frontend:
- Development: `http://localhost:3000`
- Production: Your deployed backend URL

## Next Steps

1. Run backend server
2. Test Socket.io connection
3. Implement chat room UI
4. Connect frontend to backend
5. Test real-time messaging

## Troubleshooting

### Backend won't start
- Make sure port 3000 is not in use
- Check if Node.js is installed: `node --version`

### Socket.io connection fails
- Verify backend is running
- Check the backend URL in frontend code
- Ensure CORS is properly configured

### Expo app crashes
- Clear cache: `npm start -- --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
