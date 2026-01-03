import os
import pypdf
import sys

# Ensure backend directory is in path for imports if running from elsewhere (though usually run from backend dir)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from rag_service import rag_service

# Define files to ingest
PDF_FILES = [
    "Aadhaar_Handbook_2021_LR.pdf",
    "Consumer_Handbook_india.pdf",
    "PMAY-india.pdf",
    "TN-electricity-tariff.pdf",
    "WelfareSchemes.pdf",
    "consumer-protection-act-india.pdf",
    "pds-tamilnadu.pdf"
]

def extract_text_from_pdf(pdf_path):
    print(f"Extracting text from {pdf_path}...")
    text = ""
    try:
        reader = pypdf.PdfReader(pdf_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
    return text

def chunk_text(text, chunk_size=1000, overlap=100):
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk = text[start:end]
        
        # Basic cleanup: remove excessive newlines
        chunk = chunk.replace('\n', ' ')
        chunks.append(chunk)
        
        if end == text_len:
            break
            
        start += chunk_size - overlap
    return chunks

def ingest_data():
    # File is in backend/, so PDFs are in parent directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    
    print(f"Scanning for PDF files in: {project_root}")
    
    for filename in PDF_FILES:
        filepath = os.path.join(project_root, filename)
        if not os.path.exists(filepath):
            print(f"[SKIP] File not found: {filename}")
            continue
            
        print(f"\nProcessing {filename}...")
        
        raw_text = extract_text_from_pdf(filepath)
        if not raw_text.strip():
            print(f"[SKIP] No text extracted from {filename}.")
            continue
            
        chunks = chunk_text(raw_text)
        print(f"Split {filename} into {len(chunks)} chunks.")
        
        # Prepare for batch insertion
        ids = [f"{filename}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [{"source": filename, "chunk_index": i} for i in range(len(chunks))]
        
        # Ingest in batches to avoid overwhelming the embedding API
        batch_size = 20
        total_batches = (len(chunks) + batch_size - 1) // batch_size
        
        for i in range(0, len(chunks), batch_size):
            batch_chunks = chunks[i:i+batch_size]
            batch_ids = ids[i:i+batch_size]
            batch_metas = metadatas[i:i+batch_size]
            
            print(f"  > Ingesting batch {i//batch_size + 1}/{total_batches} ({len(batch_chunks)} docs)...")
            try:
                rag_service.add_documents(batch_chunks, batch_metas, batch_ids)
            except Exception as e:
                print(f"  [ERROR] Failed to ingest batch: {e}")

    print("\nTotal Ingestion Complete.")

if __name__ == "__main__":
    ingest_data()
