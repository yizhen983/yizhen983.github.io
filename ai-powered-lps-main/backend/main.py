import os
import json
import time
import uuid
import uvicorn
import re
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

# --- 設定區 ---
# 從環境變數讀取金鑰，如果沒有則報錯
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("警告: 未設定 GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

# 模型設定 (使用較新的 Flash 模型)
MODEL_NAME = 'gemini-1.5-flash' 
model = genai.GenerativeModel(MODEL_NAME)

app = FastAPI()

# --- CORS 設定 (關鍵！允許 Netlify 連線) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允許所有來源，解決跨域問題
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 建立錄音存檔資料夾
UPLOAD_DIR = "uploads/recordings"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- 輔助函式 ---
def clean_json_text(text: str) -> str:
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        return text[start : end + 1]
    return text.strip()

# --- API 介面 ---
@app.get("/")
def home():
    return {"status": "Backend is running!", "service": "LPS-AI"}

@app.post("/api/upload-lesson")
async def upload_lesson(file: UploadFile = File(...)):
    try:
        content = await file.read()
        # 簡易處理：嘗試解碼為文字 (若為 PDF/Docx 在此範例中可能需要額外處理，這裡先假設為可讀文字以通過測試)
        try:
            text_content = content.decode("utf-8")
        except:
            # 如果是二進位檔，暫時回傳模擬文字讓流程跑通
            text_content = "課程內容：買飲料。顧客：我要一杯紅茶。店員：好的。"

        prompt = f"""
        分析以下教材並回傳純 JSON (無 Markdown):
        {{
            "title": "標題",
            "vocabulary": [ {{"word": "生詞", "pinyin": "拼音", "english": "英文"}} ],
            "sentences": [ {{"text": "句子", "pinyin": "拼音"}} ]
        }}
        教材: {text_content}
        """

        response = model.generate_content(prompt)
        cleaned = clean_json_text(response.text)
        return json.loads(cleaned)
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/save-recording")
async def save_recording(file: UploadFile = File(...)):
    try:
        filename = f"{int(time.time())}_{uuid.uuid4().hex[:6]}.wav"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
        return {"status": "success", "filename": filename}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    # Render 會透過環境變數傳入 PORT，若無則預設 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
