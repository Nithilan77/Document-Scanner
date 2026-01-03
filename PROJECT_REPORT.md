# Document Scanner & Explainer - Project Overview

This report details the technical architecture, technology stack, and implementation details of the Document Scanner application.

## 1. High-Level Architecture
The application is a full-stack web app designed to upload documents (PDFs/Images), extract their text, and provide simplified explanations in a local language (e.g., Hindi), augmented by legal knowledge (RAG).

**Flow:**
1.  **Frontend**: User uploads a file and selects a language.
2.  **Backend**: Receives the file, saves it locally.
3.  **Vision Analysis**: Uses **Gemini 2.0 Flash** to "see" the document and extract text verbatim.
4.  **RAG (Retrieval-Augmented Generation)**: Uses the extracted text to query a local Vector DB (**ChromaDB**) for relevant laws/schemes.
5.  **Explanation**: Gemini 2.0 Flash generates a simplified explanation in the target language, combining the document text + retrieved legal context.

---

## 2. Backend Tech Stack
**Directory:** `backend/`

*   **Language:** Python (Likely 3.9+)
*   **Web Framework:** **FastAPI** (High-performance async web framework)
*   **Server:** Uvicorn (ASGI server)
*   **AI Models (Google Gemini):**
    *   **Vision/Generation:** `gemini-2.0-flash` (Fast, multimodal)
    *   **Embeddings:** `text-embedding-004` (For RAG vector search)
*   **Database (Vector):** **ChromaDB** (Stores embeddings of laws/rules for retrieval)
*   **Key Dependencies (`requirements.txt`):**
    *   `google-generativeai`: Official SDK for Gemini API.
    *   `python-dotenv`: Management of environment variables (API Keys).
    *   `pypdf`: PDF processing (though Gemini Vision deals with visuals mostly).
    *   `python-multipart`: For handling file uploads in FastAPI.

**Key Files:**
*   `main.py`: Entry point. Defines API endpoints (`/upload`, `/analyze`). Handles CORS to allow frontend connection.
*   `gemini_client.py`: Handles all interactions with Google Gemini (Vision, Text Generation, Embeddings).
*   `rag_service.py`: Managing the ChromaDB instance for storing and retrieving legal knowledge.

---

## 3. Frontend Tech Stack
**Directory:** `frontend/`

*   **Framework:** **React** (v19)
*   **Build Tool:** **Vite** (Fast build tool)
*   **Styling:** **Tailwind CSS** (v4.0+)
    *   Uses a modern, dark-themed UI with gradients (Indigo/Cyan).
*   **Icons:** `lucide-react`
*   **State Management:** React `useState` (Local state).
*   **HTTP Client:** `axios` (For communicating with the Backend API).
*   **Components:**
    *   `App.jsx`: Main orchestration.
    *   `FileUpload.jsx`: Drag-and-drop zone (`react-dropzone`).
    *   `LanguageSelector.jsx`: Dropdown for language selection.
    *   `ExplanationView.jsx`: Renders the Markdown result.

---

## 4. Detailed Data Flow
### Step 1: File Upload
- **Frontend** sends `POST /upload` with the file.
- **Backend** saves the file to `backend/uploads/`.
- **Response**: Returns the local server filename.

### Step 2: Analysis (`POST /analyze`)
- **Frontend** sends filename + target language.
- **Backend**:
    1.  **Vision**: Sends file to Gemini 2.0 Flash. Prompt: "Extract all legible text... Identify type of document."
    2.  **RAG Lookup**: Takes the first 1000 characters of extracted text -> Embeds it -> Queries ChromaDB for similar "Laws/Schemes".
    3.  **Synthesis**: Sends `Document Text` + `Retrieved Laws` + `Target Language` to Gemini 2.0.
    4.  **Prompt**: "You are a helpful assistant... Explain this document... Simplify jargon... Provide actionable steps."
- **Response**: Returns JSON with usage explanation, related laws, and original text summary.

## 5. Environment Setup
The backend requires a `.env` file with:
```env
GEMINI_API_KEY=your_api_key_here
```
The frontend connects to the backend (defaulting to localhost, likely port 8000).
