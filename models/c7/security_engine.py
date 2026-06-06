# File Name: security_engine.py
from cryptography.fernet import Fernet
import json

# 1. Generate a secure, persistent key. 

SECRET_KEY = b'Caterpillar_C7_Secure_Testing_Cell_Key_2026='

cipher_suite = Fernet(SECRET_KEY)

def encrypt_payload(data_dict):
    """
    Takes a standard Python dictionary (payload), converts it to a string, 
    and encrypts it into a secure AES-256 byte string.
    """
    # Convert Python dictionary to a clean string format
    json_string = json.dumps(data_dict)
    
    # Encrypt the string
    encrypted_bytes = cipher_suite.encrypt(json_string.encode('utf-8'))
    
    # Convert bytes to a readable string format to transmit over networks
    return encrypted_bytes.decode('utf-8')


def decrypt_payload(encrypted_string):
    """
    Takes an encrypted string from the frontend, decrypts it using our key,
    and returns a clean, usable Python dictionary of numbers.
    """
    # Convert string back to bytes and decrypt
    decrypted_bytes = cipher_suite.decrypt(encrypted_string.encode('utf-8'))
    
    # Convert bytes back to a Python dictionary
    data_dict = json.loads(decrypted_bytes.decode('utf-8'))
    
    return data_dict


# Simple self-test to verify the security system works
if __name__ == "__main__":
    print("Testing Security Engine...")
    
    # Simulate a raw sample coming from the engine sensors
    mock_daq_input = {"RPM": 1500, "Fuel_rate": 45.2, "MAP_Actual": 180.5}
    print(f"Original Input: {mock_daq_input}")
    
    # Step 1: Encrypt the data
    encrypted_data = encrypt_payload(mock_daq_input)
    print(f"\nEncrypted Data Stream (What travels across the network):\n{encrypted_data}")
    
    # Step 2: Decrypt the data
    decrypted_data = decrypt_payload(encrypted_data)
    print(f"\nDecrypted Output inside our Model System: {decrypted_data}")
