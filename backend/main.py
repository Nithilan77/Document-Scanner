from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import shutil
import os
import io
from tempfile import NamedTemporaryFile
import tts_service

# Initialize App
app = FastAPI(title="Document Scanner & Explainer API")

# CORS Configuration (Allow Frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with frontend URL (e.g., http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helpers ---
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload_file(upload_file: UploadFile, destination: str):
    try:
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    finally:
        upload_file.file.close()

# --- Routes ---

@app.get("/")
def health_check():
    """
    Simple health check to verify backend is running.
    """
    return {"status": "ok", "message": "Document Scanner API is active"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Endpoint to handle file uploads.
    Saves the file locally and returns the path.
    """
    try:
        file_location = f"{UPLOAD_DIR}/{file.filename}"
        save_upload_file(file, file_location)
        return {
            "info": "File saved successfully",
            "filename": file.filename,
            "content_type": file.content_type,
            "path": file_location
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

# --- Analysis Endpoint ---
from pydantic import BaseModel
import mimetypes
from gemini_client import process_document, generate_explanation
from rag_service import rag_service

class AnalyzeRequest(BaseModel):
    filename: str
    language: str = "English"

@app.post("/analyze")
async def analyze_document(request: AnalyzeRequest):
    """
    Orchestrates the full flow:
    1. Read file from uploads/
    2. Vision API (Gemini) -> Extract Text
    3. RAG Search -> Find Laws
    4. Generation (Gemini) -> Explain in Loc Lang
    """
    file_path = f"{UPLOAD_DIR}/{request.filename}"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    # 1. Determine Mime Type
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "application/octet-stream" # Default
        
    try:
        # 2. Extract Text (Vision)
        print(f"Processing {request.filename} (Vision)...")
        doc_text = process_document(file_path, mime_type)
        
        # 3. Retrieve Knowledge (RAG)
        # We use a snippet of the doc text to query the DB (First 1000 chars)
        query_text = doc_text[:1000] 
        print("Querying Knowledge Base...")
        retrieved_docs = rag_service.query(query_text)
        context_str = "\n\n".join(retrieved_docs)
        
        # 4. Generate Explanation
        print(f"Generating Explanation in {request.language}...")
        explanation = generate_explanation(doc_text, context_str, request.language)
        
        return {
            "original_text_summary": doc_text[:200] + "...",
            "explanation": explanation,
            "related_laws": retrieved_docs
        }
        
    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- TTS Endpoint ---
class TTSRequest(BaseModel):
    text: str
    language: str

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    """
    Generates speech from text using Google Cloud TTS.
    Returns an MP3 audio stream.
    """
    try:
        print(f"Received TTS request. Text length: {len(request.text)}, Language: {request.language}")
        # Map frontend simplified language names to BCP-47 codes
        lang_map = {
            "English": "en-US",
            "Hindi": "hi-IN",
            "Tamil": "ta-IN",
            "Telugu": "te-IN",
            "Kannada": "kn-IN",
            "Malayalam": "ml-IN",
            "Marathi": "mr-IN",
            "Gujarati": "gu-IN",
            "Bengali": "bn-IN",
            "Punjabi": "pa-IN",
            "Spanish": "es-ES",
            "French": "fr-FR",
        }
        
        # Default to English if not found
        lang_code = lang_map.get(request.language, "en-US")
        
        audio_content = tts_service.generate_speech(request.text, lang_code)
        
        return StreamingResponse(
            io.BytesIO(audio_content), 
            media_type="audio/mpeg"
        )
    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

