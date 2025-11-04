// src/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, fetchSignInMethodsForEmail, User,
} from "firebase/auth";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDtui9kKn40rT9tjERdAv8KLP8DSJ0BcFM",
  authDomain: "herafona-18138.firebaseapp.com",
  projectId: "herafona-18138",
  storageBucket: "herafona-18138.appspot.com",
  messagingSenderId: "922502008422",
  appId: "1:922502008422:web:d0c145ba32b9dd261be7a7",
  measurementId: "G-VEJM61KW0X",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== "undefined") {
  console.groupCollapsed("[Firebase] Runtime config");
  console.table({
    PROJECT_ID: app.options.projectId,
    AUTH_DOMAIN: app.options.authDomain,
    APP_ID: app.options.appId,
    STORAGE_BUCKET: (app.options as any).storageBucket,
  });
  console.groupEnd();
}

export type AccountType = "tourist" | "user" | "artisan";

export interface FireUserDoc {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
  accountType: AccountType;
  avatarUrl?: string;

  role?: "user" | "artisan" | "admin";
  status?: "pending" | "approved" | "rejected";

  createdAt?: any;
  updatedAt?: any;
}

export const listenAuth = (cb: (u: User | null) => void) =>
  onAuthStateChanged(auth, cb);

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email.trim(), password);

export const register = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email.trim(), password);

export const logout = () => signOut(auth);

export const getUserDoc = async (uid: string) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as FireUserDoc) : null;
};

export const createUserDoc = async (data: FireUserDoc) => {
  const role = data.role ?? (data.accountType === "artisan" ? "artisan" : "user");
  const status = data.status ?? (data.accountType === "artisan" ? "pending" : "approved");

  const ref = doc(db, "users", data.uid);
  await setDoc(ref, {
    ...data,
    role,
    status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateUserDoc = async (uid: string, data: Partial<FireUserDoc>) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

export const approveArtisan = async (uid: string) => {
  await updateUserDoc(uid, { role: "artisan", status: "approved" });
};

export const setUserRole = async (uid: string, role: "user" | "artisan" | "admin") => {
  await updateUserDoc(uid, { role });
};

export const checkEmailProviders = (email: string) =>
  fetchSignInMethodsForEmail(auth, email.trim());

export const debugEmail = async (email: string) => {
  const methods = await checkEmailProviders(email);
  console.log(`[DEBUG] Sign-in methods for ${email}:`, methods);
  return methods;
};

console.log("Firebase connected to:", app.options.projectId);
