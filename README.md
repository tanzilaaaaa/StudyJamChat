StudyJam 📚

![React Native](https://img.shields.io/badge/React%20Native-Expo-blue?logo=react)
![JavaScript](https://img.shields.io/badge/JavaScript-Main%20Language-yellow?logo=javascript)
![TypeScript](https://img.shields.io/badge/TypeScript-Minimal%20Usage-blue?logo=typescript)
![Expo](https://img.shields.io/badge/Expo-54-black?logo=expo)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage-orange?logo=firebase)


A collaborative study group mobile app built with Expo (React Native) and Firebase, designed to help students create courses, join study groups, chat in real time, and stay updated with announcements  all in one place.

Built as part of a hands-on learning initiative with a focus on scalability, real time communication, and clean architecture.
---

✨ Key Highlights
	-	 Secure authentication with Email/Password & Google
	-	 Real-time group chat using Firestore listeners
	-	 Role-based access (Students & Admins)
	-	 Course announcements & notifications
	-	 Cross-platform support (Android, iOS, Web)

---

🚀 Features

 For Students
	-	Sign up & log in using Email/Google
	-	Browse and join available courses
	-	Participate in real-time course chats
	-   View announcements posted by admins
	-	Manage personal profile
	-	Receive notifications

 For Admins
    -   Admin dashboard with overview
	-   Create & manage courses
	-	Approve / reject join requests
	-	Post announcements
	-	Manage users inside courses

---

🧰 Tech Stack

```
Frontend             → React Native (Expo, Expo Router)
Backend              → Firebase, Nodejs, socket.io
Realtime             → Firestore listeners, socket.io
Language             → JavaScript, Typescript
Database and Auth    → Firebase Authentication,  Firebase Firestore
```

---

## 📁 Project Structure

```
StudyJamChat/
├── app/            # App screens and routing
├── components/     # Reusable UI components
├── src/            # Core logic, services, utilities
├── backend/        # Node.js + Socket.io server
├── assets/         # Images and icons
├── docs/           # Documentation
├── android/        # Native Android configuration
├── app.json        # Expo configuration
├── eas.json        # Expo build configuration
├── package.json    # Dependencies
└── README.md       # Project documentation
```

---

🚀 Getting Started

Prerequisites
	-	Node.js 
	-	npm 
	-	Expo CLI.

```
npm install -g expo-cli
```
Installation

1️⃣ Clone the repository

```
git clone https://github.com/tanzilaaaa/Studyjam.git
cd Studyjam
```

2️⃣ Install dependencies

```
npm install
```

3️⃣ Add Firebase environment variables

Create a .env file in the root folder:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4️⃣ Start the app

```
npx expo start
```

You can then:
	-	Open on web
	-	Run on Android/iOS
	-	Scan with Expo Go
  
---

🔥 Firebase Data Design

Collections Used

```
users                   → student & admin profiles
courses                 → study courses
courses/{id}/messages   → real-time chat messages
announcements           → admin announcements
joinRequests            → pending course requests
```
---

📱 Scripts

```
npm start          # Start Expo dev server
npm run ios        # Run on iOS
npm run ios        # Run on iOS
npm run web        # Run on web
npm run build      # Export for web
```
---

🔐 Security Notes :
	-	Firebase keys are stored using Expo public env variables
	-	No admin actions are allowed without role validation
	-	Firestore rules restrict access based on authentication

---

🤝 Contributing

This project is beginner-friendly.

Steps:
	-	Fork the repository
	-   Create a new branch
	-	Make your changes
	-	Open a Pull Request

---
