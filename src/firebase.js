

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDn90VoF_79NqYvNR8VXKzWEMcp00N4by4",
  authDomain: "pocketlawyer-f0be5.firebaseapp.com",
  projectId: "pocketlawyer-f0be5",

  // ✅ YE HI SAHI HAI
  storageBucket: "pocketlawyer-f0be5.firebasestorage.app",

  messagingSenderId: "788408754034",
  appId: "1:788408754034:web:30afaedb0d9c32f11c47eb"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// ✅ IMPORTANT
export const storage = getStorage(app);

export default app;