import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

excel_file = os.path.join(
    BASE_DIR,
    "../../datasets/C7_Model_Residuals_Training_Dataset.xlsx"
)

csv_file = os.path.join(
    BASE_DIR,
    "../../datasets/c7_dataset.csv"
)

print("Reading Excel...")

df = pd.read_excel(excel_file)

print("Rows:", len(df))

df.to_csv(csv_file, index=False)

print("CSV Saved:", csv_file)