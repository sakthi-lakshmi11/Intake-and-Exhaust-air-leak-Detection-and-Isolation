from rag.pdf_loader import extract_pdf_text

pdf_path = "datasets/recommendations final.pdf"  # change name

text = extract_pdf_text(pdf_path)

print(text[:1000])  # print first 1000 characters