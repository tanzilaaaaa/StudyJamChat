import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AdminCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const courseKeys = keys.filter(k => k.includes("@studyjam_courses_"));
      
      const allCourses = [];
      for (const key of courseKeys) {
        const userId = key.replace("@studyjam_courses_", "");
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const userCourses = JSON.parse(data);
          userCourses.forEach(course => {
            allCourses.push({
              ...course,
              userId: userId.substring(0, 8),
            });
          });
        }
      }
      
      setCourses(allCourses);
      setFilteredCourses(allCourses);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = courses.filter(course =>
        course.name.toLowerCase().includes(query) ||
        course.code?.toLowerCase().includes(query) ||
        course.professor?.toLowerCase().includes(query)
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

  const renderCourse = ({ item }) => (
    <View style={styles.courseCard}>
      <View style={styles.courseIcon}>
        <Text style={styles.courseIconText}>📚</Text>
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{item.name}</Text>
        {item.code && item.professor && (
          <Text style={styles.courseDetails}>
            {item.code} • {item.professor}
          </Text>
        )}
        {item.credits && (
          <Text style={styles.courseCredits}>{item.credits} Credits</Text>
        )}
        <Text style={styles.courseOwner}>Owner: User {item.userId}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Courses</Text>
        <TouchableOpacity onPress={loadCourses}>
          <Text style={styles.refreshButton}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search courses..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>Total: {courses.length} courses</Text>
      </View>

      {/* Courses List */}
      <FlatList
        data={filteredCourses}
        renderItem={renderCourse}
        keyExtractor={(item) => `${item.userId}-${item.id}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No courses found</Text>
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
    marginBottom: 10,
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
  statsBar: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  statsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 15,
  },
  courseCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  courseIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  courseIconText: {
    fontSize: 20,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  courseDetails: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  courseCredits: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "600",
    marginBottom: 4,
  },
  courseOwner: {
    fontSize: 11,
    color: "#999",
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
