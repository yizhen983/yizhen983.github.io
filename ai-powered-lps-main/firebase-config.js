// 檔案：firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMdAfABB72fALlUfBi7z3RJX5S5PL2wEU",
  authDomain: "ai-powered-lps-main.firebaseapp.com",
  projectId: "ai-powered-lps-main",
  storageBucket: "ai-powered-lps-main.firebasestorage.app",
  messagingSenderId: "579215998998",
  appId: "1:579215998998:web:a0c06f7343f58f405ff537",
  measurementId: "G-KKSE53LP2K"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
