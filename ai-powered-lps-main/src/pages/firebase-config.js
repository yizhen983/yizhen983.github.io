// firebase-config.js

// 改用 CDN 連結，這樣瀏覽器可以直接讀取，不需要 npm install 打包
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// 你的設定檔
const firebaseConfig = {
  apiKey: "AIzaSyDMdAfABB72fALlUfBi7z3RJX5S5PL2wEU",
  authDomain: "ai-powered-lps-main.firebaseapp.com",
  projectId: "ai-powered-lps-main",
  storageBucket: "ai-powered-lps-main.firebasestorage.app",
  messagingSenderId: "579215998998",
  appId: "1:579215998998:web:a0c06f7343f58f405ff537",
  measurementId: "G-KKSE53LP2K"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 初始化資料庫與儲存空間，並匯出給其他檔案使用
export const db = getFirestore(app);
export const storage = getStorage(app);
