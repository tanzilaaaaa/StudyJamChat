import { useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function TwoInputModal({
  visible,
  title,
  placeholder1,
  placeholder2,
  label1,
  label2,
  onCancel,
  onSubmit,
}) {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");

  const handleSubmit = () => {
    onSubmit(value1, value2);
    setValue1("");
    setValue2("");
  };

  const handleCancel = () => {
    onCancel();
    setValue1("");
    setValue2("");
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          
          <Text style={styles.label}>{label1}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder1}
            placeholderTextColor="#999"
            value={value1}
            onChangeText={setValue1}
            autoFocus
          />

          <Text style={styles.label}>{label2}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder2}
            placeholderTextColor="#999"
            value={value2}
            onChangeText={setValue2}
          />

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    width: "85%",
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 10,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  submitButton: {
    backgroundColor: "#6366f1",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
