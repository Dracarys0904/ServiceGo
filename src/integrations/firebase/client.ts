import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA43CTUFB3UaM5zBmDNQMfGkY54fGurECA",
  authDomain: "servicego-f6545.firebaseapp.com",
  projectId: "servicego-f6545",
  storageBucket: "servicego-f6545.appspot.com", // fixed typo
  messagingSenderId: "708444080089",
  appId: "1:708444080089:web:b3cc99b8b0e559718cfbc8",
  measurementId: "G-Q3EQ5TCH07"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics }; 