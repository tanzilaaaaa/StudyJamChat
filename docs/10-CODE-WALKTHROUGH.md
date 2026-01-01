# Code Walkthrough - Understanding the Codebase

## 📚 Table of Contents

1. [Project Structure Overview](#project-structure-overview)
2. [Core Configuration Files](#core-configuration-files)
3. [Authentication System](#authentication-system)
4. [Screen Components](#screen-components)
5. [Real-Time Chat System](#real-time-chat-system)
6. [Data Storage](#data-storage)
7. [Backend Server](#backend-server)
8. [How Everything Connects](#how-everything-connects)

---

## 🏗️ Project Structure Overview

```
StudyJamChat/
├── app/                    # All screen components (pages)
│   ├── index.js           # Welcome/landing screen
│   ├── login.js           # Student login
│   ├── signup.js          # Student signup
│   ├── admin-login.js     # Admin login
│   ├── admin-signup.js    # Admin signup
│   ├── dashboard.js       # Student dashboard
│   ├── admin-dashboard.js # Admin dashboard
│   ├── chat-room.js       # Real-time chat interface
│   ├── pinboard.js        # Pinned messages
│   ├── course-detail.js   # Course information
│   ├── notes.js           # Notes list
│   ├── note-editor.js     # Note editing
│   └── profile.js         # User profile
│
├── src/                    # Core utilities and services
│   ├── firebaseConfig.js  # Firebase setup & auth functions
│   ├── socketService.js   # Socket.io chat service
│   └── storage.js         # AsyncStorage helpers
│
├── backend/                # Node.js server
│   ├── server.js          # Express + Socket.io server
│   └── rooms-data.json    # Chat messages storage
│
├── components/             # Reusable UI components
│   ├── InputModal.js      # Custom input popup
│   └── TwoInputModal.js   # Two-field input popup
│
└── Configuration files
    ├── package.json       # Dependencies
    ├── app.json          # Expo configuration
    └── eas.json          # Build configuration
```

---

## ⚙️ Core Configuration Files


### **package.json** - Dependencies Manager

This file lists all the libraries your app needs:

```json
{
  "dependencies": {
    "expo": "~54.0.23",                    // Expo framework
    "react-native": "0.81.5",              // React Native core
    "firebase": "^10.7.1",                 // Firebase for auth
    "socket.io-client": "^4.8.1",          // Real-time chat
    "expo-router": "~6.0.14",              // Navigation
    "@react-native-async-storage/async-storage": "^2.1.0",  // Local storage
    "expo-document-picker": "~12.0.2",     // File picker
    "expo-file-system": "~18.0.6"          // File handling
  }
}
```

**What each does:**
- **expo**: The framework that makes React Native easier
- **firebase**: Handles user accounts and authentication
- **socket.io-client**: Enables real-time messaging
- **expo-router**: Manages navigation between screens
- **async-storage**: Saves data locally on the device
- **document-picker**: Lets users pick files to share
- **file-system**: Reads and writes files

---

### **app.json** - App Configuration

```json
{
  "expo": {
    "name": "Studyjam",                    // App name
    "slug": "Studyjam",                    // URL-friendly name
    "version": "1.0.0",                    // App version
    "scheme": "studyjam",                  // Deep linking scheme
    "android": {
      "package": "com.tanzisprvv.Studyjam",  // Unique Android ID
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png"
      }
    },
    "plugins": [
      "expo-router"                        // Enable file-based routing
    ]
  }
}
```

**Key points:**
- `name`: What users see on their phone
- `package`: Must be unique (like your app's fingerprint)
- `scheme`: Allows deep links like `studyjam://chat-room`
- `plugins`: Adds extra functionality to Expo

---

## 🔐 Authentication System


### **src/firebaseConfig.js** - The Authentication Brain

This file handles ALL authentication logic. Let's break it down:

#### **1. Firebase Initialization**

```javascript
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyBLhMJxxx...",           // Identifies your project
  authDomain: "studyjam-xxx.firebaseapp.com",
  projectId: "studyjam-xxx",
  storageBucket: "studyjam-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxx"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence (keeps user logged in)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore (database)
const db = getFirestore(app);
```

**What's happening:**
1. Import Firebase libraries
2. Configure with your project details (from Firebase Console)
3. Initialize the app
4. Set up auth with AsyncStorage so users stay logged in
5. Connect to Firestore database

---

#### **2. Signup Function**

```javascript
export const signupWithEmail = async (email, password, name, role, additionalData = {}) => {
  try {
    // Step 1: Create user account in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Update user's display name
    await updateProfile(user, { displayName: name });

    // Step 3: Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: name,
      email: email,
      role: role,              // 'student' or 'admin'
      createdAt: new Date().toISOString(),
      ...additionalData        // major, year, etc.
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

**Step-by-step:**
1. **createUserWithEmailAndPassword**: Creates account in Firebase Auth
2. **updateProfile**: Sets the user's display name
3. **setDoc**: Saves additional info (role, major, etc.) to Firestore
4. Returns success or error

**Why two places?**
- **Firebase Auth**: Handles login/logout (email + password)
- **Firestore**: Stores extra info (role, major, year)

---

#### **3. Login Function**

```javascript
export const loginWithEmail = async (email, password) => {
  try {
    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

**Simple process:**
1. Firebase checks if email + password match
2. If yes, returns user object
3. If no, returns error

---

#### **4. Get User Role Function**

```javascript
export const getUserRole = async (userId) => {
  try {
    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      return userDoc.data().role;  // Returns 'student' or 'admin'
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};
```

**How it works:**
1. Looks up user in Firestore by their ID
2. Gets the `role` field
3. Returns 'student' or 'admin'

**Used for:**
- Deciding which dashboard to show
- Checking permissions before actions

---

#### **5. Logout Function**

```javascript
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

**What happens:**
1. Firebase signs out the user
2. Auth state changes to null
3. App redirects to login screen

---

## 📱 Screen Components


### **app/index.js** - Welcome Screen

This is the first screen users see.

```javascript
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* App Logo */}
      <Image 
        source={require('../assets/images/icon.png')} 
        style={styles.logo}
      />
      
      <Text style={styles.title}>Welcome to StudyJam</Text>
      
      {/* Student Login Button */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>Student Login</Text>
      </TouchableOpacity>
      
      {/* Admin Login Button */}
      <TouchableOpacity 
        style={[styles.button, styles.adminButton]}
        onPress={() => router.push('/admin-login')}
      >
        <Text style={styles.buttonText}>Admin Login</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Key concepts:**
- **useRouter**: Hook for navigation (like changing pages)
- **router.push('/login')**: Goes to login screen
- **TouchableOpacity**: Clickable button with fade effect
- **styles**: Styling object (like CSS)

**Flow:**
1. User opens app
2. Sees welcome screen
3. Chooses Student or Admin
4. Goes to respective login screen

---

### **app/login.js** - Student Login Screen

Let's break down the login logic:

```javascript
import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { loginWithEmail, getUserRole } from '../src/firebaseConfig';

export default function LoginScreen() {
  const router = useRouter();
  
  // State variables (data that can change)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);

    // Step 1: Try to login
    const result = await loginWithEmail(email, password);

    if (result.success) {
      // Step 2: Check user role
      const role = await getUserRole(result.user.uid);

      // Step 3: Verify it's a student
      if (role === 'student') {
        router.replace('/dashboard');  // Go to student dashboard
      } else {
        Alert.alert('Error', 'This account is not a student account');
        await logout();  // Log them out
      }
    } else {
      Alert.alert('Login Failed', result.error);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Login</Text>
      
      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}  // Updates email state
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}  // Updates password state
        secureTextEntry  // Hides password
      />
      
      {/* Login Button */}
      <TouchableOpacity 
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
      
      {/* Signup Link */}
      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Key concepts:**

**useState Hook:**
```javascript
const [email, setEmail] = useState('');
```
- `email`: Current value
- `setEmail`: Function to update value
- `''`: Initial value (empty string)

**TextInput:**
```javascript
<TextInput
  value={email}              // Shows current value
  onChangeText={setEmail}    // Updates when user types
/>
```

**Login Flow:**
1. User enters email and password
2. Clicks "Login" button
3. `handleLogin` function runs
4. Calls `loginWithEmail` from firebaseConfig
5. If successful, checks role
6. If role is 'student', goes to dashboard
7. If role is 'admin', shows error and logs out

**Why check role?**
- Prevents admins from accessing student dashboard
- Keeps roles separate and secure

---

### **app/signup.js** - Student Signup Screen

```javascript
export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!name || !email || !password || !major || !year) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);

    // Create account with role 'student'
    const result = await signupWithEmail(
      email, 
      password, 
      name, 
      'student',  // Role is hardcoded as 'student'
      { major, year }  // Additional data
    );

    if (result.success) {
      Alert.alert('Success', 'Account created!');
      router.replace('/dashboard');
    } else {
      Alert.alert('Signup Failed', result.error);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput placeholder="Major" value={major} onChangeText={setMajor} />
      <TextInput placeholder="Year" value={year} onChangeText={setYear} />
      
      <TouchableOpacity onPress={handleSignup}>
        <Text>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Signup Flow:**
1. User fills in all fields
2. Clicks "Sign Up"
3. Calls `signupWithEmail` with role='student'
4. Creates account in Firebase
5. Saves additional data (major, year) to Firestore
6. Redirects to dashboard

**Admin signup is identical, but:**
- No major/year fields
- Role is 'admin' instead of 'student'
- Redirects to admin dashboard

---


### **app/dashboard.js** - Student Dashboard

This is the main hub after login. Let's understand it piece by piece:

```javascript
import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../src/firebaseConfig';
import { loadCourses, saveCourses, loadGroups, saveGroups } from '../src/storage';

export default function Dashboard() {
  const router = useRouter();
  const currentUser = auth.currentUser;  // Get logged-in user

  // State for data
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (currentUser) {
      // Load courses from AsyncStorage
      const savedCourses = await loadCourses(currentUser.uid);
      setCourses(savedCourses || []);
      setFilteredCourses(savedCourses || []);

      // Load groups from AsyncStorage
      const savedGroups = await loadGroups(currentUser.uid);
      setGroups(savedGroups || []);
      setFilteredGroups(savedGroups || []);
    }
  };

  // Search functionality
  useEffect(() => {
    if (searchQuery) {
      // Filter courses
      const filteredC = courses.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filteredC);

      // Filter groups
      const filteredG = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGroups(filteredG);
    } else {
      // Show all if no search
      setFilteredCourses(courses);
      setFilteredGroups(groups);
    }
  }, [searchQuery, courses, groups]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {currentUser?.displayName}!</Text>
        <TouchableOpacity onPress={() => router.push('/notifications')}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search courses or groups..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Courses Section */}
      <Text style={styles.sectionTitle}>My Courses</Text>
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/course-detail?id=${item.id}`)}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.code}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Study Groups Section */}
      <Text style={styles.sectionTitle}>Study Groups</Text>
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/chat-room?roomId=${item.id}&roomName=${item.name}`)}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
```

**Key concepts explained:**

**1. useEffect for loading data:**
```javascript
useEffect(() => {
  loadData();
}, []);  // Empty array = run once when component mounts
```

**2. FlatList for rendering lists:**
```javascript
<FlatList
  data={filteredCourses}           // Array of items
  keyExtractor={(item) => item.id} // Unique key for each item
  renderItem={({ item }) => (      // How to render each item
    <TouchableOpacity>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  )}
/>
```

**3. Navigation with parameters:**
```javascript
router.push(`/chat-room?roomId=${item.id}&roomName=${item.name}`)
```
This passes data to the next screen via URL parameters.

**4. Real-time search:**
```javascript
useEffect(() => {
  const filtered = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  setFilteredCourses(filtered);
}, [searchQuery, courses]);  // Runs when searchQuery or courses change
```

**Dashboard Flow:**
1. Component mounts
2. Loads courses and groups from AsyncStorage
3. Displays them in lists
4. User can search to filter
5. Click course → Go to course detail
6. Click group → Go to chat room

---

## 💬 Real-Time Chat System


### **src/socketService.js** - Real-Time Communication

This is the heart of the chat system. Let's understand how Socket.io works:

```javascript
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Connect to server
  async connect() {
    return new Promise((resolve, reject) => {
      // Determine server URL
      const SOCKET_URL = __DEV__
        ? 'http://192.168.1.100:3000'  // Local development
        : 'https://studyjamchat.onrender.com';  // Production

      // Create socket connection
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Connection successful
      this.socket.on('connect', () => {
        console.log('✅ Connected to server');
        this.isConnected = true;
        resolve();
      });

      // Connection failed
      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      // Disconnected
      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
        this.isConnected = false;
      });
    });
  }

  // Join a chat room
  joinRoom(roomId, userId, userName) {
    if (!this.socket) return;
    
    console.log(`📥 Joining room: ${roomId}`);
    this.socket.emit('join-room', { roomId, userId, userName });
  }

  // Leave a chat room
  leaveRoom(roomId) {
    if (!this.socket) return;
    
    console.log(`📤 Leaving room: ${roomId}`);
    this.socket.emit('leave-room', { roomId });
  }

  // Send a message
  sendMessage(roomId, message) {
    if (!this.socket) return;
    
    console.log(`💬 Sending message to ${roomId}:`, message);
    this.socket.emit('send-message', { roomId, message });
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (!this.socket) return;
    
    this.socket.on('new-message', (message) => {
      console.log('📨 Received message:', message);
      callback(message);
    });
  }

  // Listen for room history
  onRoomHistory(callback) {
    if (!this.socket) return;
    
    this.socket.on('room-history', (data) => {
      console.log('📚 Received room history:', data);
      callback(data);
    });
  }

  // Pin a message
  pinMessage(roomId, message) {
    if (!this.socket) return;
    
    console.log(`📌 Pinning message in ${roomId}`);
    this.socket.emit('pin-message', { roomId, message });
  }

  // Unpin a message
  unpinMessage(roomId, messageId) {
    if (!this.socket) return;
    
    console.log(`📍 Unpinning message ${messageId} in ${roomId}`);
    this.socket.emit('unpin-message', { roomId, messageId });
  }

  // Listen for pinned messages
  onMessagePinned(callback) {
    if (!this.socket) return;
    this.socket.on('message-pinned', callback);
  }

  onMessageUnpinned(callback) {
    if (!this.socket) return;
    this.socket.on('message-unpinned', callback);
  }

  // Delete messages
  deleteMessages(roomId, messageIds) {
    if (!this.socket) return;
    
    console.log(`🗑️ Deleting messages in ${roomId}:`, messageIds);
    this.socket.emit('delete-messages', { roomId, messageIds });
  }

  onMessagesDeleted(callback) {
    if (!this.socket) return;
    this.socket.on('messages-deleted', callback);
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

// Export single instance (singleton pattern)
export default new SocketService();
```

**Key concepts:**

**1. Singleton Pattern:**
```javascript
export default new SocketService();
```
Only ONE instance exists across the entire app. Everyone uses the same connection.

**2. Socket Events:**
- **emit**: Send data to server
- **on**: Listen for data from server

**3. Connection Flow:**
```
App → connect() → Server
      ↓
   Connected!
      ↓
   joinRoom('web-dev-study-group')
      ↓
   Server sends room history
      ↓
   Listen for new messages
```

**4. Message Flow:**
```
User types message
      ↓
sendMessage(roomId, message)
      ↓
Server receives it
      ↓
Server broadcasts to all in room
      ↓
onNewMessage() fires for everyone
      ↓
Message appears on screen
```

---


### **app/chat-room.js** - Chat Interface

This is where the magic happens. Let's break down the chat room:

```javascript
import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth } from '../src/firebaseConfig';
import socketService from '../src/socketService';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default function ChatRoom() {
  const { roomId, roomName } = useLocalSearchParams();  // Get params from URL
  const router = useRouter();
  const currentUser = auth.currentUser;
  const flatListRef = useRef(null);

  // State
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);

  // Connect and join room on mount
  useEffect(() => {
    const initChat = async () => {
      try {
        // Connect to socket server
        await socketService.connect();
        
        // Join this specific room
        socketService.joinRoom(roomId, currentUser.uid, currentUser.displayName);

        // Set up listeners
        setupListeners();
      } catch (error) {
        console.error('Failed to connect:', error);
        Alert.alert('Connection Error', 'Could not connect to chat server');
      }
    };

    initChat();

    // Cleanup on unmount
    return () => {
      socketService.leaveRoom(roomId);
    };
  }, [roomId]);

  const setupListeners = () => {
    // Listen for room history (previous messages)
    socketService.onRoomHistory((data) => {
      setMessages(data.messages || []);
      setPinnedMessages(data.pinnedMessages || []);
    });

    // Listen for new messages
    socketService.onNewMessage((message) => {
      setMessages(prev => [...prev, message]);
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // Listen for pinned messages
    socketService.onMessagePinned((message) => {
      setPinnedMessages(prev => [...prev, message]);
    });

    // Listen for unpinned messages
    socketService.onMessageUnpinned((data) => {
      setPinnedMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    });

    // Listen for deleted messages
    socketService.onMessagesDeleted((data) => {
      setMessages(prev => prev.filter(msg => !data.messageIds.includes(msg.id)));
      setSelectedMessages([]);
      setIsSelectionMode(false);
    });
  };

  // Send text message
  const handleSend = () => {
    if (!inputText.trim()) return;

    const message = {
      id: Date.now().toString(),
      text: inputText,
      userId: currentUser.uid,
      userName: currentUser.displayName,
      timestamp: new Date().toISOString(),
      reactions: []
    };

    socketService.sendMessage(roomId, message);
    setInputText('');
  };

  // Send file
  const handleFilePicker = async () => {
    try {
      // Pick a file
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });

      if (result.type === 'success') {
        // Check file size (10MB limit)
        if (result.size > 10 * 1024 * 1024) {
          Alert.alert('Error', 'File too large. Max 10MB');
          return;
        }

        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(result.uri, {
          encoding: FileSystem.EncodingType.Base64
        });

        // Create message with file
        const message = {
          id: Date.now().toString(),
          text: `📎 ${result.name}`,
          userId: currentUser.uid,
          userName: currentUser.displayName,
          timestamp: new Date().toISOString(),
          reactions: [],
          fileInfo: {
            name: result.name,
            size: result.size,
            type: result.mimeType,
            base64: base64
          }
        };

        socketService.sendMessage(roomId, message);
      }
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  // Pin message
  const handlePinMessage = (message) => {
    socketService.pinMessage(roomId, message);
    Alert.alert('Success', 'Message pinned!');
  };

  // Delete selected messages
  const handleDeleteMessages = () => {
    if (selectedMessages.length === 0) return;

    Alert.alert(
      'Delete Messages',
      `Delete ${selectedMessages.length} message(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            socketService.deleteMessages(roomId, selectedMessages);
          }
        }
      ]
    );
  };

  // Toggle message selection
  const toggleMessageSelection = (messageId) => {
    if (selectedMessages.includes(messageId)) {
      setSelectedMessages(prev => prev.filter(id => id !== messageId));
    } else {
      setSelectedMessages(prev => [...prev, messageId]);
    }
  };

  // Render each message
  const renderMessage = ({ item }) => {
    const isMyMessage = item.userId === currentUser.uid;
    const isSelected = selectedMessages.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage,
          isSelected && styles.selectedMessage
        ]}
        onPress={() => {
          if (isSelectionMode) {
            toggleMessageSelection(item.id);
          }
        }}
        onLongPress={() => {
          if (!isSelectionMode) {
            // Show options
            Alert.alert(
              'Message Options',
              '',
              [
                { text: 'Pin', onPress: () => handlePinMessage(item) },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }
        }}
      >
        {/* Show checkbox in selection mode */}
        {isSelectionMode && (
          <View style={styles.checkbox}>
            {isSelected && <Text>✓</Text>}
          </View>
        )}

        {/* Message content */}
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>

        {/* File download button */}
        {item.fileInfo && (
          <TouchableOpacity 
            style={styles.fileButton}
            onPress={() => handleDownloadFile(item.fileInfo)}
          >
            <Text>📥 Download</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.roomName}>{roomName}</Text>
        
        {/* Pinboard button */}
        <TouchableOpacity 
          onPress={() => router.push(`/pinboard?roomId=${roomId}&roomName=${roomName}`)}
        >
          <Text style={styles.pinIcon}>
            📌 {pinnedMessages.length > 0 && `(${pinnedMessages.length})`}
          </Text>
        </TouchableOpacity>

        {/* Selection mode toggle */}
        {!isSelectionMode ? (
          <TouchableOpacity onPress={() => setIsSelectionMode(true)}>
            <Text style={styles.selectButton}>Select</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleDeleteMessages}>
            <Text style={styles.deleteButton}>Delete ({selectedMessages.length})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.attachButton}
          onPress={handleFilePicker}
        >
          <Text style={styles.attachIcon}>+</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />

        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSend}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

**Key concepts:**

**1. useEffect for setup and cleanup:**
```javascript
useEffect(() => {
  // Setup: Connect and join room
  initChat();

  // Cleanup: Leave room when component unmounts
  return () => {
    socketService.leaveRoom(roomId);
  };
}, [roomId]);
```

**2. Real-time listeners:**
```javascript
socketService.onNewMessage((message) => {
  setMessages(prev => [...prev, message]);  // Add to existing messages
});
```

**3. FlatList with ref for auto-scroll:**
```javascript
const flatListRef = useRef(null);

// Scroll to bottom when new message arrives
flatListRef.current?.scrollToEnd({ animated: true });
```

**4. Selection mode:**
```javascript
const [isSelectionMode, setIsSelectionMode] = useState(false);
const [selectedMessages, setSelectedMessages] = useState([]);

// Toggle selection
const toggleMessageSelection = (messageId) => {
  if (selectedMessages.includes(messageId)) {
    // Remove from selection
    setSelectedMessages(prev => prev.filter(id => id !== messageId));
  } else {
    // Add to selection
    setSelectedMessages(prev => [...prev, messageId]);
  }
};
```

**Chat Flow:**
1. Component mounts
2. Connect to socket server
3. Join room
4. Load previous messages (room history)
5. Listen for new messages
6. User types and sends message
7. Message goes to server
8. Server broadcasts to all users
9. Everyone receives and displays message

---


## 💾 Data Storage System

### **src/storage.js** - AsyncStorage Helper

This file provides easy functions to save and load data:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save courses for a specific user
export const saveCourses = async (userId, courses) => {
  try {
    const key = `@courses_${userId}`;  // User-specific key
    await AsyncStorage.setItem(key, JSON.stringify(courses));
    console.log('✅ Courses saved');
  } catch (error) {
    console.error('❌ Error saving courses:', error);
  }
};

// Load courses for a specific user
export const loadCourses = async (userId) => {
  try {
    const key = `@courses_${userId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Error loading courses:', error);
    return [];
  }
};

// Save study groups
export const saveGroups = async (userId, groups) => {
  try {
    const key = `@groups_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(groups));
  } catch (error) {
    console.error('Error saving groups:', error);
  }
};

// Load study groups
export const loadGroups = async (userId) => {
  try {
    const key = `@groups_${userId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading groups:', error);
    return [];
  }
};

// Save notes
export const saveNotes = async (userId, notes) => {
  try {
    const key = `@notes_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes:', error);
  }
};

// Load notes
export const loadNotes = async (userId) => {
  try {
    const key = `@notes_${userId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading notes:', error);
    return [];
  }
};

// Increment message count (for statistics)
export const incrementMessageCount = async (userId) => {
  try {
    const key = `@messageCount_${userId}`;
    const current = await AsyncStorage.getItem(key);
    const count = current ? parseInt(current) : 0;
    await AsyncStorage.setItem(key, (count + 1).toString());
  } catch (error) {
    console.error('Error incrementing message count:', error);
  }
};

// Get message count
export const getMessageCount = async (userId) => {
  try {
    const key = `@messageCount_${userId}`;
    const count = await AsyncStorage.getItem(key);
    return count ? parseInt(count) : 0;
  } catch (error) {
    console.error('Error getting message count:', error);
    return 0;
  }
};
```

**Key concepts:**

**1. User-specific keys:**
```javascript
const key = `@courses_${userId}`;
```
Each user has their own data. User A's courses don't mix with User B's.

**2. JSON serialization:**
```javascript
// Save: Convert object to string
await AsyncStorage.setItem(key, JSON.stringify(courses));

// Load: Convert string back to object
const data = await AsyncStorage.getItem(key);
return JSON.parse(data);
```

**3. Error handling:**
```javascript
try {
  // Try to save
  await AsyncStorage.setItem(key, data);
} catch (error) {
  // If it fails, log error and continue
  console.error('Error:', error);
}
```

**Storage Flow:**
```
User adds a course
      ↓
saveCourses(userId, courses)
      ↓
Convert to JSON string
      ↓
Save to AsyncStorage with key "@courses_user123"
      ↓
Data persists on device
      ↓
Next time app opens
      ↓
loadCourses(userId)
      ↓
Get from AsyncStorage
      ↓
Convert back to object
      ↓
Display courses
```

---

## 🖥️ Backend Server

### **backend/server.js** - The Chat Server

This Node.js server handles all real-time communication:

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Allow localhost and local network
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

app.use(cors(corsOptions));

// Initialize Socket.io
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Data storage file
const DATA_FILE = path.join(__dirname, 'rooms-data.json');

// In-memory storage
let roomsData = {};

// Load data from file on startup
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      roomsData = JSON.parse(data);
      console.log('✅ Data loaded from file');
    }
  } catch (error) {
    console.error('❌ Error loading data:', error);
    roomsData = {};
  }
};

// Save data to file
const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(roomsData, null, 2));
    console.log('💾 Data saved to file');
  } catch (error) {
    console.error('❌ Error saving data:', error);
  }
};

