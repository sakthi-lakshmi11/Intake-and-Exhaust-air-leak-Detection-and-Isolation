# File Name: live_inference_pipeline.py
import pandas as pd
import numpy as np
import tensorflow as tf
import joblib
from security_engine import encrypt_payload, decrypt_payload

print("Initializing Secure Live Real-Time Inference Pipeline...")

# 1. Load trained models, preprocessing weights, and raw telemetry simulator data
print("Loading system models and configuration weights...")
model = tf.keras.models.load_model('c7_leak_detector_adam.keras')
scaler = joblib.load('sensor_scaler.joblib')

# Load the raw telemetry file to use as our Test Cell Simulator
simulator_file = "C7_Raw_DAQ_Telemetry_Dataset.xlsx"
df_simulator = pd.read_excel(simulator_file)

# Extract core feature names used during preprocessing
feature_columns = [
    'RPM', 'Fuel_rate_kg_hr', 'Fuel_injection_pressure_bar', 'Fuel_injection_time_ms',
    'Filter_deltaP_Residual', 'Turbo_inlet_pressure_Residual', 'turbo_speed_Residual',
    'Compressor_outlet_pressure_Residual', 'Compressor_outlet_temperature_Residual',
    'MAP_Residual', 'MAT_Residual', 'Turbine_inlet_pressure_Residual',
    'DOC_inlet_egt_Residual', 'DOC_outlet_egt_Residual', 'DPF_deltaP_Residual',
    'DPF_egt_Residual', 'Nox_Residual'
]

# Factory hardcoded bounds used by our internal Physics lookup table 
sensor_healthy_bounds = {
    'Filter_deltaP': (0.4, 2.5), 'Turbo_inlet_pressure': (95.0, 101.0), 'turbo_speed': (25000, 115000),
    'Compressor_outlet_pressure': (110.0, 250.0), 'Compressor_outlet_temperature': (75.0, 200.0),
    'MAP': (100.0, 240.0), 'MAT': (25.0, 65.0), 'Turbine_inlet_pressure': (100.0, 320.0),
    'DOC_inlet_egt': (180.0, 620.0), 'DOC_outlet_egt': (170.0, 600.0), 'DPF_deltaP': (0.5, 8.0),
    'DPF_egt': (180.0, 620.0), 'Nox': (20.0, 450.0)
}

def simulate_frontend_stream():
    """
    Simulates the frontend selecting a continuous 3-second (30 row) block 
    from the raw DAQ file and encrypting it to travel securely over the network.
    """
    WINDOW_SIZE = 30
    max_start_index = len(df_simulator) - WINDOW_SIZE
    random_start = np.random.randint(0, max_start_index)
    
    # Slice out 30 consecutive telemetry rows
    window_df = df_simulator.iloc[random_start:random_start+WINDOW_SIZE]
    
    # Convert dataframe chunk into a standard list of dictionaries
    raw_payload = window_df.to_dict(orient='records')
    
    # Apply AES-256 encryption on the frontend side before it travels over the network
    encrypted_network_string = encrypt_payload(raw_payload)
    return encrypted_network_string


