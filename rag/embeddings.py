from sentence_transformers import SentenceTransformer

model = None

def create_embedding(text):
    global model
    if model is None:
        print("Loading SentenceTransformer model...")
        model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )
    return model.encode(text)