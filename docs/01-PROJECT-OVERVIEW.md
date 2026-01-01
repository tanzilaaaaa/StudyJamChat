# Project Overview

## 🎓 What is StudyJam?

StudyJam is a mobile-first student collaboration platform designed to enhance learning through:
- **Organized course management**
- **Real-time communication**
- **Collaborative study groups**
- **Personal note-taking**
- **Assignment tracking**

---

## 🎯 Project Goals

### Primary Objectives
1. **Simplify student collaboration** - Provide a single platform for all academic needs
2. **Enable real-time communication** - Instant messaging with file sharing
3. **Organize academic life** - Courses, assignments, notes in one place
4. **Role-based access** - Different features for students and administrators

### Target Users
- **Students**: College/university students managing multiple courses
- **Administrators**: Teachers, TAs, or course coordinators managing content

---

## ✨ Key Features

### 1. Authentication System
- **Dual role system**: Student and Admin
- **Separate login flows**: Different entry points for each role
- **Firebase Authentication**: Secure, scalable auth
- **Persistent sessions**: Stay logged in across app restarts

### 2. Dashboard
- **Course overview**: All enrolled courses at a glance
- **Study groups**: Quick access to group chats
- **Statistics**: Track courses, groups, and messages
- **Search functionality**: Find courses and groups quickly

### 3. Real-time Chat
- **Socket.io powered**: Instant message delivery
- **File sharing**: Share documents, images, PDFs
- **Message pinning**: Pin important messages to pinboard
- **Message deletion**: Select and delete multiple messages
- **Persistent history**: Messages saved across sessions

### 4. Course Management
- **Course details**: Name, code, professor, credits
- **Materials**: Upload and access course materials
- **Assignments**: Track due dates and completion
- **Grades**: View scores and percentages
- **Schedule**: Class times and locations
- **Quick notes**: Course-specific notes

### 5. Notes System
- **Create notes**: Rich text note-taking
- **Edit/Delete**: Full CRUD operations
- **Search**: Find notes quickly
- **Persistent storage**: Notes saved locally

### 6. Profile Management
- **User information**: Name, email, bio
- **Student-specific**: Major and year (students only)
- **Statistics**: Real-time activity tracking
- **Logout**: Secure session termination

---

## 🏗️ Technology Stack

### Frontend
```
React Native 0.81.5
├── Expo 54.0.23
├── Expo Router 6.0.14 (File-based routing)
├── React Navigation 7.1.19
├── Socket.io Client 4.8.1
└── AsyncStorage 1.24.0
```

### Backend
```
Node.js 22.16.0
├── Express 4.18.2
├── Socket.io 4.6.1
├── CORS 2.8.5
└── File System (JSON storage)
```

### Database & Auth
```
Firebase
├── Authentication (Email/Password)
├── Firestore (User roles)
└── AsyncStorage (Local data)
```

### Development Tools
```
Tools
├── VS Code
├── Expo Go (Mobile testing)
├── EAS Build (APK generation)
└── Git/GitHub (Version control)
```

---

## 📊 Project Statistics

- **Total Files**: ~50 source files
- **Lines of Code**: ~15,000+
- **Components**: 20+ React components
- **Screens**: 15+ app screens
- **Backend Routes**: 5+ API endpoints
- **Socket Events**: 10+ real-time events

---

## 🎨 Design Principles

### 1. User-Centric Design
- Intuitive navigation
- Clear visual hierarchy
- Consistent UI patterns
- Responsive layouts

### 2. Performance
- Optimized rendering
- Efficient state management
- Lazy loading where appropriate
- Minimal re-renders

### 3. Security
- Role-based access control
- Secure authentication
- Input validation
- Protected routes

### 4. Scalability
- Modular code structure
- Reusable components
- Separation of concerns
- Clean architecture

---

## 🔄 Development Workflow

```
Development → Testing → Building → Deployment
     ↓           ↓          ↓           ↓
  VS Code    Expo Go    EAS Build    Render
```

### Development
- Code in VS Code
- Hot reload with Expo
- Test on simulator/device

### Testing
- Manual testing on Expo Go
- Test on iOS/Android
- Verify all features

### Building
- Build APK with EAS
- Generate signed bundle
- Download for distribution

### Deployment
- Backend on Render
- Automatic deployments
- Environment variables

---

## 📱 Supported Platforms

### Mobile
- ✅ **Android**: Full support (APK available)
- ✅ **iOS**: Full support (requires Apple Developer account)

### Web
- ✅ **Web Browser**: Full support via Expo Web
- ⚠️ **Note**: Some features optimized for mobile

---

## 🎯 Future Enhancements

### Planned Features
- [ ] Push notifications
- [ ] Video/voice calls
- [ ] Calendar integration
- [ ] Offline mode
- [ ] Dark mode
- [ ] Multi-language support
- [ ] File preview in-app
- [ ] Advanced search filters

### Technical Improvements
- [ ] TypeScript migration
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] Analytics integration

---

## 📈 Project Timeline

- **Week 1-2**: Authentication & Basic UI
- **Week 3-4**: Dashboard & Navigation
- **Week 5-6**: Chat System & Real-time
- **Week 7-8**: Course Management
- **Week 9-10**: Notes & Profile
- **Week 11-12**: Testing & Deployment

---

## 🤝 Contributing

This is an educational project. For contributions:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - Free to use for educational purposes

---

**Next**: [Getting Started Guide →](./02-GETTING-STARTED.md)
