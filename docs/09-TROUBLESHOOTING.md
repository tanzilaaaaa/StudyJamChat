# Troubleshooting Guide

## 🔍 Common Issues & Solutions

This guide covers common problems you might encounter and how to fix them.

---

## 🔥 Firebase Issues

### **Issue: "Firebase: Error (auth/invalid-api-key)"**

**Cause:** Firebase API key is incorrect or missing.

**Solution:**
1. Check `src/firebaseConfig.js`
2. Verify API key matches Firebase Console
3. Go to Firebase Console → Project Settings → General
4. Copy the correct API key
5. Update in `firebaseConfig.js`

```javascript
const firebaseConfig = {
  apiKey: "YOUR-CORRECT-API-KEY",  // Update this
  authDomain: "your-project.firebaseapp.com",
  // ...
};
```

---

### **Issue: "Firebase: Error (auth/network-request-failed)"**

**Cause:** No internet connection or Firebase is down.

**Solution:**
1. Check your internet connection
2. Try on different network
3. Check Firebase status: https://status.firebase.google.com
4. Restart the app

---

### **Issue: "AsyncStorage has been extracted from react-native core"**

**Cause:** Using old AsyncStorage import.

**Solution:**
Already fixed in the app. If you see this, update imports:

```javascript
// ❌ Old way
import { AsyncStorage } from 'react-native';

// ✅ New way
import AsyncStorage from '@react-native-async-storage/async-storage';
```

---

### **Issue: User role not saving**

**Cause:** Firestore rules or missing role in signup.

**Solution:**
1. Check Firestore rules allow writes:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

2. Verify role is set in signup:
```javascript
await setDoc(doc(db, 'users', user.uid), {
  role: 'student',  // Make sure this is set
  name: name,
  email: email
});
```

---

## 💬 Chat & Socket.io Issues

### **Issue: "Cannot connect to socket server"**

**Cause:** Backend server not running or wrong URL.

**Solution:**

1. **Check backend is running:**
```bash
cd backend
npm start
```

2. **Verify URL in `src/socketService.js`:**
```javascript
// For local development
const SOCKET_URL = 'http://192.168.1.100:3000';  // Your computer's IP

// For production
const SOCKET_URL = 'https://studyjamchat.onrender.com';
```

3. **Get your local IP:**
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

4. **Test backend:**
```bash
curl http://localhost:3000
# Should return: {"message":"StudyJam Chat Server is running",...}
```

---

### **Issue: Messages not appearing in real-time**

**Cause:** Socket not connected or not in room.

**Solution:**

1. **Check connection status:**
```javascript
console.log('Socket connected:', socketService.socket?.connected);
```

2. **Verify you joined the room:**
```javascript
useEffect(() => {
  socketService.joinRoom(roomId);
  return () => socketService.leaveRoom(roomId);
}, [roomId]);
```

3. **Check listeners are set up:**
```javascript
useEffect(() => {
  socketService.onNewMessage((message) => {
    console.log('Received message:', message);
    setMessages(prev => [...prev, message]);
  });
}, []);
```

---

### **Issue: "Socket connection timeout"**

**Cause:** Backend unreachable or firewall blocking.

**Solution:**

1. **Increase timeout:**
```javascript
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  timeout: 20000,  // Increase to 20 seconds
  reconnection: true,
  reconnectionAttempts: 5
});
```

2. **Check firewall settings**
3. **Try different network**
4. **Use polling transport:**
```javascript
const socket = io(SOCKET_URL, {
  transports: ['polling']  // More reliable but slower
});
```

---

### **Issue: Messages duplicating**

**Cause:** Multiple socket listeners or not cleaning up.

**Solution:**

1. **Remove old listeners:**
```javascript
useEffect(() => {
  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };
  
  socketService.onNewMessage(handleNewMessage);
  
  return () => {
    // Clean up listener
    socketService.socket?.off('new-message', handleNewMessage);
  };
}, []);
```

2. **Check you're not joining room multiple times**

---

## 📱 Mobile App Issues

### **Issue: "Unable to resolve module"**

**Cause:** Missing dependency or cache issue.

**Solution:**

1. **Clear cache and reinstall:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules

# Remove package-lock
rm package-lock.json

# Reinstall
npm install

# Clear Expo cache
npx expo start -c
```

2. **If specific module missing:**
```bash
npm install [missing-module]
```

---

### **Issue: "Invariant Violation: requireNativeComponent"**

**Cause:** Native module not linked properly.

**Solution:**

1. **Restart Expo:**
```bash
# Stop current process (Ctrl+C)
npx expo start -c
```

2. **Rebuild app:**
```bash
# Clear cache
npx expo start --clear

# Or reset
npx expo start --reset-cache
```

---

### **Issue: App crashes on startup**

**Cause:** Various reasons - check error message.

**Solution:**

1. **Check logs:**
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
# Or
adb logcat
```

2. **Common fixes:**
```bash
# Clear cache
npx expo start -c

# Update Expo
npm install expo@latest

# Check for syntax errors
npm run lint
```

