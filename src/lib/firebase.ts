import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  User,
  Auth
} from "firebase/auth";

// Public Firebase client configuration loaded strictly from environment variables or active project config
import { auth as sharedAuth, googleProvider as sharedGoogleProvider } from "@/lib/firebase/config";

const auth: Auth | null = sharedAuth as Auth;
const googleProvider = sharedGoogleProvider;

export { auth, googleProvider };

/**
 * Sign in client using Google Popup
 */
export async function signInWithGoogle() {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized. Please verify environment configuration.");
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Register client using Email & Password
 */
export async function registerWithCredentials(email: string, pass: string, displayName: string) {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized. Please verify environment configuration.");
  }
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName) {
    await updateProfile(credential.user, {
      displayName: displayName.trim(),
    });
  }
  return credential.user;
}

/**
 * Sign in client using Email & Password
 */
export async function signInWithCredentials(email: string, pass: string) {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized. Please verify environment configuration.");
  }
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return credential.user;
}

/**
 * Sign out current client
 */
export async function signOutClient() {
  if (!auth) return;
  await signOut(auth);
}
