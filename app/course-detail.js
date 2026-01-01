import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import TwoInputModal from "../components/TwoInputModal";
import { auth, getUserRole } from "../src/firebaseConfig";

export default function CourseDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { courseId, courseName, courseCode, professor, credits } = params;

  const [name, setName] = useState(courseName || "");
  const [code, setCode] = useState(courseCode || "");
  const [prof, setProf] = useState(professor || "");
  const [cred, setCred] = useState(credits || "");
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  
  const [notes, setNotes] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [userRole, setUserRole] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeItem, setGradeItem] = useState("");
  const [gradeScore, setGradeScore] = useState("");
  const [gradePercentage, setGradePercentage] = useState("");
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  const [assignments, setAssignments] = useState([
    { id: "1", title: "Assignment 1: Introduction", dueDate: "2024-02-15", status: "pending" },
    { id: "2", title: "Midterm Project", dueDate: "2024-03-20", status: "pending" },
  ]);
  const [materials, setMaterials] = useState([
    { id: "1", title: "Lecture 1: Introduction to Course", type: "PDF" },
  ]);
  const [grades, setGrades] = useState([
    { id: "1", item: "Assignment 1", score: "95/100", percentage: "95%" },
    { id: "2", item: "Quiz 1", score: "18/20", percentage: "90%" },
    { id: "3", item: "Midterm", score: "85/100", percentage: "85%" },
  ]);
  const [schedule, setSchedule] = useState([
    { id: "1", day: "Monday", time: "10:00 AM - 11:30 AM" },
    { id: "2", day: "Wednesday", time: "10:00 AM - 11:30 AM" },
    { id: "3", day: "Friday", time: "10:00 AM - 11:30 AM" },
  ]);

  // Load user role and saved data
  useEffect(() => {
    loadUserRole();
    loadCourseData();
  }, []);

  const loadUserRole = async () => {
    const user = auth.currentUser;
    if (user) {
      const role = await getUserRole(user.uid);
      setUserRole(role);
    }
  };

  const loadCourseData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Load materials
      const materialsKey = `@course_materials_${courseId}_${user.uid}`;
      const savedMaterials = await AsyncStorage.getItem(materialsKey);
      if (savedMaterials) {
        setMaterials(JSON.parse(savedMaterials));
      }

      // Load assignments
      const assignmentsKey = `@course_assignments_${courseId}_${user.uid}`;
      const savedAssignments = await AsyncStorage.getItem(assignmentsKey);
      if (savedAssignments) {
        setAssignments(JSON.parse(savedAssignments));
      }

      // Load schedule
      const scheduleKey = `@course_schedule_${courseId}_${user.uid}`;
      const savedSchedule = await AsyncStorage.getItem(scheduleKey);
      if (savedSchedule) {
        setSchedule(JSON.parse(savedSchedule));
      }

      // Load grades
      const gradesKey = `@course_grades_${courseId}`;
      const savedGrades = await AsyncStorage.getItem(gradesKey);
      if (savedGrades) {
        setGrades(JSON.parse(savedGrades));
      }

      // Load notes
      const notesKey = `@course_notes_${courseId}_${user.uid}`;
      const savedNotes = await AsyncStorage.getItem(notesKey);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    } catch (error) {
      console.error("Error loading course data:", error);
    }
  };

  const saveMaterials = async (newMaterials) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const key = `@course_materials_${courseId}_${user.uid}`;
      await AsyncStorage.setItem(key, JSON.stringify(newMaterials));
    } catch (error) {
      console.error("Error saving materials:", error);
    }
  };

  const saveAssignments = async (newAssignments) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const key = `@course_assignments_${courseId}_${user.uid}`;
      await AsyncStorage.setItem(key, JSON.stringify(newAssignments));
    } catch (error) {
      console.error("Error saving assignments:", error);
    }
  };

  const saveSchedule = async (newSchedule) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const key = `@course_schedule_${courseId}_${user.uid}`;
      await AsyncStorage.setItem(key, JSON.stringify(newSchedule));
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

  const saveGrades = async (newGrades) => {
    try {
      const key = `@course_grades_${courseId}`;
      await AsyncStorage.setItem(key, JSON.stringify(newGrades));
    } catch (error) {
      console.error("Error saving grades:", error);
    }
  };

  const handleSaveCourseInfo = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Course name is required");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const { loadCourses, saveCourses } = require("../src/storage");
      const courses = await loadCourses(user.uid);
      const updatedCourses = courses.map(c =>
        c.id === courseId
          ? { 
              ...c, 
              name: name.trim(), 
              code: userRole === "admin" ? code.trim() : c.code,
              professor: userRole === "admin" ? prof.trim() : c.professor,
              credits: userRole === "admin" ? cred.trim() : c.credits
            }
          : c
      );

      await saveCourses(user.uid, updatedCourses);
      setIsEditingInfo(false);
      Alert.alert("Success", "Course information updated");
    } catch (error) {
      console.error("Error saving course info:", error);
      Alert.alert("Error", "Failed to save course information");
    }
  };

  const handleAddNote = async () => {
    if (notes.trim()) {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const key = `@course_notes_${courseId}_${user.uid}`;
        await AsyncStorage.setItem(key, notes);
        
        if (Platform.OS === 'web') {
          alert("Note saved successfully!");
          router.push("/dashboard");
        } else {
          Alert.alert(
            "Note Saved", 
            "Your note has been saved successfully!",
            [
              {
                text: "OK",
                onPress: () => router.push("/dashboard")
              }
            ]
          );
        }
      } catch (error) {
        console.error("Error saving note:", error);
        if (Platform.OS === 'web') {
          alert("Failed to save note");
        } else {
          Alert.alert("Error", "Failed to save note");
        }
      }
    }
  };

  const handleUploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileType = file.mimeType?.includes("pdf") ? "PDF" : 
                        file.mimeType?.includes("presentation") ? "PPT" : 
                        file.mimeType?.includes("document") ? "DOC" : "FILE";
        
        const newMaterial = {
          id: Date.now().toString(),
          title: file.name,
          type: fileType,
          uri: file.uri,
          size: file.size,
        };

        const updatedMaterials = [...materials, newMaterial];
        setMaterials(updatedMaterials);
        await saveMaterials(updatedMaterials);
        Alert.alert("Success", `${file.name} has been added to course materials`);
      }
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Error", "Failed to upload file");
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    Alert.alert(
      "Delete Material",
      "Are you sure you want to delete this material?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedMaterials = materials.filter(m => m.id !== materialId);
            setMaterials(updatedMaterials);
            await saveMaterials(updatedMaterials);
          },
        },
      ]
    );
  };

  const handleAddGrade = () => {
    if (userRole !== "admin") {
      Alert.alert("Access Denied", "Only admins can add or edit grades");
      return;
    }
    setEditingGrade(null);
    setGradeItem("");
    setGradeScore("");
    setGradePercentage("");
    setShowGradeModal(true);
  };

  const handleEditGrade = (grade) => {
    if (userRole !== "admin") {
      Alert.alert("Access Denied", "Only admins can add or edit grades");
      return;
    }
    setEditingGrade(grade);
    setGradeItem(grade.item);
    setGradeScore(grade.score);
    setGradePercentage(grade.percentage);
    setShowGradeModal(true);
  };

  const handleSaveGrade = async () => {
    if (!gradeItem.trim() || !gradeScore.trim() || !gradePercentage.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    let updatedGrades;
    if (editingGrade) {
      updatedGrades = grades.map(g =>
        g.id === editingGrade.id
          ? { ...g, item: gradeItem, score: gradeScore, percentage: gradePercentage }
          : g
      );
    } else {
      const newGrade = {
        id: Date.now().toString(),
        item: gradeItem,
        score: gradeScore,
        percentage: gradePercentage,
      };
      updatedGrades = [...grades, newGrade];
    }

    setGrades(updatedGrades);
    await saveGrades(updatedGrades);
    setShowGradeModal(false);
    Alert.alert("Success", "Grade saved successfully");
  };

  const handleDeleteGrade = async (gradeId) => {
    if (userRole !== "admin") {
      Alert.alert("Access Denied", "Only admins can delete grades");
      return;
    }

    Alert.alert(
      "Delete Grade",
      "Are you sure you want to delete this grade?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedGrades = grades.filter(g => g.id !== gradeId);
            setGrades(updatedGrades);
            await saveGrades(updatedGrades);
          },
        },
      ]
    );
  };

  const toggleAssignmentStatus = (assignmentId) => {
    setAssignments(prev =>
      prev.map(a =>
        a.id === assignmentId
          ? { ...a, status: a.status === "pending" ? "completed" : "pending" }
          : a
      )
    );
  };

  const handleAddAssignment = () => {
    setShowAssignmentModal(true);
  };

  const handleAssignmentSubmit = async (title, dueDate) => {
    if (title && title.trim()) {
      const newAssignment = {
        id: Date.now().toString(),
        title: title.trim(),
        dueDate: dueDate || "TBD",
        status: "pending",
      };
      const updatedAssignments = [...assignments, newAssignment];
      setAssignments(updatedAssignments);
      await saveAssignments(updatedAssignments);
    }
    setShowAssignmentModal(false);
  };

  const handleAttachFileToAssignment = async (assignmentId) => {
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
            const base64 = event.target.result.split(',')[1];
            
            const updatedAssignments = assignments.map(a =>
              a.id === assignmentId
                ? {
                    ...a,
                    fileInfo: {
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      base64: base64,
                    },
                  }
                : a
            );

            setAssignments(updatedAssignments);
            await saveAssignments(updatedAssignments);
            alert(`File "${file.name}" attached successfully!`);
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
            encoding: "base64",
          });

          const updatedAssignments = assignments.map(a =>
            a.id === assignmentId
              ? {
                  ...a,
                  fileInfo: {
                    name: file.name,
                    size: file.size,
                    type: file.mimeType,
                    base64: base64,
                  },
                }
              : a
          );

          setAssignments(updatedAssignments);
          await saveAssignments(updatedAssignments);
          Alert.alert("Success", `File "${file.name}" attached successfully!`);
        }
      }
    } catch (error) {
      console.error("Error attaching file:", error);
      if (Platform.OS === 'web') {
        alert("Failed to attach file");
      } else {
        Alert.alert("Error", "Failed to attach file");
      }
    }
  };

  const handleOpenAssignmentFile = async (fileInfo) => {
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
          encoding: "base64",
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

  const handleDeleteAssignment = async (assignmentId) => {
    const confirmDelete = () => {
      const updatedAssignments = assignments.filter(a => a.id !== assignmentId);
      setAssignments(updatedAssignments);
      saveAssignments(updatedAssignments);
    };

    if (Platform.OS === 'web') {
      if (confirm("Are you sure you want to delete this assignment?")) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete Assignment",
        "Are you sure you want to delete this assignment?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: confirmDelete,
          },
        ]
      );
    }
  };

  const handleAddSchedule = () => {
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (day, time) => {
    if (day && day.trim()) {
      const newSchedule = {
        id: Date.now().toString(),
        day: day.trim(),
        time: time || "TBD",
      };
      const updatedSchedule = [...schedule, newSchedule];
      setSchedule(updatedSchedule);
      await saveSchedule(updatedSchedule);
    }
    setShowScheduleModal(false);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    Alert.alert(
      "Delete Schedule",
      "Are you sure you want to delete this class time?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedSchedule = schedule.filter(s => s.id !== scheduleId);
            setSchedule(updatedSchedule);
            await saveSchedule(updatedSchedule);
          },
        },
      ]
    );
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{courseName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Course Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Course Information</Text>
            {userRole === "admin" && !isEditingInfo && (
              <TouchableOpacity onPress={() => setIsEditingInfo(true)}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            )}
            {userRole === "admin" && isEditingInfo && (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => setIsEditingInfo(false)}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveCourseInfo}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isEditingInfo ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Course Name:</Text>
                <TextInput
                  style={styles.infoInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Course name"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Course Code:</Text>
                <TextInput
                  style={[styles.infoInput, userRole !== "admin" && styles.infoInputDisabled]}
                  value={code}
                  onChangeText={setCode}
                  placeholder="e.g., CS 101"
                  placeholderTextColor="#999"
                  editable={userRole === "admin"}
                />
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Professor:</Text>
                <TextInput
                  style={[styles.infoInput, userRole !== "admin" && styles.infoInputDisabled]}
                  value={prof}
                  onChangeText={setProf}
                  placeholder="e.g., Prof. Johnson"
                  placeholderTextColor="#999"
                  editable={userRole === "admin"}
                />
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Credits:</Text>
                <TextInput
                  style={[styles.infoInput, userRole !== "admin" && styles.infoInputDisabled]}
                  value={cred}
                  onChangeText={setCred}
                  placeholder="e.g., 3"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  editable={userRole === "admin"}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Course Name:</Text>
                <Text style={styles.infoValue}>{name || "N/A"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Course Code:</Text>
                <Text style={styles.infoValue}>{code || "N/A"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Professor:</Text>
                <Text style={styles.infoValue}>{prof || "N/A"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Credits:</Text>
                <Text style={styles.infoValue}>{cred || "N/A"}</Text>
              </View>
            </>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[
                styles.actionCard,
                activeSection === "materials" && styles.actionCardActive,
              ]}
              onPress={() => setActiveSection("materials")}
            >
              <Text style={styles.actionIcon}>📚</Text>
              <Text style={styles.actionText}>Materials</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionCard,
                activeSection === "assignments" && styles.actionCardActive,
              ]}
              onPress={() => setActiveSection("assignments")}
            >
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionText}>Assignments</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionCard,
                activeSection === "grades" && styles.actionCardActive,
              ]}
              onPress={() => setActiveSection("grades")}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Grades</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionCard,
                activeSection === "schedule" && styles.actionCardActive,
              ]}
              onPress={() => setActiveSection("schedule")}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Materials Section */}
        {activeSection === "materials" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Course Materials</Text>
              <TouchableOpacity onPress={handleUploadFile}>
                <Text style={styles.uploadButton}>+ Upload</Text>
              </TouchableOpacity>
            </View>
            {materials.map((material) => (
              <View key={material.id} style={styles.materialCard}>
                <Text style={styles.materialIcon}>
                  {material.type === "PDF" ? "📄" : 
                   material.type === "PPT" ? "📊" :
                   material.type === "DOC" ? "📝" : "📎"}
                </Text>
                <View style={styles.materialInfo}>
                  <Text style={styles.materialTitle}>{material.title}</Text>
                  <Text style={styles.materialType}>{material.type}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteMaterial(material.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Assignments Section */}
        {activeSection === "assignments" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Assignments</Text>
              <TouchableOpacity onPress={handleAddAssignment}>
                <Text style={styles.uploadButton}>+ Add</Text>
              </TouchableOpacity>
            </View>
            {assignments.map((assignment) => (
              <View key={assignment.id} style={styles.assignmentCard}>
                <TouchableOpacity
                  style={styles.assignmentLeft}
                  onPress={() => toggleAssignmentStatus(assignment.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      assignment.status === "completed" && styles.checkboxChecked,
                    ]}
                  >
                    {assignment.status === "completed" && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.assignmentInfo}>
                    <Text
                      style={[
                        styles.assignmentTitle,
                        assignment.status === "completed" && styles.assignmentCompleted,
                      ]}
                    >
                      {assignment.title}
                    </Text>
                    <Text style={styles.assignmentDue}>Due: {assignment.dueDate}</Text>
                    {assignment.fileInfo && (
                      <TouchableOpacity onPress={() => handleOpenAssignmentFile(assignment.fileInfo)}>
                        <Text style={styles.fileAttachment}>
                          📎 {assignment.fileInfo.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.assignmentActions}>
                  <TouchableOpacity
                    onPress={() => handleAttachFileToAssignment(assignment.id)}
                    style={styles.attachButton}
                  >
                    <Text style={styles.attachButtonText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteAssignment(assignment.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Grades Section */}
        {activeSection === "grades" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Grades</Text>
              {userRole === "admin" && (
                <TouchableOpacity onPress={handleAddGrade}>
                  <Text style={styles.uploadButton}>+ Add</Text>
                </TouchableOpacity>
              )}
            </View>
            {grades.map((grade) => (
              <TouchableOpacity
                key={grade.id}
                style={styles.gradeCard}
                onPress={() => userRole === "admin" && handleEditGrade(grade)}
                onLongPress={() => handleDeleteGrade(grade.id)}
              >
                <View style={styles.gradeInfo}>
                  <Text style={styles.gradeItem}>{grade.item}</Text>
                  <Text style={styles.gradeScore}>{grade.score}</Text>
                </View>
                <Text style={styles.gradePercentage}>{grade.percentage}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.averageCard}>
              <Text style={styles.averageLabel}>Course Average</Text>
              <Text style={styles.averageValue}>90%</Text>
            </View>
          </View>
        )}

        {/* Schedule Section */}
        {activeSection === "schedule" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Class Schedule</Text>
              <TouchableOpacity onPress={handleAddSchedule}>
                <Text style={styles.uploadButton}>+ Add</Text>
              </TouchableOpacity>
            </View>
            {schedule.map((item) => (
              <View key={item.id} style={styles.scheduleCard}>
                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleDay}>{item.day}</Text>
                  <Text style={styles.scheduleTime}>{item.time}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteSchedule(item.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes about this course..."
            placeholderTextColor="#999"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleAddNote}
            disabled={!notes.trim()}
          >
            <Text style={styles.saveButtonText}>Save Note</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Assignment Modal */}
      <TwoInputModal
        visible={showAssignmentModal}
        title="Add Assignment"
        label1="Assignment Title"
        placeholder1="e.g., Assignment 1"
        label2="Due Date"
        placeholder2="e.g., 2024-03-15"
        onCancel={() => setShowAssignmentModal(false)}
        onSubmit={handleAssignmentSubmit}
      />

      {/* Schedule Modal */}
      <TwoInputModal
        visible={showScheduleModal}
        title="Add Class Schedule"
        label1="Day"
        placeholder1="e.g., Monday"
        label2="Time"
        placeholder2="e.g., 10:00 AM - 11:30 AM"
        onCancel={() => setShowScheduleModal(false)}
        onSubmit={handleScheduleSubmit}
      />

      {/* Grade Edit Modal */}
      <Modal
        visible={showGradeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingGrade ? "Edit Grade" : "Add Grade"}
            </Text>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>Item Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Assignment 1"
                placeholderTextColor="#999"
                value={gradeItem}
                onChangeText={setGradeItem}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>Score</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., 95/100"
                placeholderTextColor="#999"
                value={gradeScore}
                onChangeText={setGradeScore}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>Percentage</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., 95%"
                placeholderTextColor="#999"
                value={gradePercentage}
                onChangeText={setGradePercentage}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowGradeModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveGrade}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#6366f1",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  editButton: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "600",
  },
  editActions: {
    flexDirection: "row",
    gap: 15,
  },
  cancelButton: {
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
  },
  saveButton: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  infoInput: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  infoInputDisabled: {
    backgroundColor: "#f9f9f9",
    color: "#999",
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  uploadButton: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "48%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  actionCardActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  assignmentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assignmentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#6366f1",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#6366f1",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  assignmentCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  assignmentDue: {
    fontSize: 12,
    color: "#666",
  },
  fileAttachment: {
    fontSize: 12,
    color: "#6366f1",
    marginTop: 4,
    textDecorationLine: "underline",
  },
  assignmentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attachButton: {
    padding: 4,
  },
  attachButtonText: {
    fontSize: 24,
    fontWeight: "300",
    color: "#6366f1",
  },
  notesInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#6366f1",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  materialCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
  },
  materialIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  materialType: {
    fontSize: 12,
    color: "#666",
  },
  chevron: {
    fontSize: 20,
    color: "#ccc",
  },
  gradeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gradeInfo: {
    flex: 1,
  },
  gradeItem: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  gradeScore: {
    fontSize: 13,
    color: "#666",
  },
  gradePercentage: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6366f1",
  },
  averageCard: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  averageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  averageValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  scheduleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  scheduleDay: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  scheduleTime: {
    fontSize: 15,
    color: "#666",
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInputContainer: {
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
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
  modalButtonSave: {
    backgroundColor: "#6366f1",
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modalButtonTextSave: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
