import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { onAuthState } from "../src/firebaseConfig";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthState(async (user) => {
      if (user) {
        // User is logged in, check their role
        const { getUserRole } = require("../src/firebaseConfig");
        const role = await getUserRole(user.uid);
        
        if (role === "admin") {
          router.replace("/admin-dashboard");
        } else {
          router.replace("/dashboard");
        }
      } else {
        // No user, go to login
        router.replace("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
