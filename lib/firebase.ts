
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQ_3TbCCi6Mpr9h5eNkQV79h1D7Tc3Nhw",
  authDomain: "pluto-01-95356.firebaseapp.com",
  projectId: "pluto-01-95356",
  storageBucket: "pluto-01-95356.firebasestorage.app",
  messagingSenderId: "562225843274",
  appId: "1:562225843274:web:2fc68594e0f9a895156ab3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
