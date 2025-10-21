// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, DocumentData } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCfAvzwvRn1bnc9C3BAlsYNGOfEFtXeUM4",
  authDomain: "mediate-plus.firebaseapp.com",
  projectId: "mediate-plus",
  storageBucket: "mediate-plus.firebasestorage.app",
  messagingSenderId: "4933794770",
  appId: "1:4933794770:web:56130976ed4b6dddb6260b",
  measurementId: "G-VTWJE391LR"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);

// Устанавливаем язык для аутентификации (русский для SMS)
auth.languageCode = 'ru';

export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const database = getDatabase(app);

// Обёртки для основных функций Firebase

// Аутентификация
export const firebaseSignOut = async () => {
  return signOut(auth);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore (база данных)
export const getDocument = async <T extends DocumentData>(collectionName: string, docId: string): Promise<T | null> => {
  const docRef = doc(firestore, collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as T;
  } else {
    return null;
  }
};

export const queryCollection = async <T extends DocumentData>(collectionName: string, field: string, value: any): Promise<T[]> => {
  const q = query(collection(firestore, collectionName), where(field, "==", value));
  const querySnapshot = await getDocs(q);
  
  const results: T[] = [];
  querySnapshot.forEach((doc) => {
    results.push({ ...doc.data(), id: doc.id } as T);
  });
  
  return results;
};

export const createDocument = async <T extends DocumentData>(collectionName: string, data: Omit<T, 'id'>, customId?: string): Promise<T> => {
  try {
    let docRef;
    
    if (customId) {
      docRef = doc(firestore, collectionName, customId);
      await setDoc(docRef, data);
      return { ...data, id: customId } as T;
    } else {
      docRef = doc(collection(firestore, collectionName));
      await setDoc(docRef, data);
      return { ...data, id: docRef.id } as T;
    }
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

export const updateDocument = async <T extends DocumentData>(collectionName: string, docId: string, data: Partial<T>): Promise<T> => {
  try {
    const docRef = doc(firestore, collectionName, docId);
    await updateDoc(docRef, data);
    return { id: docId, ...data } as T;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

// Storage (хранение файлов)
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageReference = storageRef(storage, path);
    await uploadBytes(storageReference, file);
    return getDownloadURL(storageReference);
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const getFileURL = async (path: string): Promise<string> => {
  try {
    const storageReference = storageRef(storage, path);
    return getDownloadURL(storageReference);
  } catch (error) {
    console.error("Error getting file URL:", error);
    throw error;
  }
};
