# backend/services/c15_service.py

import random
import joblib
import numpy as np
import pandas as pd

from rag_engine import get_recommendation
from tensorflow.keras.models import load_model

from config import (
    C15_MODEL_PATH,
    C15_SCALER_PATH,
    C15_ENCODER_PATH,
    C15_DATASET_PATH
)

print("Loading C15 Model...")

# ==========================================
# LOAD MODEL
# ==========================================

model = load_model(
    C15_MODEL_PATH
)

# ==========================================
# LOAD SCALER
# ==========================================

scaler = joblib.load(
    C15_SCALER_PATH
)

# ==========================================
# LOAD ENCODER
# ==========================================

encoder = joblib.load(
    C15_ENCODER_PATH
)

# ==========================================
# LOAD DATASET
# ==========================================

df = pd.read_csv(
    C15_DATASET_PATH
)

# ==========================================
# FEATURES
# ==========================================

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

# ==========================================
# MAIN PREDICTION FUNCTION
# ==========================================

def run_c15_prediction():

    sequence_ids = df["Sequence_ID"].unique()

    chosen_sequence = random.choice(
        sequence_ids
    )

    seq = (
        df[df["Sequence_ID"] == chosen_sequence]
        .sort_values("TimeStep")
    )

    X = seq[feature_cols].values

    X_scaled = scaler.transform(X)

    X_scaled = np.expand_dims(
        X_scaled,
        axis=0
    )

    pred_leak, pred_sev = model.predict(
        X_scaled,
        verbose=0
    )

    confidence = float(
        np.max(pred_leak) * 100
    )

    leak_label = encoder.classes_[
        np.argmax(pred_leak)
    ]

    severity_class = int(
        np.argmax(pred_sev)
    )

    severity_map = {
        0: "Healthy",
        1: "Low Leak",
        2: "Medium Leak",
        3: "High Leak"
    }

    location_map = {

        "Healthy":
        "No Leak Detected",

        "CS1":
        "Air Filter -> MAF Sensor",

        "CS2":
        "MAF Sensor -> Turbo Compressor Inlet",

        "CS3":
        "Compressor Outlet -> Charge Air Cooler",

        "CS4":
        "CAC -> Intake Manifold -> Cylinder",

        "HS1":
        "Cylinder -> Turbine Inlet",

        "DOC":
        "Diesel Oxidation Catalyst",

        "DPF":
        "Diesel Particulate Filter",

        "SCR":
        "Selective Catalytic Reduction"
    }

    if leak_label == "Healthy":

        go_nogo = "GO"

        severity_text = "Healthy"

    else:

        go_nogo = "NO-GO"

        severity_text = severity_map[
            severity_class
        ]

    # ==========================================
    # GET LEAK SECTION
    # ==========================================

    leak_section = location_map.get(
        leak_label,
        leak_label
    )

    # ==========================================
    # GET RAG RECOMMENDATIONS
    # ==========================================

    recommendations = get_recommendation(
        leak_section,
        severity_text
    )

    # ==========================================
    # DASHBOARD INPUTS
    # ==========================================

    dashboard_inputs = {

        "rpm":
        float(
            seq.iloc[0]["RPM"]
        ),

        "fuel_rate":
        float(
            seq.iloc[0]["Fuel_Rate"]
        ),

        "fuel_injection_pressure":
        float(
            seq.iloc[0][
                "Fuel_Injection_Pressure"
            ]
        ),

        "fuel_injection_time":
        float(
            seq.iloc[0][
                "Fuel_Injection_Time"
            ]
        )
    }

    return {

        "engine":
        "C15",

        "go_nogo":
        go_nogo,

        "leak_section":
        leak_section,

        "severity":
        severity_text,

        "confidence":
        round(confidence, 2),

        "recommendations":
        recommendations,

        "inputs":
        dashboard_inputs
    }