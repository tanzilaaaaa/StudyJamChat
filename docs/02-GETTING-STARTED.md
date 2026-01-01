# Getting Started

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js**: v18.0.0 or higher
  ```bash
  node --version  # Should be v18+
  ```

- **npm**: v8.0.0 or higher
  ```bash
  npm --version
  ```

- **Git**: Latest version
  ```bash
  git --version
  ```

### Optional (for mobile testing)
- **Expo Go App**: Download from App Store or Play Store
- **Android Studio**: For Android emulator
- **Xcode**: For iOS simulator (Mac only)

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/tanzilaaaaa/StudyJamChat.git
cd StudyJamChat
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 3: Firebase Setup

1. **Create Firebase Project**:
   - Go to https://console.firebase.google.com
   - Click "Add Project"
   - Follow the setup wizard

2. **Enable Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"

3. **Create Firestore Database**:
   - Go to Firestore Database
   - Click "Create Database"
   - Start in test mode

4. **Get Firebase Config**:
   - Go to Project Settings → General
   - Scroll to "Your apps"
   - Click "Web" icon
   - Copy the config object

5. **Update Firebase Config**:
   - Open `src/firebaseConfig.js`
   - Replace the config with your values:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

---

## 🏃 Running the Application

### Option 1: Run on Mobile Device (Recommended)

1. **Install Expo Go**:
   - iOS: Download from App Store
   - Android: Download from Play Store

2. **Start the Development Server**:
   ```bash
   npx expo start
   ```

3. **Scan QR Code**:
   - iOS: Use Camera app to scan QR code
   - Android: Use Expo Go app to scan QR code

4. **Start Backend Server** (in a new terminal):
   ```bash
   cd backend
   npm run dev
   ```

### Option 2: Run on Web

```bash
# Start frontend
npx expo start --web

# Start backend (in new terminal)
cd backend
npm run dev
```

Open http://localhost:8081 in your browser

### Option 3: Run on Emulator

**Android Emulator**:
```bash
npx expo start --android
```

**iOS Simulator** (Mac only):
```bash
npx expo start --ios
```

---

## 🔧 Configuration

### Update Backend URL

For mobile testing, update the IP address in `src/socketService.js`:

```javascript
// Find your computer's IP address
// Mac/Linux: ifconfig | grep "inet "
// Windows: ipconfig

const SOCKET_URL = isWeb
  ? 'http://localhost:4000' 
  : 'http://YOUR_IP_ADDRESS:4000';  // Replace with your IP
```

### Environment Variables (Optional)

Create `.env` file in root:
```env
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
```

---

## 📱 First Time Setup

### 1. Create Admin Account

```bash
# Run the app
npx expo start

# Navigate to Admin Signup
# Use these credentials:
Email: admin@studyjam.com
Password: admin123
Name: Admin User
```

### 2. Create Student Account

```bash
# Navigate to Student Signup
Email: student@studyjam.com
Password: student123
Name: Student User
Major: Computer Science
Year: Junior
```

### 3. Test Features

- ✅ Login with both accounts
- ✅ Create a course (admin)
- ✅ Join a study group
- ✅ Send a message in chat
- ✅ Create a note
- ✅ View profile

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend"

**Solution**:
1. Check backend is running: `cd backend && npm run dev`
2. Verify IP address in `socketService.js`
3. Ensure phone and computer on same WiFi

### Issue: "Firebase error"

**Solution**:
1. Check Firebase config in `src/firebaseConfig.js`
2. Verify Firebase project is active
3. Check Authentication is enabled

### Issue: "Module not found"

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

### Issue: "Port already in use"

**Solution**:
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or use different port in backend/server.js
const PORT = process.env.PORT || 5000;
```

---

## 📂 Project Structure

```
StudyJamChat/
├── app/                    # App screens (Expo Router)
│   ├── index.js           # Landing page
│   ├── login.js           # Student login
│   ├── signup.js          # Student signup
│   ├── admin-login.js     # Admin login
│   ├── dashboard.js       # Main dashboard
│   ├── chat-room.js       # Chat interface
│   ├── course-detail.js   # Course details
│   ├── notes.js           # Notes list
│   └── profile.js         # User profile
├── backend/               # Backend server
│   ├── server.js          # Express + Socket.io
│   ├── package.json       # Backend dependencies
│   └── rooms-data.json    # Chat data storage
├── src/                   # Source utilities
│   ├── firebaseConfig.js  # Firebase setup
│   ├── socketService.js   # Socket.io client
│   └── storage.js         # AsyncStorage utils
├── components/            # Reusable components
│   ├── InputModal.js      # Input dialog
│   └── TwoInputModal.js   # Two-field dialog
├── docs/                  # Documentation
├── package.json           # Frontend dependencies
└── app.json              # Expo configuration
```

---

## 🎯 Next Steps

1. ✅ **Explore the App**: Try all features
2. ✅ **Read Architecture**: Understand the design
3. ✅ **Check Code Structure**: Learn the codebase
4. ✅ **Try Building APK**: Create production build

---

## 📚 Useful Commands

```bash
# Start development
npx expo start

# Start on specific platform
npx expo start --web
npx expo start --android
npx expo start --ios

# Clear cache
npx expo start --clear

# Build APK
eas build -p android --profile preview-apk

# Backend commands
cd backend
npm run dev          # Development with nodemon
npm start            # Production
```

---

## 🔗 Helpful Links

- **Expo Docs**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **Firebase Docs**: https://firebase.google.com/docs
- **Socket.io Docs**: https://socket.io/docs

---

**Next**: [Architecture Guide →](./03-ARCHITECTURE.md)
