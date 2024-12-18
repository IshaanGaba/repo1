// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; 
import { getFunctions } from 'firebase/functions';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from 'firebase/auth';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkc748dUak6G643MvOgMnQcKf6H6Wqfac",
  authDomain: "capstone-61dfe.firebaseapp.com",
  projectId: "capstone-61dfe",
  storageBucket: "capstone-61dfe.appspot.com",
  messagingSenderId: "568083490487",
  appId: "1:568083490487:web:8a22baabfc17e8b4dacf32",
  measurementId: "G-X6DM6M0J12"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 
export const functions = getFunctions(app);