// Initialize room if it doesn't exist
const initRoom = (roomId) => {
  if (!roomsData[roomId]) {
    roomsData[roomId] = {
      messages: [],
      pinnedMessages: []
    };
  }
};

// Load data on startup
loadData();

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join room
  socket.on('join-room', ({ roomId, userId, userName }) => {
    console.log(`📥 ${userName} joined room: ${roomId}`);
    
    socket.join(roomId);
    initRoom(roomId);

    // Send room history to the user
    socket.emit('room-history', {
      messages: roomsData[roomId].messages,
      pinnedMessages: roomsData[roomId].pinnedMessages
    });
  });

  // Leave room
  socket.on('leave-room', ({ roomId }) => {
    console.log(`📤 User left room: ${roomId}`);
    socket.leave(roomId);
  });

  // Send message
  socket.on('send-message', ({ roomId, message }) => {
    console.log(`💬 Message in ${roomId}:`, message.text);
    
    initRoom(roomId);
    
    // Add message to room
    roomsData[roomId].messages.push(message);
    
    // Save to file
    saveData();
    
    // Broadcast to all users in room
    io.to(roomId).emit('new-message', message);
  });

  // Pin message
  socket.on('pin-message', ({ roomId, message }) => {
    console.log(`📌 Pinning message in ${roomId}`);
    
    initRoom(roomId);
    
    // Add to pinned messages
    roomsData[roomId].pinnedMessages.push(message);
    
    // Save to file
    saveData();
    
    // Broadcast to all users
    io.to(roomId).emit('message-pinned', message);
  });

  // Unpin message
  socket.on('unpin-message', ({ roomId, messageId }) => {
    console.log(`📍 Unpinning message ${messageId} in ${roomId}`);
    
    if (roomsData[roomId]) {
      // Remove from pinned messages
      roomsData[roomId].pinnedMessages = roomsData[roomId].pinnedMessages.filter(
        msg => msg.id !== messageId
      );
      
      // Save to file
      saveData();
      
      // Broadcast to all users
      io.to(roomId).emit('message-unpinned', { messageId });
    }
  });

  // Delete messages
  socket.on('delete-messages', ({ roomId, messageIds }) => {
    console.log(`🗑️ Deleting messages in ${roomId}:`, messageIds);
    
    if (roomsData[roomId]) {
      // Remove messages
      roomsData[roomId].messages = roomsData[roomId].messages.filter(
        msg => !messageIds.includes(msg.id)
      );
      
      // Also remove from pinned if they were pinned
      roomsData[roomId].pinnedMessages = roomsData[roomId].pinnedMessages.filter(
        msg => !messageIds.includes(msg.id)
      );
      
      // Save to file
      saveData();
      
      // Broadcast to all users
      io.to(roomId).emit('messages-deleted', { messageIds });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

// REST API endpoints

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'StudyJam Chat Server is running',
    timestamp: new Date().toISOString()
  });
});

