# Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     StudyJam App                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │   Backend    │  │   Firebase   │ │
│  │ React Native │◄─┤ Express +    │◄─┤ Auth +       │ │
│  │   + Expo     │  │  Socket.io   │  │  Firestore   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         │                  │                  │         │
│    ┌────▼────┐        ┌───▼───┐         ┌───▼───┐    │
│    │AsyncStore│        │ JSON  │         │ Cloud │    │
│    │  (Local) │        │ Files │         │  DB   │    │
│    └─────────┘        └───────┘         └───────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 Frontend Architecture

### Component Hierarchy

```
App (Root)
├── Layout (Navigation)
│   ├── Index (Landing)
│   ├── Auth Flow
│   │   ├── Login (Student)
│   │   ├── Signup (Student)
│   │   ├── Admin Login
│   │   └── Admin Signup
│   └── Main App
│       ├── Dashboard
│       │   ├── Course Cards
│       │   ├── Group Cards
│       │   └── Search Bar
│       ├── Chat
│       │   ├── Chat Room
│       │   ├── Message List
│       │   ├── Input Area
│       │   └── Pinboard
│       ├── Courses
│       │   ├── Course Detail
│       │   ├── Materials
│       │   ├── Assignments
│       │   ├── Grades
│       │   └── Schedule
│       ├── Notes
│       │   ├── Notes List
│       │   └── Note Editor
│       └── Profile
│           ├── User Info
│           ├── Statistics
│           └── Settings
```

### State Management

```javascript
// Local Component State (useState)
const [messages, setMessages] = useState([]);
const [user, setUser] = useState(null);

// Global State (Firebase Auth)
auth.onAuthStateChanged((user) => {
  // User state available globally
});

// Persistent State (AsyncStorage)
await AsyncStorage.setItem('key', value);
const value = await AsyncStorage.getItem('key');

// Real-time State (Socket.io)
socket.on('new-message', (message) => {
  setMessages(prev => [...prev, message]);
});
```

---

## 🔄 Data Flow

### Authentication Flow

```
User Input → Firebase Auth → Firestore (Role Check) → Dashboard
     │              │                │                    │
     │              │                │                    │
  Email/Pass    Verify User    Check Role         Route to Screen
```

### Chat Message Flow

```
User Types → Send Button → Socket.io Client → Backend Server
                                                      │
                                                      ▼
                                              Save to JSON File
                                                      │
                                                      ▼
                                          Broadcast to All Clients
                                                      │
                                                      ▼
                                              Update UI (All Users)
```

### Data Persistence Flow

```
User Action → Component State → AsyncStorage → Local Device
                    │
                    ▼
              Backend API → JSON File → Server Storage
                    │
                    ▼
              Firebase → Firestore → Cloud Database
```

---

## 🗄️ Database Schema

### Firebase Firestore

```javascript
// Users Collection
users/{userId}
{
  email: "user@example.com",
  role: "student" | "admin",
  displayName: "User Name",
  createdAt: timestamp
}
```

### AsyncStorage (Local)

```javascript
// User-specific keys
@studyjam_courses_global: [Course]
@studyjam_groups_{userId}: [Group]
@studyjam_notes_{userId}: [Note]
@studyjam_profile_{userId}: Profile
@studyjam_message_count_{userId}: number
@studyjam_notifications_{userId}: [Notification]
@course_materials_{courseId}_{userId}: [Material]
@course_assignments_{courseId}_{userId}: [Assignment]
@course_schedule_{courseId}_{userId}: [Schedule]
@course_grades_{courseId}: [Grade]
@course_notes_{courseId}_{userId}: string
```

### Backend JSON Storage

```javascript
// rooms-data.json
{
  "room-id": {
    id: "room-id",
    name: "Room Name",
    messages: [
      {
        id: "msg-id",
        text: "Message text",
        userId: "user-id",
        userName: "User Name",
        timestamp: "ISO-8601",
        reactions: [],
        fileInfo: {
          name: "file.pdf",
          size: 12345,
          type: "application/pdf",
          base64: "..."
        }
      }
    ],
    pinnedMessages: [Message]
  }
}
```

---

## 🔌 API Architecture

### REST Endpoints

```
GET  /api/rooms              # List all chat rooms
GET  /api/rooms/:roomId      # Get specific room data
```

### Socket.io Events

**Client → Server:**
```javascript
socket.emit('join-room', roomId)
socket.emit('send-message', { roomId, message })
socket.emit('pin-message', { roomId, messageId })
socket.emit('unpin-message', { roomId, messageId })
socket.emit('delete-messages', { roomId, messageIds })
```

