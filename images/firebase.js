// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGS6RibW9FHt83tX2wvVQDo80dwvkIvrY",
  authDomain: "kalimba-chill.firebaseapp.com",
  projectId: "kalimba-chill",
  storageBucket: "kalimba-chill.firebasestorage.app",
  messagingSenderId: "847603826023",
  appId: "1:847603826023:web:5d320dfa08eec4135543c2",
  measurementId: "G-9V15278SHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);