---

### **Issue: "Network request failed" when uploading files**

**Cause:** File too large or network issue.

**Solution:**

1. **Check file size:**
```javascript
if (file.size > 10 * 1024 * 1024) {  // 10MB
  Alert.alert('Error', 'File too large. Max 10MB');
  return;
}
```

2. **Increase timeout:**
```javascript
const timeout = setTimeout(() => {
  Alert.alert('Error', 'Upload timeout');
}, 30000);  // 30 seconds
```

---

## 🌐 Platform-Specific Issues

### **Issue: Alert.prompt not working on Android**

**Cause:** Alert.prompt is iOS-only.

**Solution:**
Already fixed with custom InputModal component. If you see this:

```javascript
// ❌ Don't use
Alert.prompt('Enter name', '', (text) => {});

// ✅ Use custom modal
<InputModal
  visible={modalVisible}
  onSubmit={(text) => handleSubmit(text)}
  onCancel={() => setModalVisible(false)}
/>
```

---

### **Issue: File picker not working on web**

**Cause:** expo-document-picker doesn't work on web.

**Solution:**
Already fixed with platform-specific code:

```javascript
if (Platform.OS === 'web') {
  // Use HTML input
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = (e) => {
    const file = e.target.files[0];
    // Handle file
  };
  input.click();
} else {
  // Use DocumentPicker
  const result = await DocumentPicker.getDocumentAsync();
}
```

---

### **Issue: Images not displaying on Android**

**Cause:** Incorrect image path or permissions.

**Solution:**

1. **Use correct path:**
```javascript
// ✅ Correct
<Image source={require('../assets/images/icon.png')} />

// ✅ Also correct
<Image source={{ uri: 'https://example.com/image.png' }} />

// ❌ Wrong
<Image source="../assets/images/icon.png" />
```

2. **Check permissions in app.json:**
```json
{
  "expo": {
    "android": {
      "permissions": [
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

---

## 🔐 Authentication Issues

### **Issue: User logged out after app restart**

**Cause:** Auth persistence not configured.

**Solution:**
Already fixed with proper persistence:

```javascript
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
```

---

### **Issue: "User not found" after signup**

**Cause:** Firestore document not created.

**Solution:**

1. **Check Firestore rules**
2. **Verify document creation:**
```javascript
const handleSignup = async () => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Make sure this runs
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    role: 'student',
    name: name,
    email: email
  });
};
```

---

### **Issue: Wrong dashboard after login**

**Cause:** Role check not working.

**Solution:**

1. **Check role verification:**
```javascript
const userRole = await getUserRole(user.uid);
if (userRole === 'student') {
  router.replace('/dashboard');
} else if (userRole === 'admin') {
  router.replace('/admin-dashboard');
}
```

2. **Verify Firestore data:**
- Go to Firebase Console
- Check Firestore Database
- Find user document
- Verify `role` field exists and is correct

---

## 💾 Data Storage Issues

### **Issue: Data not persisting**

**Cause:** AsyncStorage not saving properly.

**Solution:**

1. **Check save function:**
```javascript
const saveData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Save error:', error);
  }
};
```

2. **Verify load function:**
```javascript
const loadData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Load error:', error);
    return null;
  }
};
```

---

### **Issue: Data mixing between users**

**Cause:** Not using user-specific keys.

**Solution:**
Already fixed with user-specific storage:

```javascript
// ✅ Correct - user-specific
const key = `@courses_${userId}`;
await AsyncStorage.setItem(key, JSON.stringify(courses));

// ❌ Wrong - shared between users
await AsyncStorage.setItem('@courses', JSON.stringify(courses));
```

---

## 🎨 UI/UX Issues

### **Issue: Keyboard covering input**

**Cause:** No keyboard avoidance.

**Solution:**
Already fixed with KeyboardAvoidingView:

```javascript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
  keyboardVerticalOffset={100}
>
  {/* Your content */}
</KeyboardAvoidingView>
```

---

### **Issue: ScrollView not scrolling**

**Cause:** Missing flex or contentContainerStyle.

**Solution:**

```javascript
// ✅ Correct
<ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={{ flexGrow: 1 }}
>
  {/* Content */}
</ScrollView>

// ❌ Wrong
<ScrollView style={{ height: '100%' }}>
  {/* Content */}
</ScrollView>
```

---

### **Issue: FlatList not updating**

**Cause:** Not using key extractor or data not changing reference.

**Solution:**

```javascript
<FlatList
  data={messages}
  keyExtractor={(item) => item.id}  // Important!
  extraData={messages}  // Force re-render
  renderItem={({ item }) => <MessageItem message={item} />}
/>
```

---

## 🏗️ Build Issues

### **Issue: EAS build fails**

**Cause:** Various reasons - check build logs.

**Solution:**

1. **View build logs:**
```bash
eas build:list
eas build:view [build-id]
```

2. **Common fixes:**
```bash
# Update EAS CLI
npm install -g eas-cli@latest

# Clear cache
eas build:clear-cache

