import os
import time
import json
import re
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from pypdf import PdfReader
import docx2txt
import io

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini configuration
# Note: In a real environment, use environment variables for API keys
GEMINI_API_KEY = os.environ.get("GOOGLE_API_KEY", "YOUR_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

UPLOAD_DIR = "uploads/recordings"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def extract_text_from_file(file_content: bytes, filename: str) -> str:
    if filename.endswith('.pdf'):
        reader = PdfReader(io.BytesIO(file_content))
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    elif filename.endswith('.docx'):
        return docx2txt.process(io.BytesIO(file_content))
    elif filename.endswith('.txt'):
        return file_content.decode('utf-8')
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")

def clean_json_response(response_text: str) -> dict:
    # Remove markdown code blocks if present
    json_str = response_text
    if "```json" in response_text:
        json_str = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        json_str = response_text.split("```")[1].split("```")[0].strip()
    
    # Remove any potential leading/trailing non-JSON characters
    json_str = re.sub(r'^[^{]*', '', json_str)
    json_str = re.sub(r'[^}]*$', '', json_str)
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        print(f"Attempted to parse: {json_str}")
        # Last resort: regex for the outermost braces
        json_match = re.search(r'(\{.*\})', json_str, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
        raise ValueError(f"Could not parse JSON from Gemini response: {str(e)}")

@app.post("/api/upload-lesson")
async def upload_lesson(file: UploadFile = File(...)):
    content = await file.read()
    text_content = extract_text_from_file(content, file.filename)
    
    prompt = f"""
    你是一位專業的華語教學專家。請分析以下教材內容，並將其轉換為結構化的教學資料。
    請嚴格回傳純 JSON 格式，不要包含任何 Markdown 標記或額外文字。
    
    教材內容：
    {text_content}
    
    JSON 結構要求（請確保所有欄位都存在，若無內容請給空陣列）：
    {{
      "dialogue": {{
        "content": {{
          "title": "課文標題",
          "warmUp": ["引導問題1", "引導問題2"],
          "characters": [{{ "name": "角色名", "role": "角色描述" }}],
          "setting": "場景描述",
          "lines": [{{ "speaker": "角色名", "text": "對話內容" }}]
        }},
        "vocabulary": [{{ "word": "生詞", "pinyin": "拼音", "definition": "定義", "example": "例句" }}],
        "grammar": [{{ "point": "語法點", "explanation": "解釋", "example": "例句" }}],
        "references": [{{ "title": "參考標題", "url": "URL", "type": "video/article" }}]
      }},
      "essay": {{
        "content": {{
          "title": "短文標題",
          "warmUp": ["引導問題1"],
          "paragraphs": ["段落1內容", "段落2內容"]
        }},
        "vocabulary": [{{ "word": "生詞", "pinyin": "拼音", "definition": "定義", "example": "例句" }}],
        "grammar": [{{ "point": "語法點", "explanation": "解釋", "example": "例句" }}],
        "references": [{{ "title": "參考標題", "url": "URL", "type": "video/article" }}]
      }}
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        parsed_data = clean_json_response(response.text)
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/save-recording")
async def save_recording(file: UploadFile = File(...)):
    timestamp = int(time.time())
    filename = f"recording_{timestamp}_{file.filename}"
    if not filename.endswith('.wav'):
        filename += '.wav'
    
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return {"status": "success", "filename": filename}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
