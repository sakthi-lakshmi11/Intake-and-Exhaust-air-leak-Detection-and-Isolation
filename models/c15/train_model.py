print("HELLO FROM TRAIN_MODEL")
import pandas as pd
import numpy as np
import tensorflow as tf
import joblib

from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

from tensorflow.keras.models import Model
from tensorflow.keras.layers import (
    Input,
    Conv1D,
    MaxPooling1D,
    Bidirectional,
    LSTM,
    Dense,
    Dropout,
    Attention,
    GlobalAveragePooling1D
)

from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint
)

# =====================================================
# 1. LOAD DATASET
# =====================================================

print("Loading Dataset...")

df = pd.read_csv("c15_air_leak_dataset.csv")

print("Dataset Shape:", df.shape)

# =====================================================
# 2. FEATURES
# =====================================================

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

# =====================================================
# 3. ENCODE LEAK LABELS
# =====================================================

print("Encoding Labels...")

leak_encoder = LabelEncoder()

df["Leak_Label_Encoded"] = leak_encoder.fit_transform(
    df["Leak_Label"]
)

joblib.dump(
    leak_encoder,
    "leak_label_encoder.pkl"
)

# =====================================================
# 4. CREATE SEQUENCES
# =====================================================

print("Creating Sequences...")

X = []
y_leak = []
y_severity = []

sequence_ids = df["Sequence_ID"].unique()

for seq in sequence_ids:

    temp = df[
        df["Sequence_ID"] == seq
    ].sort_values("TimeStep")

    X.append(
        temp[feature_cols].values
    )

    y_leak.append(
        temp["Leak_Label_Encoded"].iloc[0]
    )

    y_severity.append(
        temp["Severity"].iloc[0]
    )

X = np.array(X)
y_leak = np.array(y_leak)
y_severity = np.array(y_severity)

print("Sequence Shape:", X.shape)

# Expected:
# (20000, 30, 17)

# =====================================================
# 5. SCALE FEATURES
# =====================================================

print("Scaling Features...")

samples = X.shape[0]
timesteps = X.shape[1]
features = X.shape[2]

scaler = StandardScaler()

X_reshaped = X.reshape(-1, features)

X_scaled = scaler.fit_transform(X_reshaped)

X = X_scaled.reshape(
    samples,
    timesteps,
    features
)

joblib.dump(
    scaler,
    "scaler.pkl"
)

# =====================================================
# 6. TRAIN / VALIDATION / TEST SPLIT
# =====================================================

print("Splitting Dataset...")

X_train, X_temp, \
y_train_leak, y_temp_leak, \
y_train_sev, y_temp_sev = train_test_split(

    X,
    y_leak,
    y_severity,

    test_size=0.30,
    random_state=42,
    stratify=y_leak
)

X_val, X_test, \
y_val_leak, y_test_leak, \
y_val_sev, y_test_sev = train_test_split(

    X_temp,
    y_temp_leak,
    y_temp_sev,

    test_size=0.50,
    random_state=42,
    stratify=y_temp_leak
)
joblib.dump(X_test, "X_test.pkl")
joblib.dump(y_test_leak, "y_test_leak.pkl")
joblib.dump(y_test_sev, "y_test_sev.pkl")

print("\nTrain Shape :", X_train.shape)
print("Validation Shape :", X_val.shape)
print("Test Shape :", X_test.shape)

# =====================================================
# 7. CNN + BiLSTM + SELF ATTENTION
# =====================================================

print("\nBuilding Model...")

inputs = Input(shape=(30, 17))

# CNN

x = Conv1D(
    filters=64,
    kernel_size=3,
    activation="relu"
)(inputs)

x = MaxPooling1D(
    pool_size=2
)(x)

# BiLSTM

x = Bidirectional(
    LSTM(
        64,
        return_sequences=True
    )
)(x)

# Self Attention

attention_output = Attention()([x, x])

x = GlobalAveragePooling1D()(attention_output)

# Dense

x = Dense(
    128,
    activation="relu"
)(x)

x = Dropout(0.30)(x)

# =====================================================
# 8. OUTPUTS
# =====================================================

leak_output = Dense(
    len(leak_encoder.classes_),
    activation="softmax",
    name="leak_output"
)(x)

severity_output = Dense(
    4,
    activation="softmax",
    name="severity_output"
)(x)

# =====================================================
# 9. MODEL
# =====================================================

model = Model(
    inputs=inputs,
    outputs=[
        leak_output,
        severity_output
    ]
)

model.summary()

# =====================================================
# 10. COMPILE
# =====================================================

model.compile(

    optimizer="adam",

    loss={
        "leak_output":
        "sparse_categorical_crossentropy",

        "severity_output":
        "sparse_categorical_crossentropy"
    },

    metrics={
        "leak_output":
        ["accuracy"],

        "severity_output":
        ["accuracy"]
    }
)

# =====================================================
# 11. CALLBACKS
# =====================================================

early_stop = EarlyStopping(

    monitor="val_loss",

    patience=8,

    restore_best_weights=True
)

checkpoint = ModelCheckpoint(

    "air_leak_model.keras",

    monitor="val_loss",

    save_best_only=True,

    verbose=1
)

# =====================================================
# 12. TRAIN MODEL
# =====================================================

print("\nStarting Training...")

history = model.fit(

    X_train,

    {
        "leak_output":
        y_train_leak,

        "severity_output":
        y_train_sev
    },

    validation_data=(

        X_val,

        {
            "leak_output":
            y_val_leak,

            "severity_output":
            y_val_sev
        }
    ),

    epochs=50,

    batch_size=128,

    callbacks=[
        early_stop,
        checkpoint
    ],

    verbose=1
)

# =====================================================
# 13. EVALUATE
# =====================================================

print("\nEvaluating Model...")

results = model.evaluate(

    X_test,

    {
        "leak_output":
        y_test_leak,

        "severity_output":
        y_test_sev
    },

    verbose=1
)

print("\nTest Results")
print(results)

# =====================================================
# 14. SAVE FINAL MODEL
# =====================================================

model.save(
    "air_leak_model.keras"
)

print("\n===================================")
print("MODEL TRAINING COMPLETED")
print("===================================")

print("\nSaved Files:")
print("1. air_leak_model.keras")
print("2. scaler.pkl")
print("3. leak_label_encoder.pkl")