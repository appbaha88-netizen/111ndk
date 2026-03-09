import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-Jw_hWrN4fwrB6xMfAU1Xy3WtXQC-eSc",
  authDomain: "baha-d6394.firebaseapp.com",
  projectId: "baha-d6394",
  storageBucket: "baha-d6394.firebasestorage.app",
  messagingSenderId: "515596532130",
  appId: "1:515596532130:web:d77243aaa3a825000d9afb",
  measurementId: "G-5GS5X93N5P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs };
