StudyJam 📚

![React Native](https://img.shields.io/badge/React%20Native-Expo-blue?logo=react)
![JavaScript](https://img.shields.io/badge/JavaScript-Main%20Language-yellow?logo=javascript)
![TypeScript](https://img.shields.io/badge/TypeScript-Minimal%20Usage-blue?logo=typescript)
![Expo](https://img.shields.io/badge/Expo-54-black?logo=expo)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage-orange?logo=firebase)


A collaborative study group mobile app built with Expo (React Native) and Firebase, designed to help students create courses, join study groups, chat in real time, and stay updated with announcements  all in one place.

Built as part of a hands-on learning initiative with a focus on scalability, real time communication, and clean architecture.
---

<h2>✨ Key Highlights</h2>
<ul>
  <li>Secure authentication with Email/Password & Google</li>
  <li>Real-time group chat using Firestore listeners</li>
  <li>Role-based access (Students & Admins)</li>
  <li>Course announcements & notifications</li>
  <li>Cross-platform support (Android, iOS, Web)</li>
</ul>

<hr />



<h3>👨‍🎓 For Students</h3>
<ul>
  <li>Sign up & log in using Email </li>
  <li>Browse and join available courses</li>
  <li>Participate in real-time course chats</li>
  <li>View announcements posted by admins</li>
  <li>Manage personal profile</li>
  <li>Receive notifications</li>
</ul>

<h3>🛠️ For Admins</h3>
<ul>
  <li>Admin dashboard with overview</li>
  <li>Create & manage courses</li>
  <li>Approve or reject join requests</li>
  <li>Post announcements</li>
  <li>Manage users inside courses</li>
</ul>



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

<h2>🚀 Getting Started</h2>

<h3>Prerequisites</h3>
<ul>
  <li>Node.js</li>
  <li>npm</li>
  <li>Expo CLI</li>
</ul>

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

<p>You can then:</p>
<ul>
  <li>Open on web</li>
  <li>Run on Android/iOS</li>
  <li>Scan with Expo Go</li>
</ul>
  


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

<h2>🔐 Security Notes</h2>
<ul>
  <li>Firebase keys are stored using Expo public env variables</li>
  <li>No admin actions are allowed without role validation</li>
  <li>Firestore rules restrict access based on authentication</li>
</ul>

<hr />



<h2>🤝 Contributing</h2>

<p>This project is beginner-friendly.</p>

<p><strong>Steps:</strong></p>
<ul>
  <li>Fork the repository</li>
  <li>Create a new branch</li>
  <li>Make your changes</li>
  <li>Open a Pull Request</li>
</ul>

<hr />


