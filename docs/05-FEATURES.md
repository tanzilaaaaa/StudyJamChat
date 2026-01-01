# Features Guide

## 🎯 Complete Features Overview

This guide walks through every feature in StudyJam with screenshots, code examples, and usage instructions.

---

## 1️⃣ Dashboard

### **What You See**
- App header with logo and notifications bell
- Search bar
- "My Courses" section with course cards
- "Study Groups" section with group cards
- Bottom navigation bar

### **What You Can Do**

**Search:**
- Type in search bar
- Filters courses and groups in real-time
- Shows matching results instantly

**View Courses:**
- Click any course card
- Opens course detail page
- See materials, assignments, grades

**Join Study Groups:**
- Click any group card
- Opens chat room
- Start messaging immediately

**Add Study Group:**
- Click "+ Add" button
- Enter group name
- Creates new chat room

**View Notifications:**
- Click bell icon (🔔)
- See unread count badge
- Opens notifications page

### **Code Example**
```javascript
// Search functionality
useEffect(() => {
  const filtered = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  setFilteredCourses(filtered);
}, [searchQuery, courses]);
```

---

## 2️⃣ Real-Time Chat

### **Features**

**Send Messages:**
- Type in input box
- Press "Send" button
- Message appears instantly for everyone

**Share Files:**
- Click "+" button
- Select file from device
- File sent as message
- Others can download/view

**Pin Messages:**
- **Mobile**: Long press message → Select "Pin"
- **Web**: Click 📌 icon next to message
- Message added to pinboard

**Delete Messages:**
- Click "Select" button in header
- Tap messages to select (checkboxes appear)
- Click "Delete" button
- Confirm deletion

**View Pinned Messages:**
- Click 📌 icon in header (shows count)
- Opens pinboard
- See all pinned messages
- Unpin from here

### **How Real-Time Works**

```javascript
// 1. Connect to server
await socketService.connect();

// 2. Join chat room
socketService.joinRoom('web-dev-study-group');

// 3. Listen for messages
socketService.onNewMessage((message) => {
  // Add to messages list
  setMessages(prev => [...prev, message]);
});

// 4. Send message
socketService.sendMessage(roomId, {
  text: "Hello!",
  userId: currentUser.uid,
  userName: currentUser.displayName
});
```

### **Message Structure**
```javascript
{
  id: "1234567890",
  text: "Hello everyone!",
  userId: "user-id-123",
  userName: "John Doe",
  timestamp: "2024-12-07T10:30:00Z",
  reactions: [],
  fileInfo: {  // Optional, only if file attached
    name: "document.pdf",
    size: 123456,
    type: "application/pdf",
    base64: "..."
  }
}
```

---

## 3️⃣ Course Management

### **View Course Details**

**Information Displayed:**
- Course name
- Course code (e.g., CS 101)
- Professor name
- Credits

**Students:** Can only view (read-only)
**Admins:** Can edit all fields

### **Materials Section**

**What You Can Do:**
- Upload files (PDFs, documents, presentations)
- View uploaded materials
- Delete materials
- Files stored locally per user

**Code:**
```javascript
const handleUploadFile = async () => {
  const result = await DocumentPicker.getDocumentAsync();
  const newMaterial = {
    id: Date.now().toString(),
    title: file.name,
    type: "PDF",
    uri: file.uri
  };
  setMaterials([...materials, newMaterial]);
  await saveMaterials(updatedMaterials);
};
```

### **Assignments Section**

**Features:**
- View all assignments
- See due dates
- Mark as complete (checkbox)
- Attach files to assignments
- Delete assignments

**Workflow:**
1. Click "+ Add" to create assignment
2. Enter title and due date
3. Click 📎 to attach file
4. Check box when completed

### **Grades Section**

**Features:**
- View all grades
- See scores (e.g., 95/100)
- See percentages (e.g., 95%)
- View course average
- Admins can add/edit grades

### **Schedule Section**

**Features:**
- View class times
- See days and times
- Add new class times
- Delete schedule entries

### **Quick Notes**

**Features:**
- Write course-specific notes
- Save note
- Auto-redirect to dashboard after save

---

## 4️⃣ Notes System

### **Notes List** (`app/notes.js`)

**What You See:**
- All your notes
- Search bar
- "+ Add Note" button

**Features:**
- Search notes by title or content
- Click note to edit
- Swipe/long-press to delete
- Create new notes

### **Note Editor** (`app/note-editor.js`)

**What You See:**
- Title input
- Content input (large text area)
- Save button

**Features:**
- Create new note
- Edit existing note
- Auto-save on button press
- Return to notes list

**Code:**
```javascript
const handleSave = async () => {
  const newNote = {
    id: Date.now().toString(),
    title: title,
    content: content,
    timestamp: new Date().toISOString()
  };
  
  const updatedNotes = [...notes, newNote];
  await AsyncStorage.setItem(
    `@notes_${userId}`,
    JSON.stringify(updatedNotes)
  );
  
  router.back();
};
```

