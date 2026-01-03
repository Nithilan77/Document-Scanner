# Intelligent Document Scanner & Explainer

A full-stack application that scans documents via the browser, uses AI to extract text, searches a legal knowledge base, and provides simplified explanations in local languages.

## Prerequisites

*   **Node.js** (v18 or higher)
*   **Python** (v3.9 or higher)
*   **Google Gemini API Key**

## Setup Instructions

### 1. Backend Setup (Python)

Navigate to the `backend` directory:
```bash
cd backend
```

Create a virtual environment (optional but recommended):
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

**Configuration:**
Create a `.env` file in the `backend` folder and add your API key:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Start the Backend Server:
```bash
uvicorn main:app --reload
```
The server will start at `http://127.0.0.1:8000`.

### 2. Frontend Setup (React)

Navigate to the `frontend` directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install --legacy-peer-deps
```

Start the Frontend Server:
```bash
npm run dev
```
The app will open at `http://localhost:5173`.

## How to use

1.  Open the app in your browser.
2.  Click **Scan Document** (Camera Icon) to capture a document.
3.  Or upload an existing image/PDF.
4.  Select your target language.
5.  Click **Analyze**.

## Troubleshooting

*   **Blank Screen?** Ensure you ran `npm install --legacy-peer-deps`.
*   **Network Error?** Ensure the backend server is running.
*   **Rust Panic?** Delete the `backend/db_storage` folder and restart the backend.
