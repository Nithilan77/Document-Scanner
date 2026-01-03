# Deployment Guide for Document Scanner

This guide covers pushing your code to GitHub and deploying both the frontend and backend.

## Part 1: Push to GitHub

1.  **Open your terminal** (e.g., Git Bash, PowerShell, or VS Code terminal).
2.  **Navigate to your project root**:
    ```bash
    cd "c:/Users/user/SEM4/Document-scanner _new/Document-scanner/Document-scanner"
    ```
3.  **Check Git Status**:
    ```bash
    git status
    ```
    You should see modified files (including `.gitignore` which I updated for you).
4.  **Add and Commit Changes**:
    ```bash
    git add .
    git commit -m "Ready for deployment: Update gitignore and project files"
    ```
5.  **Push to GitHub**:
    *   If you haven't linked the remote repo yet:
        ```bash
        git remote add origin https://github.com/Nithilan77/Document-scanner.git
        ```
    *   Push the code:
        ```bash
        git push -u origin main
        ```
    *(If `git push` fails because the remote has changes you don't have, try `git pull origin main --rebase` first, or if it's a fresh repo, force push with `git push -u origin main --force` - **be careful, force push overwrites remote**).*

---

## Part 2: Deploy Backend (Render.com)

We recommend **Render** for the Python/FastAPI backend (Free Tier available).

1.  **Sign up/Login** to [Render.com](https://render.com).
2.  Click **New +** -> **Web Service**.
3.  **Connect GitHub**: Select your `Document-scanner` repository.
4.  **Configure Service**:
    *   **Name**: `document-scanner-backend` (or similar).
    *   **Root Directory**: `backend` (Important! This tells Render where your Python app lives).
    *   **Runtime**: Python 3.
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5.  **Environment Variables** (Advanced):
    *   If you use API keys (like Google Gemini), add them in the "Environment" tab:
        *   Key: `GOOGLE_API_KEY`
        *   Value: `your_actual_api_key`
6.  Click **Create Web Service**.
7.  **Copy the URL**: Once deployed, copy your backend URL (e.g., `https://document-scanner-backend.onrender.com`). You will need this for the frontend.

---

## Part 3: Deploy Frontend (Vercel)

We recommend **Vercel** for the React/Vite frontend.

1.  **Sign up/Login** to [Vercel.com](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  **Import Git Repository**: Select `Document-scanner`.
4.  **Configure Project**:
    *   **Framework Preset**: Vite (should be auto-detected).
    *   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    *   You need to tell the frontend where the backend is.
    *   Add variable: `VITE_API_URL` (or whatever your frontend uses to talk to backend).
    *   Value: The Render Backend URL from Part 2 (e.g., `https://document-scanner-backend.onrender.com`).
    *   *Note: You might need to update your frontend code to use this environment variable if it's currently hardcoded to `localhost:8000`.*
6.  Click **Deploy**.

## Post-Deployment Check

-   Open your Vercel URL.
-   Try uploading a document.
-   If it fails, check the **Console** (F12 > Console) for CORS errors. You might need to update the `backend/main.py` CORS settings to allow your new Vercel domain.
