import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(k => k.includes("@studyjam_courses_"));
      
      const userList = [];
      for (const key of userKeys) {
        const userId = key.replace("@studyjam_courses_", "");
        const coursesData = await AsyncStorage.getItem(key);
        const groupsData = await AsyncStorage.getItem(`@studyjam_groups_${userId}`);
        const messagesData = await AsyncStorage.getItem(`@studyjam_message_count_${userId}`);
        
        const courses = coursesData ? JSON.parse(coursesData) : [];
        const groups = groupsData ? JSON.parse(groupsData) : [];
        const messages = messagesData ? parseInt(messagesData) : 0;
        
        userList.push({
          id: userId,
          email: `User ${userId.substring(0, 8)}`,
          coursesCount: courses.length,
          groupsCount: groups.length,
          messagesCount: messages,
        });
      }
      
      setUsers(userList);
      setFilteredUsers(userList);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleDeleteUser = (userId) => {
    Alert.alert(
      "Delete User",
      "This will delete all data for this user. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(`@studyjam_courses_${userId}`);
              await AsyncStorage.removeItem(`@studyjam_groups_${userId}`);
              await AsyncStorage.removeItem(`@studyjam_profile_${userId}`);
              await AsyncStorage.removeItem(`@studyjam_message_count_${userId}`);
              await AsyncStorage.removeItem(`@studyjam_notifications_${userId}`);
              await AsyncStorage.removeItem(`@studyjam_notes_${userId}`);
              
              Alert.alert("Success", "User data deleted");
              loadUsers();
            } catch (error) {
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userId}>ID: {item.id.substring(0, 12)}...</Text>
        <View style={styles.userStats}>
          <Text style={styles.statText}>📚 {item.coursesCount} courses</Text>
          <Text style={styles.statText}>💬 {item.groupsCount} groups</Text>
          <Text style={styles.statText}>✉️ {item.messagesCount} messages</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteUser(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <TouchableOpacity onPress={loadUsers}>
          <Text style={styles.refreshButton}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search users..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
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
  refreshButton: {
    fontSize: 28,
    color: "#6366f1",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    margin: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  list: {
    paddingHorizontal: 15,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  userInfo: {
    marginBottom: 10,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  userStats: {
    flexDirection: "row",
    gap: 15,
  },
  statText: {
    fontSize: 13,
    color: "#666",
  },
  deleteButton: {
    backgroundColor: "#ff6b35",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
