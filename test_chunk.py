from collections import Counter

from rag.pdf_loader import extract_pdf_text
from rag.chunker import chunk_recommendations

pdf_path = "datasets/recommendations final.pdf"

text = extract_pdf_text(pdf_path)

chunks = chunk_recommendations(text)

print("\nTOTAL CHUNKS:", len(chunks))

section_counter = Counter()

for chunk in chunks:
    section_counter[chunk["section"]] += 1

print("\nSECTION COUNTS\n")

for section, count in section_counter.items():
    print(section, ":", count)

print("\n\nALL CHUNKS\n")

for i, chunk in enumerate(chunks, start=1):

    print("\n" + "=" * 80)
    print("CHUNK", i)
    print("=" * 80)

    print("SECTION :", chunk["section"])
    print("SEVERITY:", chunk["severity"])
    print("RECOMMENDATION:")
    print(chunk["recommendation"])