# Authentication Flow

## 🔐 Overview

StudyJam uses a **dual-role authentication system** with separate flows for Students and Administrators.

```
Landing Page
    │
    ├─ Student Path
    │   ├─ Login → Dashboard
    │   └─ Signup → Dashboard
    │
    └─ Admin Path
        ├─ Admin Login → Admin Dashboard
        └─ Admin Signup → Admin Dashboard
```

---

## 👥 User Roles

### Student Role
- **Access**: View courses, join groups, send messages, create notes
- **Restrictions**: Cannot add/edit/delete courses
- **Profile Fields**: Name, Email, Bio, Major, Year

### Admin Role
- **Access**: All student features + course management
- **Permissions**: Add/edit/delete courses, manage users
- **Profile Fields**: Name, Email, Bio (no Major/Year)

---

## 🔄 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Opens App                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  Check Auth    │
            │     State      │
            └────────┬───────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────┐           ┌──────────┐
    │ Logged  │           │   Not    │
    │   In    │           │ Logged In│
    └────┬────┘           └─────┬────┘
         │                      │
         ▼                      ▼
    ┌─────────┐           ┌──────────┐
    │  Check  │           │ Landing  │
    │  Role   │           │   Page   │
    └────┬────┘           └─────┬────┘
         │                      │
    ┌────┴────┐            ┌────┴────┐
    │         │            │         │
    ▼         ▼            ▼         ▼
┌────────┐ ┌──────┐   ┌──────┐  ┌────────┐
│Student │ │Admin │   │Login │  │ Signup │
│  Dash  │ │ Dash │   │      │  │        │
└────────┘ └──────┘   └──────┘  └────────┘
```

---

## 📝 Student Signup Flow

### Step 1: User Input
```javascript
// app/signup.js
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [name, setName] = useState('');
const [major, setMajor] = useState('');
const [year, setYear] = useState('');
```

### Step 2: Firebase Authentication
```javascript
const handleSignup = async () => {
  // Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(
    auth, 
    email, 
    password
  );
  
  // Update display name
  await updateProfile(userCredential.user, {
    displayName: name
  });
};
```

### Step 3: Store Role in Firestore
```javascript
// Store user role
await setDoc(doc(db, 'users', userCredential.user.uid), {
  email: email,
  role: 'student',  // Important!
  displayName: name,
  createdAt: new Date()
});
```

### Step 4: Store Profile Locally
```javascript
// Save profile to AsyncStorage
await saveProfile(userCredential.user.uid, {
  bio: '',
  major: major,
  year: year
});
```

### Step 5: Navigate to Dashboard
```javascript
router.replace('/dashboard');
```

---

## 🔑 Student Login Flow

### Step 1: User Input
```javascript
// app/login.js
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
```

### Step 2: Authenticate
```javascript
const handleLogin = async () => {
  // Sign in with Firebase
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
};
```

### Step 3: Verify Role
```javascript
// Check if user is a student
const role = await getUserRole(userCredential.user.uid);

if (role !== 'student') {
  // Wrong role - logout
  await logout();
  Alert.alert('Error', 'Please use student login');
  return;
}
```

### Step 4: Navigate
```javascript
router.replace('/dashboard');
```

---

## 👨‍💼 Admin Authentication

### Admin Signup
```javascript
// app/admin-signup.js
await setDoc(doc(db, 'users', user.uid), {
  email: email,
  role: 'admin',  // Admin role
  displayName: name,
  createdAt: new Date()
});

router.replace('/admin-dashboard');
```

### Admin Login
```javascript
// app/admin-login.js
const role = await getUserRole(user.uid);

if (role !== 'admin') {
  await logout();
  Alert.alert('Error', 'Admin access required');
  return;
}

router.replace('/admin-dashboard');
```

---

## 🛡️ Role Verification

### Firebase Function
```javascript
// src/firebaseConfig.js
export const getUserRole = async (uid) => {
  try {
    const userData = await getUserData(uid);
    return userData?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const getUserData = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? userDoc.data() : null;
};
```

### Role-Based Routing
```javascript
// Dashboard check
useEffect(() => {
  const unsubscribe = onAuthState(async (user) => {
    if (user) {
      const role = await getUserRole(user.uid);
      
      if (role === 'admin') {
        router.replace('/admin-dashboard');
      } else if (role === 'student') {
        // Stay on student dashboard
      } else {
        // No role - logout
        await logout();
        router.replace('/login');
      }
    }
  });
  
  return () => unsubscribe();
}, []);
```

---

## 🔄 Session Management

### Persistent Login
```javascript
// Firebase handles session persistence automatically
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
```

### Auth State Listener
```javascript
// Listen for auth changes
export const onAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Usage in components
useEffect(() => {
  const unsubscribe = onAuthState((user) => {
    if (user) {
      setCurrentUser(user);
      loadUserData(user);
    } else {
      router.replace('/login');
    }
  });
  
  return () => unsubscribe();
}, []);
```

---

## 🚪 Logout Flow

### Logout Function
```javascript
// src/firebaseConfig.js
export const logout = async () => {
  try {
    await signOut(auth);
    // Clear local data if needed
    // await AsyncStorage.clear();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};
```

### Logout with Confirmation
```javascript
// app/profile.js
const handleLogout = async () => {
  if (Platform.OS === 'web') {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
      router.replace('/login');
    }
  } else {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
          style: 'destructive'
        }
      ]
    );
  }
};
```

---

## 🔒 Security Measures

### 1. Password Requirements
```javascript
// Minimum 6 characters (Firebase default)
if (password.length < 6) {
  Alert.alert('Error', 'Password must be at least 6 characters');
  return;
}
```

### 2. Email Validation
```javascript
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

if (!isValidEmail(email)) {
  Alert.alert('Error', 'Please enter a valid email');
  return;
}
```

### 3. Role Verification
```javascript
// Always verify role on sensitive operations
const role = await getUserRole(user.uid);
if (role !== 'admin') {
  Alert.alert('Access Denied', 'Admin privileges required');
  return;
}
```

### 4. Protected Routes
```javascript
// Check auth before rendering
if (!user) {
  return <Redirect href="/login" />;
}
```

---

## 🐛 Error Handling

### Common Firebase Errors
```javascript
try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  switch (error.code) {
    case 'auth/user-not-found':
      Alert.alert('Error', 'No account found with this email');
      break;
    case 'auth/wrong-password':
      Alert.alert('Error', 'Incorrect password');
      break;
    case 'auth/invalid-email':
      Alert.alert('Error', 'Invalid email address');
      break;
    case 'auth/email-already-in-use':
      Alert.alert('Error', 'Email already registered');
      break;
    default:
      Alert.alert('Error', error.message);
  }
}
```

---

## 📊 Authentication State Flow

```
App Launch
    │
    ▼
onAuthStateChanged
    │
    ├─ user = null → Show Login
    │
    └─ user exists
           │
           ▼
      Get User Role
           │
           ├─ role = 'student' → Student Dashboard
           │
           ├─ role = 'admin' → Admin Dashboard
           │
           └─ role = null → Logout & Show Login
```

---

## 🎯 Best Practices

1. **Always verify role** on both client and server
2. **Use Firebase Auth** for authentication (don't roll your own)
3. **Store minimal data** in Firestore (just role and email)
4. **Handle errors gracefully** with user-friendly messages
5. **Clear sensitive data** on logout if needed
6. **Use secure connections** (HTTPS/WSS in production)
7. **Implement rate limiting** to prevent brute force attacks

---

**Next**: [Features Guide →](./05-FEATURES.md)
