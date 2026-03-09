// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBp1XpwzR2-FlYBWgdA5oQLaFt8_f4uqFE",
  authDomain: "jhjrtyr.firebaseapp.com",
  projectId: "jhjrtyr",
  storageBucket: "jhjrtyr.firebasestorage.app",
  messagingSenderId: "197051242368",
  appId: "1:197051242368:web:e34d0ab4e75b34214a1365"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, addDoc, getDocs, deleteDoc, doc, setDoc, signInWithPhoneNumber, RecaptchaVerifier, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged };
