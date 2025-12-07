import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../src/firebaseConfig";
import socketService from "../src/socketService";
import { addNotification, incrementMessageCount } from "../src/storage";

export default function ChatRoom() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { roomId, roomName, userId, userName } = params;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Try to get user from params first, then from auth
    if (userId && userName) {
      setUser({ uid: userId, displayName: userName, email: userName });
      console.log("User set from params:", userName);
    } else {
      // Listen for auth state changes to get current user
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        console.log("Auth state changed in chat room:", currentUser);
        if (currentUser) {
          setUser(currentUser);
          console.log("User set from auth:", currentUser.email);
        } else {
          console.log("No user found!");
        }
      });

      return () => unsubscribe();
    }
  }, [userId, userName]);

  useEffect(() => {
    // Connect to socket and join room
    const initSocket = async () => {
      try {
        await socketService.connect();
        socketService.joinRoom(roomId);
      } catch (error) {
        console.error('Failed to connect to socket:', error);
      }
    };

    initSocket();

    // Listen for existing messages
    socketService.onRoomMessages((msgs) => {
      setMessages(msgs);
    });

    // Listen for new messages
    socketService.onNewMessage(async (msg) => {
      setMessages((prev) => [...prev, msg]);
      
      // Increment message count if it's not from current user
      const currentUserId = userId || user?.uid;
      if (msg.userId !== currentUserId && currentUserId) {
        await incrementMessageCount(currentUserId);
        
        // Create notification for new message
        await addNotification(currentUserId, {
          type: 'message',
          title: `New message in ${roomName}`,
          message: `${msg.userName}: ${msg.text.substring(0, 50)}${msg.text.length > 50 ? '...' : ''}`,
          roomId: roomId,
          roomName: roomName,
        });
      }
      
      // Auto scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    socketService.onMessagesDeleted((msgIds) => {
      console.log('Messages deleted event received:', msgIds.length);
      setMessages((prev) => prev.filter((m) => !msgIds.includes(m.id)));
    });

    // Cleanup
    return () => {
      socketService.removeAllListeners();
    };
  }, [roomId]);

  const handleSend = async () => {
    console.log("Send button pressed");
    console.log("Input text:", inputText);
    console.log("User from params:", { userId, userName });
    console.log("User from state:", user);
    console.log("Room ID:", roomId);
    
    if (inputText.trim()) {
      // Use params if available, otherwise use state
      const currentUserId = userId || user?.uid;
      const currentUserName = userName || user?.displayName || user?.email;
      
      if (!currentUserId || !currentUserName) {
        console.log("No user info available!");
        return;
      }
      
      const message = {
        text: inputText.trim(),
        userId: currentUserId,
        userName: currentUserName,
      };

      console.log("Sending message:", message);
      socketService.sendMessage(roomId, message);
      
      // Increment message count for sent messages
      if (currentUserId) {
        await incrementMessageCount(currentUserId);
      }
      
      setInputText("");
    } else {
      console.log("No text to send");
    }
  };

  const handlePickFile = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web-specific file handling
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*/*';
        
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          // Check file size (limit to 10MB)
          const maxSize = 10 * 1024 * 1024;
          if (file.size > maxSize) {
            alert("File is too large. Maximum size is 10MB.");
            return;
          }
          
          // Read file as base64
          const reader = new FileReader();
          reader.onload = async (event) => {
            const base64 = event.target.result.split(',')[1]; // Remove data:*/*;base64, prefix
            
            const currentUserId = userId || user?.uid;
            const currentUserName = userName || user?.displayName || user?.email;

            if (!currentUserId || !currentUserName) {
              alert("User not authenticated");
              return;
            }

            const message = {
              text: `📎 ${file.name}`,
              userId: currentUserId,
              userName: currentUserName,
              fileInfo: {
                name: file.name,
                size: file.size,
                type: file.type,
                base64: base64,
              },
            };

            console.log('Sending file message:', { name: file.name, size: file.size, type: file.type });
            socketService.sendMessage(roomId, message);
            
            if (currentUserId) {
              await incrementMessageCount(currentUserId);
            }
          };
          
          reader.readAsDataURL(file);
        };
        
        input.click();
      } else {
        // Mobile file handling
        const result = await DocumentPicker.getDocumentAsync({
          type: "*/*",
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const file = result.assets[0];
          
          // Check file size (limit to 10MB)
          const maxSize = 10 * 1024 * 1024;
          if (file.size > maxSize) {
            Alert.alert("File Too Large", "Maximum file size is 10MB. Please choose a smaller file.");
            return;
          }
          
          // Read file as base64
          const base64 = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const currentUserId = userId || user?.uid;
          const currentUserName = userName || user?.displayName || user?.email;

          if (!currentUserId || !currentUserName) {
            Alert.alert("Error", "User not authenticated");
            return;
          }

          const message = {
            text: `📎 ${file.name}`,
            userId: currentUserId,
            userName: currentUserName,
            fileInfo: {
              name: file.name,
              size: file.size,
              type: file.mimeType,
              base64: base64,
            },
          };

          console.log('Sending file message:', { name: file.name, size: file.size, type: file.mimeType });
          socketService.sendMessage(roomId, message);
          
          if (currentUserId) {
            await incrementMessageCount(currentUserId);
          }
        }
      }
    } catch (error) {
      console.error("Error picking file:", error);
      if (Platform.OS === 'web') {
        alert("Failed to pick file");
      } else {
        Alert.alert("Error", "Failed to pick file");
      }
    }
  };

  const handleFileOpen = async (fileInfo) => {
    if (!fileInfo || !fileInfo.base64) {
      if (Platform.OS === 'web') {
        alert("File not available");
      } else {
        Alert.alert("Error", "File not available");
      }
      return;
    }

    try {
      if (Platform.OS === 'web') {
        // Web-specific file opening - open in new tab for preview
        const byteCharacters = atob(fileInfo.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileInfo.type || 'application/octet-stream' });
        
        // Open in new tab for preview
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Clean up after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        // Mobile file opening
        const fileName = fileInfo.name || "file";
        const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
        
        await FileSystem.writeAsStringAsync(fileUri, fileInfo.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri);
        } else {
          const canOpen = await Linking.canOpenURL(fileUri);
          if (canOpen) {
            await Linking.openURL(fileUri);
          } else {
            Alert.alert("Error", "Cannot open this file type");
          }
        }
      }
    } catch (error) {
      console.error("Error opening file:", error);
      if (Platform.OS === 'web') {
        alert("Failed to open file");
      } else {
        Alert.alert("Error", "Failed to open file");
      }
    }
  };

  const handleLongPress = (messageId) => {
    if (selectionMode) {
      toggleMessageSelection(messageId);
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedMessages([]);
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedMessages.length === 0) return;

    const confirmDelete = () => {
      socketService.deleteMessages(roomId, selectedMessages);
      setSelectedMessages([]);
      setSelectionMode(false);
    };

    if (Platform.OS === 'web') {
      if (confirm(`Delete ${selectedMessages.length} message(s)?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete Messages",
        `Delete ${selectedMessages.length} message(s)?`,
        [
          {
            text: "Delete",
            onPress: confirmDelete,
            style: "destructive",
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    }
  };

  const handleMessagePress = (messageId, isFile, fileInfo) => {
    if (selectionMode) {
      toggleMessageSelection(messageId);
    } else if (isFile) {
      handleFileOpen(fileInfo);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = user && item.userId === user.uid;
    const time = new Date(item.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const isFile = item.fileInfo && item.fileInfo.base64;
    const isSelected = selectedMessages.includes(item.id);

    return (
      <View style={styles.messageWrapper}>
        {selectionMode && (
          <TouchableOpacity
            onPress={() => toggleMessageSelection(item.id)}
            style={styles.checkbox}
          >
            <View style={[styles.checkboxInner, isSelected && styles.checkboxSelected]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onLongPress={() => handleLongPress(item.id)}
          onPress={() => handleMessagePress(item.id, isFile, item.fileInfo)}
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessage : styles.otherMessage,
            isFile && styles.fileMessage,
            isSelected && styles.selectedMessage,
          ]}
        >
          {!isMyMessage && (
            <Text style={styles.userName}>{item.userName}</Text>
          )}
          <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
            {item.text}
          </Text>
          {isFile && (
            <Text style={[styles.fileInfo, isMyMessage && styles.myMessageText]}>
              {item.fileInfo.size ? `${(item.fileInfo.size / 1024).toFixed(1)} KB` : ''}
              {item.fileInfo.type ? ` • ${item.fileInfo.type.split('/')[1]?.toUpperCase()}` : ''}
            </Text>
          )}
          <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>
            {time}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        {!selectionMode ? (
          <>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{roomName}</Text>
              <Text style={styles.headerSubtitle}>
                {messages.length} messages
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/pinboard",
                  params: { roomId, roomName },
                })
              }
              style={styles.headerButton}
            >
              <Text style={styles.pinButton}>
                📌 {pinnedMessages.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleSelectionMode}
              style={styles.headerButton}
            >
              <Text style={styles.selectButton}>Select</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={toggleSelectionMode}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                {selectedMessages.length} selected
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleDeleteSelected}
              disabled={selectedMessages.length === 0}
              style={[
                styles.deleteButton,
                selectedMessages.length === 0 && styles.deleteButtonDisabled
              ]}
            >
              <Text style={[
                styles.deleteButtonText,
                selectedMessages.length === 0 && styles.deleteButtonTextDisabled
              ]}>
                Delete
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to send a message!
            </Text>
          </View>
        }
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handlePickFile}
        >
          <Text style={styles.attachIcon}>+</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerButton: {
    marginLeft: 12,
  },
  pinButton: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "600",
  },
  selectButton: {
    fontSize: 15,
    color: "#6366f1",
    fontWeight: "600",
  },
  cancelButton: {
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: "#fca5a5",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButtonTextDisabled: {
    opacity: 0.6,
  },
  messagesList: {
    padding: 15,
    paddingBottom: 10,
  },
  messageWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    marginRight: 10,
    padding: 4,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxSelected: {
    backgroundColor: "#6366f1",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  messageContainer: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 15,
  },
  selectedMessage: {
    opacity: 0.7,
    borderWidth: 2,
    borderColor: "#6366f1",
  },
  pinButtonWeb: {
    marginLeft: 8,
    padding: 4,
  },
  pinIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#6366f1",
  },
  fileMessage: {
    borderWidth: 2,
    borderColor: "#4ade80",
    borderStyle: "dashed",
  },
  fileInfo: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  userName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366f1",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: "#1a1a1a",
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myTimestamp: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
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
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  attachButton: {
    padding: 10,
    marginRight: 5,
  },
  attachIcon: {
    fontSize: 28,
    fontWeight: "300",
    color: "#6366f1",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#6366f1",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
