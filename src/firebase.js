import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCB-Ys7PmqGs0EsuUMHaa03NhqdrtRK7JA",
  authDomain: "raising-backup.firebaseapp.com",
  projectId: "raising-backup",
  storageBucket: "raising-backup.appspot.com",
  messagingSenderId: "1035921603739",
  appId: "1:1035921603739:web:4d157dc29529271855da3e",
  measurementId: "G-C0WXV48S7G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