def process_live_inference(encrypted_input_stream):
    """
    Receives encrypted network data, decrypts it, calculates residuals,
    scales data, runs deep learning inference, and ENCRYPTS the final model answers.
    """
    # Step A: Secure Decryption at the Model Gateway in local System Memory
    decrypted_list = decrypt_payload(encrypted_input_stream)
    
    processed_window_rows = []
    
    # Step B: On-the-Fly Residual Physics Calculation for every single reading
    for reading in decrypted_list:
        rpm = reading['RPM']
        load_factor = (rpm - 700) / 1800.0
        
        # Base operational parameters pass through directly
        row_features = {
            'RPM': rpm,
            'Fuel_rate_kg_hr': reading['Fuel_rate_kg_hr'],
            'Fuel_injection_pressure_bar': reading['Fuel_injection_pressure_bar'],
            'Fuel_injection_time_ms': reading['Fuel_injection_time_ms']
        }
        
        # Calculate residuals for all 13 sensors dynamically
        for sensor, limits in sensor_healthy_bounds.items():
            h_min, h_max = limits
            expected_healthy_value = h_min + (h_max - h_min) * load_factor
            
            # Extract the actual value recorded by the DAQ system scanner
            actual_value = reading[f'{sensor}_Actual']
            
            # Residual = Actual - Expected Physics target
            row_features[f'{sensor}_Residual'] = actual_value - expected_healthy_value
            
        processed_window_rows.append(row_features)
        
    # Convert processed window chunk into a clean NumPy matrix shape
    processed_df = pd.DataFrame(processed_window_rows)
    X_flat_window = processed_df[feature_columns].values
    
    # Step C: Load Saved Preprocessing Scaler to shrink variables between 0 and 1
    X_scaled_window = scaler.transform(X_flat_window)
    
    # Reshape array to match 3D LSTM expectation: (1 sample, 30 timesteps, 17 features)
    X_3d_input = np.expand_dims(X_scaled_window, axis=0)
    
    # Step D: Run Multi-Output Model Inferences
    predictions = model.predict(X_3d_input, verbose=0)
    
    # Process branch raw probability outputs into final predictions
    pred_sec_class = int(np.argmax(predictions[0], axis=1)[0])
    pred_sev_class = int(np.argmax(predictions[1], axis=1)[0])
    pred_go_score = float(predictions[2][0][0])
    
    # Calculate a crisp Confidence Score based on the winning output probabilities
    sec_confidence = float(np.max(predictions[0])) * 100
    sev_confidence = float(np.max(predictions[1])) * 100
    avg_confidence_score = round((sec_confidence + sev_confidence) / 2, 2)
    
    # Map target classifications back to their clean physical engineering text strings
    section_map = {0: "Healthy (No Leak)", 1: "Air Filter to MAF Sensor", 2: "MAF Sensor to Turbo Compressor In", 
                   3: "Turbo Compressor Out to CAC", 4: "CAC to Intake Manifold", 5: "Cylinder to Turbine In", 
                   6: "Diesel Oxidation Catalyst (DOC)", 7: "Diesel Particulate Filter (DPF)", 8: "SCR Tracking Zone"}
    
    severity_map = {0: "No Leak Detected", 1: "Low Severity Leak", 2: "Moderate Severity Leak", 3: "High Severity Leak"}
    
    detected_section = section_map[pred_sec_class]
    detected_severity = severity_map[pred_sev_class]
    go_indicator = "GO (System Safe)" if pred_go_score > 0.5 else "NON-GO (IMMEDIATE SHUTDOWN)"
    
    # Package final dashboard evaluation results containing ONLY what the model outputs
    diagnostic_results = {
        "Isolate_Leak_Part": detected_section,
        "Leak_Severity": detected_severity,
        "Indicator": go_indicator,
        "Confidence_Score": f"{avg_confidence_score}%"
    }
    
    # Step E: ENCRYPT MODEL OUTPUT payloads before sending them back to the network line
    encrypted_response_payload = encrypt_payload(diagnostic_results)
    return encrypted_response_payload

# --- RUN EXECUTION DEMO IN TERMINAL ---
if __name__ == "__main__":
    print("\n" + "="*60)
    print("RUNNING REAL-TIME TEST CELL DIAGNOSTIC SIMULATION RUN")
    print("="*60)
    
    # 1. Simulate frontend gathering data, locking it down, and transmitting it
    print("[FRONTEND SIMULATOR]: Grabbing a random 3-second engine stream window...")
    network_stream = simulate_frontend_stream()
    print(f"[NETWORK WIRE - INBOUND]: Transmitting Encrypted Input Stream String (Length: {len(network_stream)} chars)...")
    
    # 2. Pass data across the system gateway to execute deep model analysis
    print("\n[BACKEND GATEWAY]: Processing payload through decryption, physics-mapping, and LSTM inference...")
    encrypted_response = process_live_inference(network_stream)
    
    print(f"[NETWORK WIRE - OUTBOUND]: Model inference finished. Transmitting Encrypted Output String:\n{encrypted_response}")
    
    # 3. Decrypt on client side to show operators clean diagnostic metrics
    print("\n[FRONTEND DASHBOARD]: Decrypting backend payload with the authorized key...")
    final_output = decrypt_payload(encrypted_response)
    
    print("\n" + "-"*40)
    print("LIVE OPERATOR DIAGNOSTIC DASHBOARD MONITOR")
    print("-"*40)
    print(f"1. GO / NON-GO INDICATOR : {final_output['Indicator']}")
    print(f"2. ISOLATED LEAK PART    : {final_output['Isolate_Leak_Part']}")
    print(f"3. DETECTED SEVERITY     : {final_output['Leak_Severity']}")
    print(f"4. DIAGNOSTIC CONFIDENCE : {final_output['Confidence_Score']}")
    print("="*60)
