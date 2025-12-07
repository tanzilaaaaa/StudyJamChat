# Role-Based Authentication System

## Overview
Complete separation of Admin and Student authentication with Firestore role management.

## System Architecture

### 1. User Roles
- **Student**: Default role for all signups
- **Admin**: Must be manually set in Firestore

### 2. Authentication Flow

#### Student Flow:
1. Student signs up → `/signup` → Creates account with role="student" in Firestore
2. Student logs in → `/login` → Uses `studentLogin()` → Checks role="student"
3. Redirects to → `/dashboard` (Student Dashboard)

#### Admin Flow:
1. Admin logs in → `/admin-login` → Uses `adminLogin()` → Checks role="admin"
2. Redirects to → `/admin-dashboard` (Admin Dashboard)

### 3. Route Protection

#### Student Dashboard (`/dashboard`):
- Checks if user role is "student"
- If admin, redirects to `/admin-dashboard`
- If no user, redirects to `/login`

#### Admin Dashboard (`/admin-dashboard`):
- Checks if user role is "admin"
- If not admin, redirects to `/admin-login`
- If no user, redirects to `/admin-login`

## Firebase Functions

### `signup(email, password, name)`
- Creates user with Firebase Auth
- Saves to Firestore with **role="student"** (ALWAYS)
- Returns user credential

### `studentLogin(email, password)`
- Authenticates with Firebase
- Checks Firestore role === "student"
- If not student, signs out and throws error
- Returns user credential

### `adminLogin(email, password)`
- Authenticates with Firebase
- Checks Firestore role === "admin"
- If not admin, signs out and throws error
- Returns user credential

### `getUserRole(uid)`
- Fetches user document from Firestore
- Returns role field ("student" or "admin")

## Creating an Admin Account

### Method 1: Firebase Console
1. Sign up as a student first
2. Go to Firebase Console → Firestore
3. Find the user document in `users` collection
4. Change `role: "student"` to `role: "admin"`
5. Login via Admin Login page

### Method 2: Programmatically (for development)
```javascript
import { db } from "./src/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

// After creating a user, update their role
await setDoc(doc(db, "users", userId), {
  role: "admin"
}, { merge: true });
```

## Key Features

### Separation of Concerns
- ✅ Students CANNOT access admin screens
- ✅ Admins CANNOT access student screens
- ✅ Different login pages for each role
- ✅ Different dashboards for each role
- ✅ Roles stored in Firestore (not local storage)

### Security
- Role checked on every login
- Role checked when accessing protected routes
- Users signed out if role doesn't match
- No role mixing possible

### User Experience
- Student Login: Clean, friendly interface
- Admin Login: Dark, professional interface
- Student Dashboard: Shows "Student" badge
- Admin Dashboard: Shows "ADMIN" badge (red)

## File Structure

```
src/
  firebaseConfig.js          # Auth functions with role management
app/
  login.js                   # Student login (uses studentLogin)
  signup.js                  # Student signup (always role="student")
  dashboard.js               # Student dashboard (protected)
  admin-login.js             # Admin login (uses adminLogin)
  admin-dashboard.js         # Admin dashboard (protected)
```

## Testing

### Test Student Account:
1. Go to `/signup`
2. Create account
3. Login via `/login`
4. Should see Student Dashboard with "Student" badge

### Test Admin Account:
1. Create student account first
2. Change role to "admin" in Firestore
3. Login via `/admin-login`
4. Should see Admin Dashboard with "ADMIN" badge

### Test Protection:
1. Try logging into student login with admin account → Should show error
2. Try logging into admin login with student account → Should show error
3. Try accessing `/admin-dashboard` as student → Should redirect
4. Try accessing `/dashboard` as admin → Should redirect

## Important Notes

- **NEVER** set role="admin" in signup code
- **ALWAYS** verify role on login
- **ALWAYS** check role before showing protected content
- Roles are stored in Firestore, not AsyncStorage
- Each role has its own login function
- Roles cannot be changed by users (only in Firestore)
