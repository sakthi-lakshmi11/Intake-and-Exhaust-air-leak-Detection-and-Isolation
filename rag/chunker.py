import re

SECTIONS = [
    "Air Filter to MAF Sensor",
    "MAF Sensor to Turbocharger Compressor Inlet",
    "Compressor Outlet to Charge Air Cooler",
    "Charge Air Cooler (CAC) to Intake Manifold",
    "Cylinder to Turbocharger Turbine Inlet",
    "Diesel Oxidation Catalyst",
    "Diesel Particulate Filter",
    "Selective Catalytic Reduction",
    "No Leak Detected-Healthy"
]

SEVERITIES = [
    "Low Severity Leak",
    "Moderate Severity Leak",
    "High Severity Leak"
]


def chunk_recommendations(text):

    chunks = []

    current_section = None
    current_severity = None
    recommendation_lines = []

    lines = [line.strip() for line in text.split("\n") if line.strip()]

    def save_chunk():
        nonlocal recommendation_lines

        if (
            current_section is not None
            and current_severity is not None
            and recommendation_lines
        ):
            chunks.append({
                "section": current_section,
                "severity": current_severity,
                "recommendation": " ".join(recommendation_lines)
            })

        recommendation_lines = []

    for line in lines:

        clean_line = line.strip().rstrip(":")

        # ----------------------------------
        # SECTION DETECTION
        # ----------------------------------
        section_found = False

        for section in SECTIONS:

            if section in clean_line:

                save_chunk()

                current_section = section
                current_severity = None
                recommendation_lines = []

                section_found = True

                # Healthy section
                if section == "No Leak Detected-Healthy":

                    chunks.append({
                        "section": "Healthy",
                        "severity": "No Leak Detected-Healthy",
                        "recommendation": ""
                    })

                break

        if section_found:
            continue

        # ----------------------------------
        # SEVERITY DETECTION
        # ----------------------------------
        if clean_line in SEVERITIES:

            save_chunk()

            current_severity = clean_line
            recommendation_lines = []

            continue

        # ----------------------------------
        # HEALTHY RECOMMENDATIONS
        # ----------------------------------
        if current_section == "No Leak Detected-Healthy":

            if chunks:
                chunks[-1]["recommendation"] += " " + clean_line

            continue

        # ----------------------------------
        # RECOMMENDATION TEXT
        # ----------------------------------
        if current_section and current_severity:

            recommendation_lines.append(clean_line)

    save_chunk()

    return chunks