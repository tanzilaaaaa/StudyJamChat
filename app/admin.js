import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { onAuthState } from "../src/firebaseConfig";

// Admin emails - these users can access admin panel
const ADMIN_EMAILS = ["admin@studyjam.com", "tanzila@gmail.com"];

export default function Admin() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalGroups: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthState((user) => {
      if (user) {
        // Check if user is admin
        if (!ADMIN_EMAILS.includes(user.email)) {
          Alert.alert("Access Denied", "You don't have admin privileges");
          router.replace("/dashboard");
          return;
        }
        setCurrentUser(user);
        loadStats();
      } else {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const loadStats = async () => {
    try {
      // Get all keys from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      
      const userKeys = keys.filter(k => k.includes("@studyjam_courses_"));
      const courseKeys = keys.filter(k => k.includes("@studyjam_courses_"));
      const groupKeys = keys.filter(k => k.includes("@studyjam_groups_"));
      const messageKeys = keys.filter(k => k.includes("@studyjam_message_count_"));

      let totalCourses = 0;
      let totalGroups = 0;
      let totalMessages = 0;

      // Count courses
      for (const key of courseKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const courses = JSON.parse(data);
          totalCourses += courses.length;
        }
      }

      // Count groups
      for (const key of groupKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const groups = JSON.parse(data);
          totalGroups += groups.length;
        }
      }

      // Count messages
      for (const key of messageKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalMessages += parseInt(data);
        }
      }

      setStats({
        totalUsers: userKeys.length,
        totalCourses,
        totalGroups,
        totalMessages,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete ALL user data. This action cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Success", "All data has been cleared");
              loadStats();
            } catch (error) {
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ]
    );
  };

  const handleViewUsers = () => {
    router.push("/admin-users");
  };

  const handleViewCourses = () => {
    router.push("/admin-courses");
  };

  const handleViewGroups = () => {
    router.push("/admin-groups");
  };

  const handleViewMessages = () => {
    router.push("/admin-messages");
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Admin Info */}
        <View style={styles.adminCard}>
          <Text style={styles.adminLabel}>Logged in as Admin</Text>
          <Text style={styles.adminEmail}>{currentUser.email}</Text>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalCourses}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalGroups}</Text>
              <Text style={styles.statLabel}>Groups</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalMessages}</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
          </View>
        </View>

        {/* Management Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          
          <TouchableOpacity style={styles.menuCard} onPress={handleViewUsers}>
            <Text style={styles.menuIcon}>👥</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Manage Users</Text>
              <Text style={styles.menuSubtitle}>View and manage all users</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={handleViewCourses}>
            <Text style={styles.menuIcon}>📚</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Manage Courses</Text>
              <Text style={styles.menuSubtitle}>View all courses</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={handleViewGroups}>
            <Text style={styles.menuIcon}>💬</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Manage Study Groups</Text>
              <Text style={styles.menuSubtitle}>View all study groups</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={handleViewMessages}>
            <Text style={styles.menuIcon}>📊</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Message Analytics</Text>
              <Text style={styles.menuSubtitle}>View messaging statistics</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearAllData}
          >
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    fontSize: 28,
    color: "#6366f1",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  content: {
    flex: 1,
  },
  adminCard: {
    backgroundColor: "#6366f1",
    margin: 15,
    padding: 20,
    borderRadius: 15,
  },
  adminLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 5,
  },
  adminEmail: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "48%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#6366f1",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  menuIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  chevron: {
    fontSize: 24,
    color: "#ccc",
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ff6b35",
    marginBottom: 15,
  },
  dangerButton: {
    backgroundColor: "#ff6b35",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
