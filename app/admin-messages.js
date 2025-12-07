import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AdminMessages() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState({
    totalMessages: 0,
    activeUsers: 0,
    averagePerUser: 0,
    topUsers: [],
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const messageKeys = keys.filter(k => k.includes("@studyjam_message_count_"));
      
      let totalMessages = 0;
      const userMessages = [];
      
      for (const key of messageKeys) {
        const userId = key.replace("@studyjam_message_count_", "");
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const count = parseInt(data);
          totalMessages += count;
          userMessages.push({
            userId: userId.substring(0, 8),
            count,
          });
        }
      }
      
      // Sort by message count
      userMessages.sort((a, b) => b.count - a.count);
      const topUsers = userMessages.slice(0, 5);
      
      const activeUsers = userMessages.filter(u => u.count > 0).length;
      const averagePerUser = activeUsers > 0 ? Math.round(totalMessages / activeUsers) : 0;
      
      setAnalytics({
        totalMessages,
        activeUsers,
        averagePerUser,
        topUsers,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Message Analytics</Text>
        <TouchableOpacity onPress={loadAnalytics}>
          <Text style={styles.refreshButton}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{analytics.totalMessages}</Text>
              <Text style={styles.statLabel}>Total Messages</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{analytics.activeUsers}</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{analytics.averagePerUser}</Text>
              <Text style={styles.statLabel}>Avg per User</Text>
            </View>
          </View>
        </View>

        {/* Top Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 Most Active Users</Text>
          {analytics.topUsers.length > 0 ? (
            analytics.topUsers.map((user, index) => (
              <View key={user.userId} style={styles.userCard}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>User {user.userId}</Text>
                  <Text style={styles.userMessages}>{user.count} messages</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(user.count / analytics.topUsers[0].count) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No message data available</Text>
          )}
        </View>

        {/* Activity Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>📊</Text>
            <View style={styles.insightInfo}>
              <Text style={styles.insightTitle}>Engagement Rate</Text>
              <Text style={styles.insightText}>
                {analytics.activeUsers > 0
                  ? `${Math.round((analytics.activeUsers / analytics.activeUsers) * 100)}% of users are active`
                  : "No active users yet"}
              </Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>💬</Text>
            <View style={styles.insightInfo}>
              <Text style={styles.insightTitle}>Communication</Text>
              <Text style={styles.insightText}>
                {analytics.totalMessages > 0
                  ? `${analytics.totalMessages} messages sent across all groups`
                  : "No messages sent yet"}
              </Text>
            </View>
          </View>
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
  refreshButton: {
    fontSize: 28,
    color: "#6366f1",
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 15,
    marginTop: 20,
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
    width: "31%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#6366f1",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  rankBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rankText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  userInfo: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  userMessages: {
    fontSize: 14,
    color: "#666",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 4,
  },
  insightCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  insightIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    padding: 20,
  },
});
