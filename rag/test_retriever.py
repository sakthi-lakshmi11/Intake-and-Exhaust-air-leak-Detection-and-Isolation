from retriever import retrieve_recommendation

section = "Diesel Particulate Filter"
severity = "High Severity Leak"

results = retrieve_recommendation(section, severity)

for result in results:

    print("\nSECTION:")
    print(result["section"])

    print("\nSEVERITY:")
    print(result["severity"])

    print("\nRECOMMENDATION:")
    print(result["recommendation"])