// Get all rooms
app.get('/rooms', (req, res) => {
  res.json({
    rooms: Object.keys(roomsData)
  });
});

// Get room data
app.get('/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  
  if (roomsData[roomId]) {
    res.json({
      roomId,
      messages: roomsData[roomId].messages,
      pinnedMessages: roomsData[roomId].pinnedMessages
    });
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

**Key concepts:**

**1. Socket.io rooms:**
```javascript
socket.join(roomId);  // User joins a room
io.to(roomId).emit('new-message', message);  // Send to everyone in room
```

**2. Event-driven architecture:**
```javascript
socket.on('send-message', (data) => {
  // Handle incoming message
  io.to(roomId).emit('new-message', message);  // Broadcast to all
});
```

**3. Data persistence:**
```javascript
// Save to file after every change
const saveData = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(roomsData));
};
```

**4. Broadcasting:**
```javascript
// Send to everyone in room (including sender)
io.to(roomId).emit('new-message', message);

// Send to everyone except sender
socket.to(roomId).emit('new-message', message);
```

**Server Flow:**
```
Server starts
      ↓
Load rooms-data.json
      ↓
Listen for connections
      ↓
User connects
      ↓
User joins room
      ↓
Send room history to user
      ↓
User sends message
      ↓
Save message to memory
      ↓
Save to file
      ↓
Broadcast to all in room
      ↓
Everyone receives message
```

---


## 🔗 How Everything Connects

### **The Complete Data Flow**

Let's trace what happens when a user sends a message:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER TYPES MESSAGE                                       │
│    - User types "Hello everyone!" in chat-room.js           │
│    - Clicks send button                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. CREATE MESSAGE OBJECT                                    │
│    const message = {                                        │
│      id: "1234567890",                                      │
│      text: "Hello everyone!",                               │
│      userId: "user-123",                                    │
│      userName: "John Doe",                                  │
│      timestamp: "2024-12-07T10:30:00Z",                     │
│      reactions: []                                          │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. SEND VIA SOCKET SERVICE                                  │
│    socketService.sendMessage(roomId, message)               │
│    - Calls socket.emit('send-message', {roomId, message})   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. BACKEND RECEIVES MESSAGE                                 │
│    socket.on('send-message', ({roomId, message}) => {       │
│      // Add to room's messages                              │
│      roomsData[roomId].messages.push(message);              │
│      // Save to file                                        │
│      saveData();                                            │
│      // Broadcast to everyone in room                       │
│      io.to(roomId).emit('new-message', message);            │
│    })                                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. ALL CLIENTS RECEIVE MESSAGE                              │
│    socketService.onNewMessage((message) => {                │
│      setMessages(prev => [...prev, message]);               │
│    })                                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. UI UPDATES                                               │
│    - FlatList re-renders with new message                   │
│    - Message appears on everyone's screen                   │
│    - Auto-scroll to bottom                                  │
└─────────────────────────────────────────────────────────────┘
```

---

### **Authentication Flow**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER OPENS APP                                           │
│    - app/index.js (Welcome screen) loads                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. USER CHOOSES ROLE                                        │
│    - Clicks "Student Login" or "Admin Login"                │
│    - Router navigates to /login or /admin-login             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. USER ENTERS CREDENTIALS                                  │
│    - Types email and password                               │
│    - Clicks "Login" button                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CALL FIREBASE AUTH                                       │
│    const result = await loginWithEmail(email, password)     │
│    - Firebase checks credentials                            │
│    - Returns user object if correct                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. CHECK USER ROLE                                          │
│    const role = await getUserRole(user.uid)                 │
│    - Queries Firestore for user document                    │
│    - Gets 'role' field ('student' or 'admin')               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. VERIFY ROLE MATCHES                                      │
│    if (role === 'student') {                                │
│      router.replace('/dashboard')                           │
│    } else {                                                 │
│      Alert.alert('Wrong account type')                      │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. LOAD DASHBOARD                                           │
│    - Dashboard loads user's courses and groups              │
│    - User is now logged in                                  │
└─────────────────────────────────────────────────────────────┘
```

---

### **Course Management Flow**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER CLICKS COURSE CARD                                  │
│    - In dashboard.js                                        │
│    - router.push('/course-detail?id=course123')             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. COURSE DETAIL LOADS                                      │
│    - app/course-detail.js mounts                            │
│    - Gets courseId from URL params                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. LOAD COURSE DATA                                         │
│    const courses = await loadCourses(userId)                │
│    const course = courses.find(c => c.id === courseId)      │
│    - Loads from AsyncStorage                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DISPLAY COURSE INFO                                      │
│    - Shows course name, code, professor                     │
│    - Shows tabs: Materials, Assignments, Grades, Schedule   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. USER ADDS MATERIAL                                       │
│    - Clicks "Upload" button                                 │
│    - Picks file with DocumentPicker                         │
│    - Adds to materials array                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. SAVE UPDATED COURSE                                      │
│    await saveCourses(userId, updatedCourses)                │
│    - Saves to AsyncStorage                                  │
│    - Data persists on device                                │
└─────────────────────────────────────────────────────────────┘
```

---

### **File Sharing Flow**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER CLICKS ATTACH BUTTON                                │
│    - In chat-room.js                                        │
│    - handleFilePicker() is called                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PICK FILE                                                │
│    const result = await DocumentPicker.getDocumentAsync()   │
│    - Opens file picker                                      │
│    - User selects file                                      │
│    - Returns file info (name, size, uri, type)              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CHECK FILE SIZE                                          │
│    if (result.size > 10 * 1024 * 1024) {                    │
│      Alert.alert('File too large')                          │
│      return                                                 │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CONVERT TO BASE64                                        │
│    const base64 = await FileSystem.readAsStringAsync(       │
│      result.uri,                                            │
│      { encoding: FileSystem.EncodingType.Base64 }           │
│    )                                                        │
│    - Converts file to text format                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. CREATE MESSAGE WITH FILE                                 │
│    const message = {                                        │
│      id: Date.now().toString(),                             │
│      text: "📎 document.pdf",                               │
│      userId: currentUser.uid,                               │
│      userName: currentUser.displayName,                     │
│      timestamp: new Date().toISOString(),                   │
│      fileInfo: {                                            │
│        name: "document.pdf",                                │
│        size: 123456,                                        │
│        type: "application/pdf",                             │
│        base64: "base64-encoded-data..."                     │
│      }                                                      │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. SEND MESSAGE                                             │
│    socketService.sendMessage(roomId, message)               │
│    - Sends to backend server                                │
│    - Server broadcasts to all users                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. RECIPIENTS RECEIVE FILE                                  │
│    - Message appears with file name                         │
│    - Shows download button                                  │
│    - Click to download/open file                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Programming Concepts Used

### **1. React Hooks**

**useState - Managing State:**
```javascript
const [messages, setMessages] = useState([]);

// Update state
setMessages([...messages, newMessage]);  // Add message
setMessages(prev => [...prev, newMessage]);  // Using previous state
```

**useEffect - Side Effects:**
```javascript
useEffect(() => {
  // Runs when component mounts
  loadData();
  
  // Cleanup function (runs when component unmounts)
  return () => {
    cleanup();
  };
}, []);  // Dependencies array
```

**useRef - Persistent References:**
```javascript
const flatListRef = useRef(null);

// Access the FlatList component
flatListRef.current?.scrollToEnd();
```

---

### **2. Async/Await - Handling Promises**

```javascript
// Old way (callbacks)
loginWithEmail(email, password, (result) => {
  if (result.success) {
    // Handle success
  }
});

// New way (async/await)
const result = await loginWithEmail(email, password);
if (result.success) {
  // Handle success
}
```

**Why async/await?**
- Cleaner code
- Easier error handling
- Reads like synchronous code

---

### **3. Array Methods**

**map - Transform array:**
```javascript
const names = users.map(user => user.name);
// ['John', 'Jane', 'Bob']
```

**filter - Filter array:**
```javascript
const students = users.filter(user => user.role === 'student');
// Only users with role 'student'
```

**find - Find one item:**
```javascript
const course = courses.find(c => c.id === courseId);
// First course with matching id
```

**includes - Check if exists:**
```javascript
if (selectedMessages.includes(messageId)) {
  // Message is selected
}
```

---

### **4. Spread Operator**

```javascript
// Copy array and add item
const newMessages = [...messages, newMessage];

// Copy object and update property
const updatedUser = { ...user, name: 'New Name' };

// Merge objects
const combined = { ...obj1, ...obj2 };
```

---

### **5. Destructuring**

```javascript
// Object destructuring
const { roomId, roomName } = useLocalSearchParams();

// Array destructuring
const [state, setState] = useState(initialValue);

// Function parameter destructuring
const renderItem = ({ item, index }) => {
  return <Text>{item.name}</Text>;
};
```

---

### **6. Template Literals**

```javascript
// Old way
const url = '/chat-room?roomId=' + roomId + '&roomName=' + roomName;

// New way
const url = `/chat-room?roomId=${roomId}&roomName=${roomName}`;
```

---

### **7. Optional Chaining**

```javascript
// Old way
if (user && user.profile && user.profile.name) {
  console.log(user.profile.name);
}

// New way
console.log(user?.profile?.name);
```

---

### **8. Ternary Operator**

```javascript
// Old way
let text;
if (loading) {
  text = 'Loading...';
} else {
  text = 'Login';
}

// New way
const text = loading ? 'Loading...' : 'Login';
```

---

## 🧩 Component Patterns

### **1. Container/Presentational Pattern**

**Container (Smart Component):**
```javascript
// Handles logic and state
export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  
  const handleSend = () => {
    // Logic here
  };
  
  return <ChatUI messages={messages} onSend={handleSend} />;
}
```

**Presentational (Dumb Component):**
```javascript
// Just displays data
function ChatUI({ messages, onSend }) {
  return (
    <View>
      {messages.map(msg => <Message key={msg.id} data={msg} />)}
      <Button onPress={onSend} />
    </View>
  );
}
```

---

### **2. Custom Hooks Pattern**

```javascript
// Reusable logic
function useAuth() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);
  
  return user;
}

