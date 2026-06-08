# backend/config.py

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# =========================
# MODEL PATHS
# =========================

C15_MODEL_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "c15",
    "air_leak_model.keras"
)

C15_SCALER_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "c15",
    "scaler.pkl"
)

C15_ENCODER_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "c15",
    "leak_label_encoder.pkl"
)

C7_MODEL_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "c7",
    "c7_leak_detector_adam.keras"
)

C7_SCALER_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "c7",
    "sensor_scaler.joblib"
)

# =========================
# DATASETS
# =========================

C15_DATASET_PATH = os.path.join(
    BASE_DIR,
    "..",
    "datasets",
    "c15_air_leak_dataset.csv"
)

C7_DATASET_PATH = os.path.join(
    BASE_DIR,
    "../datasets/c7_dataset.csv"
)