import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);

// Signup
export const signup = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Login
export const login = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};