// Use in component
function Dashboard() {
  const user = useAuth();
  
  if (!user) return <LoginScreen />;
  return <DashboardContent user={user} />;
}
```

---

### **3. Render Props Pattern**

```javascript
function DataLoader({ render }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    loadData().then(setData);
  }, []);
  
  return render(data);
}

// Usage
<DataLoader render={(data) => (
  <View>
    {data && <Text>{data.name}</Text>}
  </View>
)} />
```

---

## 🔍 Debugging Tips

### **1. Console Logging**

```javascript
// Log state changes
useEffect(() => {
  console.log('Messages updated:', messages);
}, [messages]);

// Log function calls
const handleSend = () => {
  console.log('handleSend called with:', inputText);
  // ... rest of code
};
```

---

### **2. React DevTools**

- Install React Native Debugger
- Inspect component tree
- View props and state
- Track re-renders

---

### **3. Network Debugging**

```javascript
// Log socket events
socket.on('connect', () => console.log('✅ Connected'));
socket.on('disconnect', () => console.log('❌ Disconnected'));
socket.on('new-message', (msg) => console.log('📨 Received:', msg));
```

---

## 📚 Summary

**Your app uses:**

1. **React Native** - Mobile UI framework
2. **Expo** - Development tools and APIs
3. **Firebase** - Authentication and database
4. **Socket.io** - Real-time communication
5. **AsyncStorage** - Local data storage
6. **Expo Router** - File-based navigation

**Key files:**
- `src/firebaseConfig.js` - Authentication
- `src/socketService.js` - Real-time chat
- `src/storage.js` - Data persistence
- `app/*.js` - All screens
- `backend/server.js` - Chat server

**Data flow:**
- User actions → State updates → UI re-renders
- Local data → AsyncStorage
- Shared data → Backend server → Socket.io → All clients
- Auth data → Firebase

**You now understand:**
- How authentication works
- How real-time chat works
- How data is stored and loaded
- How components communicate
- How the backend handles messages
- How everything connects together

---

**Congratulations! You now understand your entire codebase!** 🎉
