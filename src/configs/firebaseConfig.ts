import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCI3cBtY3wxv24z2lMbOCzdoNviQ9CSTmU",
  authDomain: "starstake-7d543.firebaseapp.com",
  projectId: "starstake-7d543",
  storageBucket: "starstake-7d543.firebasestorage.app",
  messagingSenderId: "486401971185",
  appId: "1:486401971185:web:49f62c3fe7147455ceaa50",
  measurementId: "G-SKEWP98GG4"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };