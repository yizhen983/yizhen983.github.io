// 檔案：script.js
import { db, storage } from "./firebase-config.js";
import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

let mediaRecorder, audioChunks = [];

// 1. 載入教材
async function init() {
    const docSnap = await getDoc(doc(db, "settings", "currentTextbook"));
    if (docSnap.exists()) {
        const data = docSnap.data();
        const area = document.getElementById('content-area');
        area.innerHTML = `<h2>${data.title || '無標題'}</h2>`;
        (data.sentences || []).forEach((s, i) => {
            area.innerHTML += `<p style="font-size:1.2em; margin:10px 0;">${i+1}. ${s}</p>`;
        });
    } else {
        document.getElementById('content-area').innerHTML = "<p>請老師先至後台上傳教材。</p>";
    }
}
init();

// 2. 錄音功能
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

startBtn.addEventListener('click', async () => {
    const studentId = document.getElementById('studentId').value;
    if(!studentId) return alert("請先輸入學號");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        // 上傳
        const fileName = `recordings/${studentId}_${Date.now()}.webm`;
        const snap = await uploadBytes(ref(storage, fileName), blob);
        const url = await getDownloadURL(snap.ref);
        
        // 寫入資料庫
        await addDoc(collection(db, "student_records"), { studentId, url, time: new Date().toISOString() });
        alert("✅ 上傳成功！");
    };

    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
});

stopBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
});
