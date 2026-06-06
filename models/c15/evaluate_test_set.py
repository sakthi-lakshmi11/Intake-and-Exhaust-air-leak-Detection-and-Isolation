import numpy as np
import joblib

from tensorflow.keras.models import load_model
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

# Load model
model = load_model("air_leak_model.keras")

# Load test set
X_test = joblib.load("X_test.pkl")
y_test_leak = joblib.load("y_test_leak.pkl")
y_test_sev = joblib.load("y_test_sev.pkl")

# Predict all test sequences at once
pred_leak, pred_sev = model.predict(X_test)

pred_leak = np.argmax(pred_leak, axis=1)
pred_sev = np.argmax(pred_sev, axis=1)

# Leak location metrics
location_acc = accuracy_score(y_test_leak, pred_leak)
location_precision = precision_score(
    y_test_leak,
    pred_leak,
    average="weighted"
)
location_recall = recall_score(
    y_test_leak,
    pred_leak,
    average="weighted"
)
location_f1 = f1_score(
    y_test_leak,
    pred_leak,
    average="weighted"
)

# Severity metrics
severity_acc = accuracy_score(y_test_sev, pred_sev)

# GO / NO-GO
actual_go = (y_test_leak != 0).astype(int)
pred_go = (pred_leak != 0).astype(int)

go_nogo_acc = accuracy_score(actual_go, pred_go)

# Overall Accuracy
overall_acc = np.mean(
    (pred_leak == y_test_leak) &
    (pred_sev == y_test_sev)
)

print("\n========== FINAL TEST RESULTS ==========")
print(f"GO / NO-GO Accuracy     : {go_nogo_acc*100:.2f}%")
print(f"Location Accuracy       : {location_acc*100:.2f}%")
print(f"Severity Accuracy       : {severity_acc*100:.2f}%")
print(f"Precision               : {location_precision*100:.2f}%")
print(f"Recall                  : {location_recall*100:.2f}%")
print(f"F1 Score                : {location_f1*100:.2f}%")
print(f"Overall Accuracy        : {overall_acc*100:.2f}%")
print("========================================")