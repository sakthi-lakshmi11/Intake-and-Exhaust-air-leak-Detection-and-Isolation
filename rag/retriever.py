import os
import faiss
import pickle
import numpy as np

from embeddings import create_embedding

# Get current rag folder path
BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

INDEX_PATH = os.path.join(
    BASE_DIR,
    "recommendation_index.faiss"
)

CHUNKS_PATH = os.path.join(
    BASE_DIR,
    "recommendation_chunks.pkl"
)

# Load FAISS index
index = faiss.read_index(INDEX_PATH)

# Load chunks
with open(CHUNKS_PATH, "rb") as f:
    chunks = pickle.load(f)

def retrieve_recommendation(section, severity, top_k=3):

    query = f"Section: {section} Severity: {severity}"

    query_vector = create_embedding(query)

    query_vector = np.array([query_vector]).astype("float32")

    distances, indices = index.search(query_vector, top_k)

    print("\n===== TOP MATCHES =====")

    for idx in indices[0]:
        print("SECTION :", chunks[idx]["section"])
        print("SEVERITY:", chunks[idx]["severity"])
        print("-----------------------")

    results = []

    for idx in indices[0]:
        results.append(chunks[idx])

    return results