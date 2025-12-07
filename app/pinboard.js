import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import socketService from "../src/socketService";

export default function Pinboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { roomId, roomName } = params;

  const [pinnedMessages, setPinnedMessages] = useState([]);

  useEffect(() => {
    // Connect and join room to get pinned messages
    const initSocket = async () => {
      try {
        await socketService.connect();
        socketService.joinRoom(roomId);
      } catch (error) {
        console.error("Failed to connect to socket in Pinboard:", error);
      }
    };

    initSocket();

    // Listen for pinned messages
    socketService.onPinnedMessages((pins) => {
      console.log("Received pinned messages:", pins.length);
      setPinnedMessages(pins);
    });

    socketService.onMessagePinned((msg) => {
      console.log("Message pinned:", msg.id);
      setPinnedMessages((prev) => [...prev, msg]);
    });

    socketService.onMessageUnpinned((msgId) => {
      console.log("Message unpinned:", msgId);
      setPinnedMessages((prev) => prev.filter((m) => m.id !== msgId));
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [roomId]);

  const handleUnpin = (messageId) => {
    console.log("handleUnpin called for messageId:", messageId);
    console.log("roomId:", roomId);

    const isWeb = typeof window !== "undefined" && window.document;

    if (isWeb) {
      // On web, use confirm dialog
      if (confirm("Remove this message from pinboard?")) {
        console.log("User confirmed unpin");
        socketService.unpinMessage(roomId, messageId);
      } else {
        console.log("User cancelled unpin");
      }
    } else {
      // On mobile, use Alert
      Alert.alert("Unpin Message", "Remove this message from pinboard?", [
        {
          text: "Unpin",
          onPress: () => {
            console.log("User confirmed unpin");
            socketService.unpinMessage(roomId, messageId);
          },
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("User cancelled unpin"),
        },
      ]);
    }
  };

  const renderPinnedMessage = ({ item }) => {
    const time = new Date(item.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = new Date(item.timestamp).toLocaleDateString();

    return (
      <View style={styles.pinnedCard}>
        <View style={styles.pinnedHeader}>
          <View>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.timestamp}>
              {date} at {time}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleUnpin(item.id)}>
            <Text style={styles.unpinButton}>Unpin</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Pinned Messages</Text>
          <Text style={styles.headerSubtitle}>{roomName}</Text>
        </View>
      </View>

      {/* Pinned Messages List */}
      <FlatList
        data={pinnedMessages}
        renderItem={renderPinnedMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📌</Text>
            <Text style={styles.emptyText}>No pinned messages</Text>
            <Text style={styles.emptySubtext}>
              Long press any message in the chat to pin it here
            </Text>
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
  headerCenter: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  list: {
    padding: 15,
  },
  pinnedCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#6366f1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pinnedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366f1",
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
  },
  unpinButton: {
    fontSize: 14,
    color: "#ff6b35",
    fontWeight: "600",
  },
  messageText: {
    fontSize: 15,
    color: "#1a1a1a",
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
