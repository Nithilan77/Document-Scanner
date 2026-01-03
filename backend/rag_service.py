import chromadb
from chromadb.utils import embedding_functions
from typing import List, Dict
import os
import pickle
from rank_bm25 import BM25Okapi
from gemini_client import embed_text, configure_gemini

# --- Configuration ---
PERSIST_DIRECTORY = "db_storage"
BM25_PERSIST_PATH = os.path.join(PERSIST_DIRECTORY, "bm25.pkl")

class RAGService:
    def __init__(self):
        """
        Initializes the ChromaDB client and collection.
        Uses a local persistent storage.
        """
        print("Initializing RAG Service...")
        configure_gemini() # Ensure API is set up
        
        # Ensure directory exists
        os.makedirs(PERSIST_DIRECTORY, exist_ok=True)
        
        self.client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
        
        # Create or Get a collection
        self.collection = self.client.get_or_create_collection(
            name="legal_knowledge_base",
            metadata={"hnsw:space": "cosine"} # Cosine similarity for semantic search
        )
        
        # Initialize BM25
        self.bm25 = None
        self.doc_registry = {} # ID -> Document Text mapping for fast lookup
        self._sync_bm25()
        
        print(f"RAG Service Initialized. Collection count: {self.collection.count()}")

    def _sync_bm25(self):
        """
        Syncs the BM25 index with the ChromaDB collection.
        Since BM25 is in-memory, we rebuild it or load it. 
        For simplicity and robustness, we fetch all docs from Chroma to ensure 100% sync.
        """
        print("Syncing BM25 Index...")
        try:
            # Fetch all documents from existing collection
            data = self.collection.get()
            ids = data['ids']
            documents = data['documents']
            
            if not ids:
                print("Knowledge Base is empty. Skipping BM25 build.")
                return

            self.doc_registry = dict(zip(ids, documents))
            
            # Simple tokenization by splitting on whitespace
            tokenized_corpus = [doc.lower().split() for doc in documents]
            self.bm25 = BM25Okapi(tokenized_corpus)
            self.bm25_ids = ids # Keep track of ID order in BM25
            print("BM25 Index synced successfully.")
            
        except Exception as e:
            print(f"Error syncing BM25: {e}")

    def add_documents(self, documents: List[str], metadatas: List[Dict], ids: List[str]):
        """
        Adds documents to the knowledge base (Vector + Keyword).
        """
        print(f"Adding {len(documents)} documents to Knowledge Base...")
        
        # 1. Generate Embeddings using Gemini
        embeddings = [embed_text(doc) for doc in documents]
        
        # 2. Add to Chroma
        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        
        # 3. Update BM25 (Re-sync is safest for consistency)
        self._sync_bm25()
        
        print("Documents added successfully.")

    def query(self, query_text: str, n_results: int = 3) -> List[str]:
        """
        Retrieves relevant context using Hybrid Search (RRF).
        """
        print(f"Querying RAG for: '{query_text}'")
        
        # If empty, return empty
        if self.collection.count() == 0:
            return []

        # --- 1. Vector Search ---
        query_embedding = embed_text(query_text)
        vector_results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results * 2 # Fetch more for re-ranking
        )
        
        vector_ids = vector_results['ids'][0] if vector_results['ids'] else []
        
        # --- 2. Keyword Search (BM25) ---
        bm25_ids = []
        if self.bm25:
            tokenized_query = query_text.lower().split()
            # Get scores for all docs is cleaner for RRF but slower. 
            # We'll get top N*2 docs
            # rank_bm25 doesn't give IDs directly, gives docs. 
            # We maintained self.bm25_ids corresponding to the corpus used in init.
            
            scores = self.bm25.get_scores(tokenized_query)
            top_n_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:n_results * 2]
            bm25_ids = [self.bm25_ids[i] for i in top_n_indices]

        # --- 3. Reciprocal Rank Fusion (RRF) ---
        k = 60 # RRF constant
        rrf_scores = {}

        # Rank Vector Results
        for rank, doc_id in enumerate(vector_ids):
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0) + (1 / (k + rank))

        # Rank BM25 Results
        for rank, doc_id in enumerate(bm25_ids):
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0) + (1 / (k + rank))

        # Sort by RRF Score
        sorted_ids = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)[:n_results]
        
        # Retrieve Documents
        final_docs = []
        for doc_id, _ in sorted_ids:
            # We can get doc from registry
            if doc_id in self.doc_registry:
                final_docs.append(self.doc_registry[doc_id])
            else:
                 # Fallback if registry out of sync
                 res = self.collection.get(ids=[doc_id])
                 if res['documents']:
                     final_docs.append(res['documents'][0])
        
        return final_docs

# Singleton Instance
rag_service = RAGService()
