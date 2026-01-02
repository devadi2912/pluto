
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQ_3TbCCi6Mpr9h5eNkQV79h1D7Tc3Nhw",
  authDomain: "pluto-01-95356.firebaseapp.com",
  projectId: "pluto-01-95356",
  storageBucket: "pluto-01-95356.firebasestorage.app",
  messagingSenderId: "562225843274",
  appId: "1:562225843274:web:2fc68594e0f9a895156ab3"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export default firebase;
