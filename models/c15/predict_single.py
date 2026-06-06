import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model

# ==========================
# Load Model & Files
# ==========================
model = load_model("air_leak_model.keras")
scaler = joblib.load("scaler.pkl")
encoder = joblib.load("leak_label_encoder.pkl")

# ==========================
# Load Dataset
# ==========================
df = pd.read_csv("c15_air_leak_dataset.csv")

feature_cols = [
    "RPM",
    "Fuel_Rate",
    "Fuel_Injection_Pressure",
    "Fuel_Injection_Time",
    "Filter_DeltaP",
    "Turbo_Inlet_Pressure",
    "Turbo_Speed",
    "Compressor_Outlet_Pressure",
    "Compressor_Outlet_Temperature",
    "MAP",
    "MAT",
    "Turbine_Inlet_Pressure",
    "DOC_Inlet_EGT",
    "DOC_Outlet_EGT",
    "DPF_DeltaP",
    "DPF_EGT",
    "NOx"
]

# ==========================
# INPUT SEQUENCE
# ==========================
test_sequence = 22

seq = df[df["Sequence_ID"] == test_sequence].sort_values("TimeStep")

X = seq[feature_cols].values
X = scaler.transform(X)
X = np.expand_dims(X, axis=0)

# ==========================
# Prediction
# ==========================
pred_leak, pred_sev = model.predict(X, verbose=0)

confidence = np.max(pred_leak)

leak_label = encoder.classes_[np.argmax(pred_leak)]
severity = np.argmax(pred_sev)

# ==========================
# Severity Mapping
# ==========================
severity_map = {
    0: "Healthy",
    1: "Low Leak",
    2: "Medium Leak",
    3: "High Leak"
}

# ==========================
# Leak Section Mapping
# ==========================
location_map = {
    "Healthy": "No Leak Detected",

    "CS1": "Air Filter -> MAF Sensor",

    "CS2": "MAF Sensor -> Turbo Compressor Inlet",

    "CS3": "Compressor Outlet -> Charge Air Cooler",

    "CS4": "CAC -> Intake Manifold -> Cylinder",

    "HS1": "Cylinder -> Turbine Inlet",

    "DOC": "Diesel Oxidation Catalyst",

    "DPF": "Diesel Particulate Filter",

    "SCR": "Selective Catalytic Reduction"
}

# ==========================
# GO / NO-GO Logic
# ==========================
if leak_label == "Healthy":
    status = "NO LEAK DETECTED"
    go_nogo = "GO"
    severity_text = "Healthy"
else:
    status = "LEAK DETECTED"
    go_nogo = "NO-GO"
    severity_text = severity_map.get(severity, "Unknown")

# ==========================
# Final Report
# ==========================
print("\n==============================================")
print("        ENGINE DIAGNOSTIC REPORT")
print("==============================================")

print("Status            :", status)
print("GO / NO-GO        :", go_nogo)

print(
    "Leak Section      :",
    location_map.get(leak_label, leak_label)
)


print(
    "Severity Level    :",
    severity_text,
    f"({severity})"
)

print(
    "Confidence        :",
    f"{confidence*100:.2f}%"
)

print("==============================================")