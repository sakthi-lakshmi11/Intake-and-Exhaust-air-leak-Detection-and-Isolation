import random
import joblib
import numpy as np
import pandas as pd

from tensorflow.keras.models import load_model
from rag_engine import get_recommendation
from config import (
    C7_MODEL_PATH,
    C7_SCALER_PATH,
    C7_DATASET_PATH
)

print("Loading C7 Model...")

# ==========================================
# LOAD MODEL
# ==========================================

model = load_model(
    C7_MODEL_PATH,
    compile=False
)

# ==========================================
# LOAD SCALER
# ==========================================

scaler = joblib.load(
    C7_SCALER_PATH
)

# ==========================================
# LOAD DATASET
# ==========================================

print("Loading C7 Dataset...")

if C7_DATASET_PATH.endswith(".xlsx"):
    df = pd.read_excel(C7_DATASET_PATH)
else:
    df = pd.read_csv(C7_DATASET_PATH)

print("C7 Dataset Loaded")
print("Rows :", len(df))

# ==========================================
# FEATURES USED FOR MODEL
# ==========================================

feature_columns = [

    'RPM',
    'Fuel_rate_kg_hr',
    'Fuel_injection_pressure_bar',
    'Fuel_injection_time_ms',

    'Filter_deltaP_Residual',
    'Turbo_inlet_pressure_Residual',
    'turbo_speed_Residual',

    'Compressor_outlet_pressure_Residual',

    'Compressor_outlet_temperature_Residual',

    'MAP_Residual',

    'MAT_Residual',

    'Turbine_inlet_pressure_Residual',

    'DOC_inlet_egt_Residual',

    'DOC_outlet_egt_Residual',

    'DPF_deltaP_Residual',

    'DPF_egt_Residual',

    'Nox_Residual'
]

# ==========================================
# SECTION MAP
# ==========================================

section_map = {

    0: "Healthy (No Leak)",

    1: "Air Filter to MAF Sensor",

    2: "MAF Sensor to Turbo Compressor Inlet",

    3: "Turbo Compressor Outlet to Charge Air Cooler",

    4: "Charge Air Cooler to Intake Manifold",

    5: "Cylinder to Turbo Turbine Inlet",

    6: "Diesel Oxidation Catalyst",

    7: "Diesel Particulate Filter",

    8: "SCR Tracking Zone"
}

# ==========================================
# SEVERITY MAP
# ==========================================

severity_map = {

    0: "No Leak Detected",

    1: "Low Severity Leak",

    2: "Moderate Severity Leak",

    3: "High Severity Leak"
}

# ==========================================
# MAIN PREDICTION FUNCTION
# ==========================================

def run_c7_prediction():

    # Select random 3-second window
    start_index = random.randint(
        0,
        len(df) - 30
    )

    seq = df.iloc[
        start_index:start_index + 30
    ]

    # Prepare model input
    X = seq[
        feature_columns
    ].values

    X_scaled = scaler.transform(X)

    X_scaled = np.expand_dims(
        X_scaled,
        axis=0
    )

    # Run prediction
    predictions = model.predict(
        X_scaled,
        verbose=0
    )

    section_class = int(
        np.argmax(predictions[0])
    )

    severity_class = int(
        np.argmax(predictions[1])
    )

    go_score = float(
        predictions[2][0][0]
    )

    confidence = float(
        np.max(predictions[0]) * 100
    )

    # ==========================================
    # GET PREDICTED LABELS
    # ==========================================

    leak_section = section_map.get(
        section_class,
        "Unknown"
    )

    severity = severity_map.get(
        severity_class,
        "Unknown"
    )

    # ==========================================
    # GET RAG RECOMMENDATIONS
    # ==========================================

    recommendations = get_recommendation(
        leak_section,
        severity
    )

    # ==========================================
    # DASHBOARD VALUES
    # ==========================================

    dashboard_inputs = {

        "rpm":
        float(
            seq.iloc[0]["RPM"]
        ),

        "fuel_rate":
        float(
            seq.iloc[0][
                "Fuel_rate_kg_hr"
            ]
        ),

        "fuel_injection_pressure":
        float(
            seq.iloc[0][
                "Fuel_injection_pressure_bar"
            ]
        ),

        "fuel_injection_time":
        float(
            seq.iloc[0][
                "Fuel_injection_time_ms"
            ]
        )
    }

    return {

        "engine":
        "C7",

        "go_nogo":
        "GO"
        if go_score > 0.5
        else "NO-GO",

        "leak_section":
        leak_section,

        "severity":
        severity,

        "confidence":
        round(confidence, 2),

        "recommendations":
        recommendations,

        "inputs":
        dashboard_inputs
    }