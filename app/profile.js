import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { getUserRole, logout, onAuthState } from "../src/firebaseConfig";
import {
    getMessageCount,
    loadCourses,
    loadGroups,
    loadProfile,
    saveProfile
} from "../src/storage";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [stats, setStats] = useState({
    courses: 0,
    groups: 0,
    messages: 0,
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthState(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
        
        // Get user role
        const role = await getUserRole(currentUser.uid);
        setUserRole(role);
        
        loadProfileData(currentUser);
        loadStats(currentUser);
      } else {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  // Reload stats whenever the profile page is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        loadStats(user);
      }
    }, [user])
  );

  const loadProfileData = async (currentUser) => {
    const userId = currentUser?.uid || user?.uid;
    if (!userId) return;
    const profile = await loadProfile(userId);
    setBio(profile.bio || "");
    setMajor(profile.major || "");
    setYear(profile.year || "");
  };

  const loadStats = async (currentUser) => {
    const userId = currentUser?.uid || user?.uid;
    if (!userId) return;
    
    const courses = await loadCourses(userId);
    const groups = await loadGroups(userId);
    const messageCount = await getMessageCount(userId);
    
    setStats({
      courses: courses.length,
      groups: groups.length,
      messages: messageCount,
    });
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    // Save profile updates
    await saveProfile(user.uid, { bio, major, year });
    Alert.alert("Success", "Profile updated successfully!");
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      setShowLogoutModal(true);
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: confirmLogout,
          },
        ]
      );
    }
  };

  const confirmLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!user) {
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
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={styles.editButton}>{isEditing ? "Cancel" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {/* User Info */}
          <View style={styles.infoSection}>
            <Text style={styles.label}>Display Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.value}>
                {user.displayName || "Not set"}
              </Text>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          {userRole !== "admin" && (
            <>
              <View style={styles.infoSection}>
                <Text style={styles.label}>Major</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={major}
                    onChangeText={setMajor}
                    placeholder="e.g., Computer Science"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text style={styles.value}>{major || "Not set"}</Text>
                )}
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.label}>Year</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={year}
                    onChangeText={setYear}
                    placeholder="e.g., Junior"
                    placeholderTextColor="#999"
                  />
                ) : (
                  <Text style={styles.value}>{year || "Not set"}</Text>
                )}
              </View>
            </>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.label}>Bio</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.value}>{bio || "Not set"}</Text>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.courses}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.groups}</Text>
              <Text style={styles.statLabel}>Study Groups</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.messages}</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonLogout]}
                onPress={() => {
                  setShowLogoutModal(false);
                  confirmLogout();
                }}
              >
                <Text style={styles.modalButtonTextLogout}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  editButton: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "700",
  },
  infoSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    color: "#1a1a1a",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  input: {
    fontSize: 16,
    color: "#1a1a1a",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#6366f1",
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#6366f1",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  statsSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6366f1",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "#ff6b35",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#f5f5f5",
  },
  modalButtonLogout: {
    backgroundColor: "#ff6b35",
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modalButtonTextLogout: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
