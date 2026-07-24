// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDW8XJ6aOGDQ3uTkPtG7RlDhZIB6h0iNOQ",
  authDomain: "dwcstudy-ad27f.firebaseapp.com",
  projectId: "dwcstudy-ad27f",
  storageBucket: "dwcstudy-ad27f.firebasestorage.app",
  messagingSenderId: "89865011297",
  appId: "1:89865011297:web:659c58ba10f7d7778a6a20",
  measurementId: "G-6J3H6T9V8D"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);