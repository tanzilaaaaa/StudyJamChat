import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { onAuthState } from "../src/firebaseConfig";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen to auth state changes - Firebase handles persistence automatically
    const unsubscribe = onAuthState((currentUser) => {
      console.log("Auth state changed:", currentUser ? `User: ${currentUser.email}` : "No user");
      setUser(currentUser);
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";
    console.log("Navigation check - User:", !!user, "Segments:", segments, "In auth:", inAuthGroup);

    if (user && inAuthGroup) {
      // User is logged in but on auth screens → go to dashboard
      console.log("✅ User logged in, redirecting to dashboard");
      router.replace("/dashboard");
    } else if (!user && !inAuthGroup) {
      // User is not logged in and not on auth screens → go to login
      console.log("❌ No user, redirecting to login");
      router.replace("/login");
    }
  }, [user, initializing, segments]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <View style={{ marginTop: 10 }}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      </View>
    );
  }

  return <Slot />;
}
