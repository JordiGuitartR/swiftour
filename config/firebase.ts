import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAHMy-uwN5BT8gmmeQddsgO02MmFAyJwl0",
  authDomain: "swiftour-ce7bb.firebaseapp.com",
  projectId: "swiftour-ce7bb",
  storageBucket: "swiftour-ce7bb.firebasestorage.app",
  messagingSenderId: "17680407022",
  appId: "1:17680407022:web:7d0ef2808f1768879cd6ff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
