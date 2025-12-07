import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyAR-FHwAgeqLTyWdI2anCdnhpzJn50HBcY",
  authDomain: "studyjamchatt.firebaseapp.com",
  projectId: "studyjamchatt",
  storageBucket: "studyjamchatt.firebasestorage.app",
  messagingSenderId: "803576069288",
  appId: "1:803576069288:web:96b02ef04971975cf7d69d",
  measurementId: "G-F8CBTYFSMK"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Auth with proper persistence based on platform
let auth;
try {
  if (Platform.OS === 'web') {
    // For web, use regular getAuth
    const { getAuth } = require('firebase/auth');
    auth = getAuth(app);
  } else {
    // For React Native, use AsyncStorage persistence
    const { getReactNativePersistence } = require('firebase/auth');
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  console.error("Auth initialization error:", error);
  // Fallback to getAuth if initializeAuth fails
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
}

export { auth };

export const db = getFirestore(app);
export const storage = getStorage(app);

// Student Signup - Create user with role="student"
export const studentSignup = async (email, password, name) => {
  try {
    console.log("Creating STUDENT user...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Student user created:", user.uid);

    await updateProfile(user, { displayName: name });
    
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      role: "student",
      createdAt: new Date().toISOString(),
    });
    console.log("Saved to Firestore with role=student");

    return userCredential;
  } catch (error) {
    console.error("Student signup error:", error);
    throw error;
  }
};

// Admin Signup - Create user with role="admin"
export const adminSignup = async (email, password, name) => {
  try {
    console.log("Creating ADMIN user...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Admin user created:", user.uid);

    await updateProfile(user, { displayName: name });
    
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      role: "admin",
      createdAt: new Date().toISOString(),
    });
    console.log("Saved to Firestore with role=admin");

    return userCredential;
  } catch (error) {
    console.error("Admin signup error:", error);
    throw error;
  }
};

// Login - Sign in with email and password
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login completed, auth state should change now");
    return userCredential;
  } catch (error) {
    throw error;
  }
};

// Logout - Sign out user
export const logout = async () => {
  try {
    await fbSignOut(auth);
  } catch (error) {
    throw error;
  }
};

// Listen to auth state changes
export const onAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No user data found");
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Get user role from Firestore
export const getUserRole = async (uid) => {
  try {
    const userData = await getUserData(uid);
    return userData?.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

// Admin login - separate from student login
export const adminLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user has admin role
    let role = await getUserRole(user.uid);
    
    // If no role exists, this is not a valid admin (don't auto-create admin role)
    if (!role) {
      await fbSignOut(auth);
      throw new Error("Access denied. Admin credentials required.");
    }
    
    if (role !== "admin") {
      // Not an admin, sign them out
      await fbSignOut(auth);
      throw new Error("Access denied. Admin credentials required.");
    }
    
    return userCredential;
  } catch (error) {
    throw error;
  }
};

// Student login - separate from admin login
export const studentLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user has student role
    let role = await getUserRole(user.uid);
    
    // If no role exists, create a student role for this user (for legacy users)
    if (!role) {
      console.log("No role found, creating student role for legacy user");
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName || email.split('@')[0],
        email: email,
        role: "student",
        createdAt: new Date().toISOString(),
      });
      role = "student";
    }
    
    if (role !== "student") {
      // Not a student, sign them out
      await fbSignOut(auth);
      throw new Error("Access denied. Student credentials required.");
    }
    
    return userCredential;
  } catch (error) {
    throw error;
  }
};
