import sys
import os

# Add rag folder to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)

RAG_PATH = os.path.join(PROJECT_ROOT, "rag")

if RAG_PATH not in sys.path:
    sys.path.append(RAG_PATH)

from retriever import retrieve_recommendation


def get_recommendation(leak_section, severity):

    results = retrieve_recommendation(
        leak_section,
        severity
    )

    for item in results:

        print("\nMATCH CHECK")
        print("PRED SECTION :", leak_section)
        print("CHUNK SECTION:", item["section"])

        print("PRED SEVERITY :", severity)
        print("CHUNK SEVERITY:", item["severity"])

        if (
            item["section"].strip().lower()
            == leak_section.strip().lower()
            and
            item["severity"].strip().lower()
            == severity.strip().lower()
        ):
            print("EXACT MATCH FOUND")
            return item["recommendation"]

    if len(results) > 0:
        return results[0]["recommendation"]

    return "No recommendation found."