import faiss
import numpy as np
import pickle

from pdf_loader import extract_pdf_text
from chunker import chunk_recommendations
from embeddings import create_embedding

pdf_path = "../datasets/recommendations final.pdf"

text = extract_pdf_text(pdf_path)

chunks = chunk_recommendations(text)

documents = []

vectors = []

for chunk in chunks:

    chunk_text = (
        f"Section: {chunk['section']} "
        f"Severity: {chunk['severity']} "
        f"{chunk['recommendation']}"
    )

    documents.append(chunk)

    vectors.append(
        create_embedding(chunk_text)
    )

vectors = np.array(vectors).astype("float32")

dimension = vectors.shape[1]

index = faiss.IndexFlatL2(dimension)

index.add(vectors)

faiss.write_index(
    index,
    "recommendation_index.faiss"
)

with open(
    "recommendation_chunks.pkl",
    "wb"
) as f:
    pickle.dump(documents, f)

print("FAISS index created successfully")
print("Total vectors:", len(vectors))