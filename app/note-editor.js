import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../src/firebaseConfig";

export default function NoteEditor() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { noteId, noteTitle, noteContent } = params;

  const [title, setTitle] = useState(noteTitle || "");
  const [content, setContent] = useState(noteContent || "");

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const key = `@studyjam_notes_${user.uid}`;
      const data = await AsyncStorage.getItem(key);
      const notes = data ? JSON.parse(data) : [];

      const updatedNotes = notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              title: title.trim() || "Untitled",
              content: content.trim(),
              updatedAt: new Date().toISOString(),
            }
          : note
      );

      await AsyncStorage.setItem(key, JSON.stringify(updatedNotes));
      Alert.alert("Saved", "Note saved successfully!");
      router.back();
    } catch (error) {
      console.error("Error saving note:", error);
      Alert.alert("Error", "Failed to save note");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Note</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        {/* Content Input */}
        <TextInput
          style={styles.contentInput}
          placeholder="Start typing your note..."
          placeholderTextColor="#999"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  saveButton: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 20,
    paddingVertical: 10,
  },
  contentInput: {
    fontSize: 16,
    color: "#1a1a1a",
    lineHeight: 24,
    minHeight: 400,
  },
});
