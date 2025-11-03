// FIX: Changed import style for `firebase/app` to a namespace import to address a potential module resolution issue with the named export `initializeApp`.
import * as firebaseApp from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// NOTE: This is a placeholder configuration.
// You must replace it with your app's Firebase project configuration.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase config is valid
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration is missing. Please check your environment variables.');
}

// Initialize Firebase
let app;
try {
  app = firebaseApp.initializeApp(firebaseConfig);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Reuse existing app if already initialized
  try {
    app = firebaseApp.getApp();
  } catch {
    throw new Error('Firebase initialization failed. Please check your configuration.');
  }
}

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
