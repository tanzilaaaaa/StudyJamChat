# Code Structure

## 📂 Complete File Organization

```
StudyJamChat/
├── app/                      # All screens (Expo Router)
│   ├── index.js             # Welcome/Landing page
│   ├── login.js             # Student login
│   ├── signup.js            # Student signup
│   ├── admin-login.js       # Admin login
│   ├── admin-signup.js      # Admin signup
│   ├── admin.js             # Admin entry point
│   ├── admin-dashboard.js   # Admin dashboard
│   ├── admin-users.js       # User management
│   ├── admin-courses.js     # Course management
│   ├── admin-groups.js      # Group management
│   ├── admin-messages.js    # Message management
│   ├── dashboard.js         # Student dashboard
│   ├── chat-room.js         # Chat interface
│   ├── chats.js             # Chat list
│   ├── pinboard.js          # Pinned messages
│   ├── course-detail.js     # Course details
│   ├── notes.js             # Notes list
│   ├── note-editor.js       # Note editing
│   ├── notifications.js     # Notifications
│   ├── profile.js           # User profile
│   └── layout.js            # Root layout
│
├── backend/                  # Backend server
│   ├── server.js            # Express + Socket.io server
│   ├── package.json         # Backend dependencies
│   ├── rooms-data.json      # Chat data (auto-generated)
│   └── .env.example         # Environment variables template
│
├── src/                      # Utilities and services
│   ├── firebaseConfig.js    # Firebase initialization
│   ├── socketService.js     # Socket.io client wrapper
│   └── storage.js           # AsyncStorage utilities
│
├── components/               # Reusable components
│   ├── InputModal.js        # Single input modal
│   └── TwoInputModal.js     # Two input modal
│
├── assets/                   # Images and icons
│   └── images/
│       ├── icon.png
│       ├── splash-icon.png
│       └── favicon.png
│
├── docs/                     # Documentation
│   ├── README.md
│   ├── SIMPLE-EXPLANATION.md
│   └── ...
│
├── node_modules/             # Dependencies (auto-generated)
├── package.json              # Frontend dependencies
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build configuration
├── .gitignore               # Git ignore rules
└── README.md                # Project README
```

---

## 📱 App Screens Breakdown

### **Authentication Screens** (6 files)

**index.js** - Landing page
- Purpose: Entry point, role selection
- Routes to: login.js or admin-login.js
- Lines of code: ~150

**login.js** - Student login
- Purpose: Student authentication
- Uses: firebaseConfig.js
- Routes to: dashboard.js
- Lines of code: ~200

**signup.js** - Student signup
- Purpose: Create student account
- Stores: role, major, year
- Routes to: dashboard.js
- Lines of code: ~250

**admin-login.js** - Admin login
- Purpose: Admin authentication
- Routes to: admin-dashboard.js
- Lines of code: ~200

**admin-signup.js** - Admin signup
- Purpose: Create admin account
- Stores: role (no major/year)
- Routes to: admin-dashboard.js
- Lines of code: ~250

**admin.js** - Admin entry
- Purpose: Admin landing page
- Routes to: admin-dashboard.js
- Lines of code: ~100



---

### **Main App Screens** (9 files)

**dashboard.js** - Student dashboard
- Purpose: Main hub for students
- Shows: Courses, groups, search
- Uses: storage.js, firebaseConfig.js
- Lines of code: ~800

**admin-dashboard.js** - Admin dashboard
- Purpose: Main hub for admins
- Shows: Analytics, management tools
- Additional features: User management
- Lines of code: ~600

**chat-room.js** - Chat interface
- Purpose: Real-time messaging
- Uses: socketService.js
- Features: Send, file share, pin, delete
- Lines of code: ~600

**pinboard.js** - Pinned messages
- Purpose: View pinned messages
- Uses: socketService.js
- Features: View pins, unpin
- Lines of code: ~250

**course-detail.js** - Course information
- Purpose: Detailed course view
- Features: Materials, assignments, grades, schedule
- Uses: storage.js, DocumentPicker
- Lines of code: ~1200

**notes.js** - Notes list
- Purpose: View all notes
- Features: Search, create, delete
- Uses: storage.js
- Lines of code: ~400

**note-editor.js** - Note editing
- Purpose: Create/edit notes
- Features: Title, content, save
- Uses: storage.js
- Lines of code: ~300

**notifications.js** - Notifications
- Purpose: View app notifications
- Features: Mark as read, delete
- Uses: storage.js
- Lines of code: ~350

**profile.js** - User profile
- Purpose: View/edit user info
- Features: Bio, major, year, stats, logout
- Uses: firebaseConfig.js, storage.js
- Lines of code: ~500