# Check app.json is valid
npx expo-doctor
```

3. **Verify credentials:**
```bash
eas credentials
```

---

### **Issue: "Duplicate resources" error**

**Cause:** Multiple files with same name.

**Solution:**

1. **Check for duplicate assets**
2. **Rename conflicting files**
3. **Clean build:**
```bash
eas build --clear-cache
```

---

### **Issue: APK won't install**

**Cause:** Package name conflict or corrupted APK.

**Solution:**

1. **Uninstall old version:**
```bash
adb uninstall com.tanzisprvv.Studyjam
```

2. **Install new version:**
```bash
adb install path/to/app.apk
```

3. **Check package name is unique in app.json**

---

## 🐛 Debugging Tips

### **Enable Debug Mode**

```javascript
// In App.js or index.js
if (__DEV__) {
  console.log('Debug mode enabled');
  // Enable additional logging
}
```

### **Use React Native Debugger**

1. Install: https://github.com/jhen0409/react-native-debugger
2. Start app with: `npx expo start`
3. Press `j` to open debugger
4. Set breakpoints and inspect state

### **Check Network Requests**

```javascript
// Add to fetch calls
fetch(url)
  .then(response => {
    console.log('Response:', response);
    return response.json();
  })
  .catch(error => {
    console.error('Network error:', error);
  });
```

### **Log Component Renders**

```javascript
useEffect(() => {
  console.log('Component rendered with:', { prop1, prop2 });
}, [prop1, prop2]);
```

### **Check AsyncStorage Contents**

```javascript
const debugStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  console.log('Storage keys:', keys);
  
  for (const key of keys) {
    const value = await AsyncStorage.getItem(key);
    console.log(key, ':', value);
  }
};
```

---

## 📊 Performance Issues

### **Issue: App running slow**

**Solution:**

1. **Use FlatList instead of ScrollView for long lists:**
```javascript
// ✅ Good for long lists
<FlatList data={items} renderItem={renderItem} />

// ❌ Bad for long lists
<ScrollView>
  {items.map(item => <Item key={item.id} />)}
</ScrollView>
```

2. **Memoize expensive components:**
```javascript
const MemoizedComponent = React.memo(({ data }) => {
  return <View>{/* Expensive render */}</View>;
});
```

3. **Optimize images:**
```javascript
<Image
  source={{ uri: imageUrl }}
  resizeMode="cover"
  style={{ width: 100, height: 100 }}
/>
```

---

### **Issue: Memory leaks**

**Solution:**

1. **Clean up listeners:**
```javascript
useEffect(() => {
  const listener = socketService.onNewMessage(handleMessage);
  
  return () => {
    // Clean up
    socketService.socket?.off('new-message', listener);
  };
}, []);
```

2. **Cancel async operations:**
```javascript
useEffect(() => {
  let cancelled = false;
  
  const fetchData = async () => {
    const data = await loadData();
    if (!cancelled) {
      setData(data);
    }
  };
  
  fetchData();
  
  return () => {
    cancelled = true;
  };
}, []);
```

---

## 🆘 Getting Help

### **Check Logs First**

```bash
# Expo logs
npx expo start

# Backend logs
cd backend && npm start

# Device logs
adb logcat  # Android
npx react-native log-ios  # iOS
```

### **Search for Error Messages**

1. Copy exact error message
2. Search on:
   - Stack Overflow
   - GitHub Issues
   - Expo Forums
   - React Native Docs

### **Ask for Help**

When asking for help, include:
1. Exact error message
2. What you were trying to do
3. What you've already tried
4. Relevant code snippets
5. Platform (iOS/Android/Web)
6. Expo SDK version

### **Useful Resources**

- **Expo Docs:** https://docs.expo.dev
- **React Native Docs:** https://reactnative.dev
- **Firebase Docs:** https://firebase.google.com/docs
- **Socket.io Docs:** https://socket.io/docs
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/expo
- **Expo Forums:** https://forums.expo.dev

---

## 🔄 Reset Everything (Last Resort)

If nothing works, try a complete reset:

```bash
# 1. Clear all caches
npm cache clean --force
npx expo start -c

# 2. Remove node_modules
rm -rf node_modules
rm package-lock.json

# 3. Reinstall
npm install

# 4. Clear Expo cache
rm -rf ~/.expo

# 5. Restart Metro bundler
npx expo start --clear

# 6. If still broken, reset git
git clean -fdx
git reset --hard
npm install
```

---

## 📞 Still Stuck?

If you've tried everything and still have issues:

1. **Check the other docs:**
   - [Getting Started](./02-GETTING-STARTED.md)
   - [Architecture](./03-ARCHITECTURE.md)
   - [Code Structure](./06-CODE-STRUCTURE.md)

2. **Review the code:**
   - Check for typos
   - Verify all imports
   - Compare with working examples

3. **Start fresh:**
   - Create new Expo project
   - Copy code file by file
   - Test after each file

4. **Ask the community:**
   - Expo Discord
   - React Native Discord
   - Stack Overflow

---

**Remember: Most issues are simple fixes. Check the basics first!** 🔍
