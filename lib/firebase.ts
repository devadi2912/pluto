
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

/**
 * PUBLISHED FIREBASE SECURITY RULES:
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     
 *     // Helper: Check if user has the DOCTOR role in their profile
 *     function isDoctor() {
 *       return request.auth != null && 
 *              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'DOCTOR';
 *     }
 *
 *     match /users/{userId} {
 *       // 1. OWNER RULES: Full control over their own document and all sub-collections
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *
 *       // 2. DOCTOR RULES (Patient Discovery):
 *       // Doctors can read root profiles to verify IDs and update lastVisit audit fields
 *       allow read, update: if isDoctor();
 *
 *       match /{allPaths=**} {
 *         // Doctors can read all medical records (Timeline, Docs, Trends)
 *         allow read: if isDoctor();
 *         
 *         // Doctors can only Create or Update (e.g., append to clinicalNotes array)
 *         // They are explicitly forbidden from deleting any patient records
 *         allow create, update: if isDoctor();
 *         allow delete: if false; 
 *       }
 *     }
 *   }
 * }
 */
