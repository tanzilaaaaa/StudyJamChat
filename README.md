# StudyJam - React Native + Expo + Firebase Auth

A minimal authentication app built with React Native, Expo Router, and Firebase Authentication.

## Features

- ✅ Firebase Email/Password Authentication
- ✅ Expo Router for navigation
- ✅ Login Screen
- ✅ Signup Screen  
- ✅ Protected Home/Landing Screen
- ✅ Auto-redirect based on auth state
- ✅ Logout functionality

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npx expo start
   ```

3. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## App Structure

```
app/
├── layout.js      # Root layout with auth state management
├── index.js       # Home/Landing screen (protected)
├── login.js       # Login screen
└── signup.js      # Signup screen

src/
└── firebaseConfig.js  # Firebase configuration & auth helpers
```

## How It Works

1. **Initial Load**: The app checks if a user is logged in
2. **Not Logged In**: Redirects to `/login`
3. **Logged In**: Shows the home screen at `/`
4. **After Login/Signup**: Automatically redirects to home
5. **Logout**: Returns to login screen

## Firebase Configuration

Firebase is already configured in `src/firebaseConfig.js` with your project credentials. The app uses:
- Firebase Authentication (Email/Password)
- Helper functions: `signup()`, `login()`, `logout()`, `onAuthState()`

## Testing

1. Create an account on the signup screen
2. You'll be automatically logged in and redirected to home
3. Logout and try logging back in
4. Close and reopen the app - you should stay logged in

## Next Steps

This is a minimal auth setup. You can now build your full app features on top of this foundation!