**Server → Client:**
```javascript
socket.on('room-messages', messages)
socket.on('new-message', message)
socket.on('pinned-messages', pinnedMessages)
socket.on('message-pinned', message)
socket.on('message-unpinned', messageId)
socket.on('messages-deleted', messageIds)
```

---

## 🔐 Security Architecture

### Authentication Layer

```
Request → Check Auth State → Verify Role → Allow/Deny Access
    │            │               │              │
    │            │               │              │
Firebase      User UID      Firestore      Route Guard
  Auth                        Role
```

### Role-Based Access Control

```javascript
// Protected Routes
if (userRole === 'admin') {
  // Allow admin features
  - Add/Edit/Delete courses
  - Manage users
  - View analytics
} else if (userRole === 'student') {
  // Allow student features
  - View courses
  - Join groups
  - Send messages
}
```

### Data Security

```
1. Firebase Rules → Protect Firestore data
2. Input Validation → Sanitize user input
3. File Size Limits → Max 10MB uploads
4. Authentication Required → All routes protected
5. Role Verification → Server-side checks
```

---

## 📡 Real-time Communication

### Socket.io Connection

```javascript
// Client Side
const socket = io('https://backend-url.com', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10
});

// Server Side
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    // Send existing messages
  });
  
  socket.on('send-message', (data) => {
    // Save message
    // Broadcast to room
    io.to(roomId).emit('new-message', message);
  });
});
```

### Connection Management

```
App Start → Connect to Socket → Join Rooms → Listen for Events
    │            │                  │              │
    │            │                  │              │
Initialize   Authenticate      Subscribe      Update UI
```

---

## 🎨 UI/UX Architecture

### Navigation Structure

```
Stack Navigator
├── Auth Stack (Not Logged In)
│   ├── Index (Landing)
│   ├── Login
│   ├── Signup
│   ├── Admin Login
│   └── Admin Signup
└── App Stack (Logged In)
    ├── Dashboard (Home)
    ├── Chat Room
    ├── Pinboard
    ├── Course Detail
    ├── Notes
    ├── Note Editor
    ├── Notifications
    └── Profile
```

### Screen Transitions

```
Dashboard → Course Detail → Back to Dashboard
    │
    ├→ Chat Room → Pinboard → Back to Chat
    │
    ├→ Notes → Note Editor → Back to Notes
    │
    └→ Profile → Edit → Save → Back to Profile
```

---

## 🔄 Lifecycle Management

### App Lifecycle

```
App Launch
    │
    ▼
Check Auth State
    │
    ├─ Not Logged In → Show Landing Page
    │
    └─ Logged In → Load User Data → Show Dashboard
                        │
                        ├─ Load Courses
                        ├─ Load Groups
                        ├─ Load Notifications
                        ├─ Connect Socket
                        └─ Load Statistics
```

### Component Lifecycle

```javascript
useEffect(() => {
  // Mount: Initialize
  const init = async () => {
    await loadData();
    connectSocket();
  };
  init();
  
  // Unmount: Cleanup
  return () => {
    disconnectSocket();
    clearListeners();
  };
}, [dependencies]);
```

---

## 📦 Module Architecture

### Core Modules

```
src/
├── firebaseConfig.js    # Firebase initialization & auth
├── socketService.js     # Socket.io client wrapper
└── storage.js           # AsyncStorage utilities

components/
├── InputModal.js        # Reusable input dialog
└── TwoInputModal.js     # Two-field input dialog

app/
├── (auth)/             # Authentication screens
├── (main)/             # Main app screens
└── layout.js           # Root layout
```

### Dependency Graph

```
App Components
    │
    ├─ firebaseConfig (Auth)
    │
    ├─ socketService (Real-time)
    │
    ├─ storage (Persistence)
    │
    └─ Reusable Components
```

---

## 🚀 Performance Optimization

### Strategies

1. **Lazy Loading**: Load data only when needed
2. **Memoization**: Cache expensive computations
3. **Virtualization**: Render only visible items
4. **Debouncing**: Limit API calls
5. **Code Splitting**: Load screens on demand

### Example

```javascript
// Memoization
const filteredCourses = useMemo(() => {
  return courses.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );
}, [courses, search]);

// Debouncing
const debouncedSearch = useCallback(
  debounce((text) => setSearch(text), 300),
  []
);
```

---

**Next**: [Authentication Flow →](./04-AUTHENTICATION.md)
