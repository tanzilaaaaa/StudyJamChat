import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import InputModal from "../components/InputModal";
import { logout, onAuthState } from "../src/firebaseConfig";
import { addNotification, getUnreadNotificationCount, loadCourses, loadGroups, loadNotifications, saveCourses, saveGroups } from "../src/storage";

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const hasCheckedRole = useRef(false);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthState(async (user) => {
      console.log("Admin Dashboard - Auth state changed:", user ? user.email : "No user");
      
      if (user) {
        // Only check role once per user session
        if (hasCheckedRole.current) return;
        
        // Check if user is an admin
        const { getUserRole } = require("../src/firebaseConfig");
        const role = await getUserRole(user.uid);
        
        hasCheckedRole.current = true; // Mark as checked
        
        if (role !== "admin") {
          console.log("Not an admin, redirecting to student dashboard");
          router.replace("/dashboard");
          return;
        }
        
        // User is logged in as admin
        setCurrentUser(user);
        loadSavedData(user);
        loadUnreadCount(user);
        createWelcomeNotification(user);
      } else {
        // User logged out - reset the flag and redirect
        hasCheckedRole.current = false;
        console.log("No user in admin dashboard, redirecting to admin login");
        router.replace("/admin-login");
      }
    });

    return () => unsubscribe();
  }, []);

  // Filter courses and groups based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCourses(courses);
      setFilteredGroups(groups);
    } else {
      const query = searchQuery.toLowerCase();
      
      const filteredC = courses.filter(course => 
        course.name.toLowerCase().includes(query) ||
        course.code?.toLowerCase().includes(query) ||
        course.professor?.toLowerCase().includes(query)
      );
      
      const filteredG = groups.filter(group =>
        group.name.toLowerCase().includes(query)
      );
      
      setFilteredCourses(filteredC);
      setFilteredGroups(filteredG);
    }
  }, [searchQuery, courses, groups]);

  const loadUnreadCount = async (user) => {
    const userId = user?.uid || currentUser?.uid;
    if (!userId) return;
    const count = await getUnreadNotificationCount(userId);
    setUnreadCount(count);
  };

  const createWelcomeNotification = async (user) => {
    if (!user?.uid) return;
    const notifications = await loadNotifications(user.uid);
    // Only create welcome notification if there are no notifications yet
    if (notifications.length === 0) {
      await addNotification(user.uid, {
        type: 'system',
        title: 'Welcome Admin! 🎉',
        message: `Hi ${user.displayName || user.email}! You have admin access to manage courses and groups.`,
      });
      loadUnreadCount(user);
    }
  };

  const loadSavedData = async (user) => {
    const userId = user?.uid || currentUser?.uid;
    if (!userId) return;
    
    const savedCourses = await loadCourses(userId);
    const savedGroups = await loadGroups(userId);
    
    if (savedCourses.length > 0) {
      setCourses(savedCourses);
    } else {
      // Default courses with more data
      const defaultCourses = [
        { id: "1", name: "Web Development", code: "CS 101", professor: "Prof. Johnson", credits: "3" },
        { id: "2", name: "Database Systems", code: "CS 201", professor: "Prof. Smith", credits: "4" },
        { id: "3", name: "Data Analytics", code: "MATH 301", professor: "Prof. Davis", credits: "3" },
        { id: "4", name: "Mobile App Development", code: "CS 305", professor: "Prof. Wilson", credits: "3" },
        { id: "5", name: "Cloud Computing", code: "CS 401", professor: "Prof. Brown", credits: "4" },
      ];
      setCourses(defaultCourses);
      saveCourses(userId, defaultCourses);
    }

    if (savedGroups.length > 0) {
      setGroups(savedGroups);
    } else {
      // Default groups
      const defaultGroups = [
        { id: "1", name: "Web Dev Study Group", roomId: "web-dev-study-group" },
        { id: "2", name: "Database Project Team", roomId: "database-project-team" },
      ];
      setGroups(defaultGroups);
      saveGroups(userId, defaultGroups);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/admin-login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleAddCourse = () => {
    if (!currentUser?.uid) {
      Alert.alert("Error", "Please wait, loading user data...");
      return;
    }
    setShowCourseModal(true);
  };

  const handleCourseSubmit = async (courseName) => {
    if (courseName && courseName.trim()) {
      const newCourse = {
        id: Date.now().toString(),
        name: courseName.trim(),
        code: "",
        professor: "",
        credits: "",
      };
      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      await saveCourses(currentUser.uid, updatedCourses);
    }
    setShowCourseModal(false);
  };

  const handleDeleteCourse = (courseId) => {
    Alert.alert(
      "Delete Course",
      "Are you sure you want to delete this course?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedCourses = courses.filter((c) => c.id !== courseId);
            setCourses(updatedCourses);
            await saveCourses(currentUser.uid, updatedCourses);
          },
        },
      ]
    );
  };

  const handleAddGroup = () => {
    if (!currentUser?.uid) {
      Alert.alert("Error", "Please wait, loading user data...");
      return;
    }
    setShowGroupModal(true);
  };

  const handleGroupSubmit = async (groupName) => {
    if (groupName && groupName.trim()) {
      const newGroup = {
        id: Date.now().toString(),
        name: groupName.trim(),
        roomId: `group-${Date.now()}`,
      };
      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      await saveGroups(currentUser.uid, updatedGroups);
    }
    setShowGroupModal(false);
  };

  const handleDeleteGroup = (groupId) => {
    Alert.alert(
      "Delete Study Group",
      "Are you sure you want to delete this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedGroups = groups.filter((g) => g.id !== groupId);
            setGroups(updatedGroups);
            await saveGroups(currentUser.uid, updatedGroups);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>📚</Text>
          </View>
          <Text style={styles.appName}>StudyJam</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {
              router.push("/notifications");
              setUnreadCount(0);
            }}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Admin</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search courses, groups, or content..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* My Courses Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Courses</Text>
          <TouchableOpacity onPress={handleAddCourse}>
            <Text style={styles.addButton}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Course Cards */}
        {filteredCourses.length === 0 && searchQuery.length > 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No courses found</Text>
            <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
          </View>
        ) : (
          filteredCourses.map((course) => (
          <View key={course.id} style={styles.courseCardContainer}>
            <TouchableOpacity
              style={styles.courseCard}
              onPress={() =>
                router.push({
                  pathname: "/course-detail",
                  params: {
                    courseId: course.id,
                    courseName: course.name,
                    courseCode: course.code || "",
                    professor: course.professor || "",
                    credits: course.credits || "",
                  },
                })
              }
            >
              <View style={styles.courseHeader}>
                <View style={styles.courseIcon}>
                  <Text style={styles.courseIconText}>📚</Text>
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.name}</Text>
                  {(course.code || course.professor) && (
                    <Text style={styles.courseSubtitle}>
                      {course.code && course.professor 
                        ? `${course.code} • ${course.professor}`
                        : course.code || course.professor}
                    </Text>
                  )}
                  {course.credits && (
                    <Text style={styles.courseCredits}>{course.credits} Credits</Text>
                  )}
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.courseDeleteBtn}
              onPress={() => handleDeleteCourse(course.id)}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
          ))
        )}

        {/* Study Groups Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Study Groups</Text>
          <TouchableOpacity onPress={handleAddGroup}>
            <Text style={styles.addButton}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Study Group Cards - Clickable for Chat */}
        {filteredGroups.length === 0 && searchQuery.length > 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No study groups found</Text>
            <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
          </View>
        ) : (
          filteredGroups.map((group, index) => (
          <View key={group.id} style={styles.groupCardContainer}>
            <TouchableOpacity
              style={styles.groupCard}
              onPress={() => {
                console.log("Navigating to chat with user:", currentUser);
                router.push({
                  pathname: "/chat-room",
                  params: {
                    roomId: group.roomId,
                    roomName: group.name,
                    userId: currentUser?.uid,
                    userName: currentUser?.displayName || currentUser?.email,
                  },
                });
              }}
            >
              <View style={styles.groupAvatars}>
                <View style={[styles.avatar, { backgroundColor: index === 0 ? "#ff6b6b" : "#4ecdc4" }]}>
                  <Text style={styles.avatarText}>
                    {group.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupTitle}>{group.name}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.groupDeleteBtn}
              onPress={() => handleDeleteGroup(group.id)}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Input Modals */}
      <InputModal
        visible={showCourseModal}
        title="Add New Course"
        placeholder="Enter course name"
        onCancel={() => setShowCourseModal(false)}
        onSubmit={handleCourseSubmit}
      />
      <InputModal
        visible={showGroupModal}
        title="Add Study Group"
        placeholder="Enter group name"
        onCancel={() => setShowGroupModal(false)}
        onSubmit={handleGroupSubmit}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push("/chats")}
        >
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push("/notes")}
        >
          <Text style={styles.navIcon}>📝</Text>
          <Text style={styles.navText}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push("/profile")}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: "#6366f1",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoText: {
    fontSize: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notificationButton: {
    position: "relative",
    padding: 5,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#ff6b35",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "#ff6b35",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 20,
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
  clearButton: {
    fontSize: 18,
    color: "#999",
    paddingHorizontal: 10,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  addButton: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "600",
  },
  courseCardContainer: {
    marginBottom: 12,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  courseIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#e3f2fd",
  },
  courseIconText: {
    fontSize: 20,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 3,
  },
  courseSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  courseCredits: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "600",
  },
  courseDeleteBtn: {
    backgroundColor: "#ff6b35",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  groupCardContainer: {
    marginBottom: 12,
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  groupAvatars: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 3,
  },
  chevron: {
    fontSize: 24,
    color: "#ccc",
  },
  groupDeleteBtn: {
    backgroundColor: "#ff6b35",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginTop: 5,
    marginRight: 15,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 10,
    paddingBottom: 25,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  navIconActive: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: "#999",
  },
  navTextActive: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "600",
  },
});
