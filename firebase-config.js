// ============================================
// GLOBALEX FIREBASE YAPILANDIRMA - KESİN ÇÖZÜM
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, query, orderBy, onSnapshot, 
    where, getDocs, deleteDoc, doc, updateDoc, serverTimestamp,
    limit, startAfter, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { 
    getStorage, ref, uploadBytes, getDownloadURL, deleteObject 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";
import { 
    getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
    createUserWithEmailAndPassword, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// ------------------- FIREBASE BİLGİLERİN -------------------
// Firebase Console'dan ALDIN, ŞİMDİ YAPIŞTIR!
const firebaseConfig = {
    apiKey: "AIzaSyDhr_iR7w1qOs-SwDZ0FhGhF7RIAfiN1kI",
    authDomain: "havvaabla.firebaseapp.com",
    projectId: "havvaabla",
    storageBucket: "havvaabla.firebasestorage.app",
    messagingSenderId: "783441783764",
    appId: "1:783441783764:web:faec837359e01baaef8441",
    measurementId: "G-1699W1JZK8"
};
// ----------------------------------------------------------

// Firebase başlat
console.log("🔥 Firebase başlatılıyor...", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
console.log("✅ Firebase app başlatıldı");

// Servisler
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
console.log("✅ Firestore, Storage, Auth hazır");

// KOLEKSİYON İSİMLERİ - DEĞİŞTİRME!
const BLOG_COLLECTION = "blog_posts";
const CATEGORIES_COLLECTION = "categories";
const AUTHORS_COLLECTION = "authors";
const SETTINGS_COLLECTION = "settings";

// EXPORT - Hepsini dışarı gönder
export {
    db, storage, auth,
    collection, addDoc, query, orderBy, onSnapshot, where, 
    getDocs, deleteDoc, doc, updateDoc, serverTimestamp,
    ref, uploadBytes, getDownloadURL, deleteObject,
    signInWithEmailAndPassword, signOut, onAuthStateChanged,
    createUserWithEmailAndPassword, sendPasswordResetEmail,
    limit, startAfter, getDoc, setDoc,
    BLOG_COLLECTION, CATEGORIES_COLLECTION, AUTHORS_COLLECTION, SETTINGS_COLLECTION
};