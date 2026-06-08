# security_engine.py
from cryptography.fernet import Fernet
import json

# Generate a proper key ONCE and reuse it
# DO NOT change this after generation
SECRET_KEY = b'3DarVcerfRZipBQ1GPceeEfn1CuB1NBvmtf4EmFq1IA='

cipher_suite = Fernet(SECRET_KEY)


def encrypt_payload(data_dict):
    json_string = json.dumps(data_dict)
    encrypted_bytes = cipher_suite.encrypt(json_string.encode('utf-8'))
    return encrypted_bytes.decode('utf-8')


def decrypt_payload(encrypted_string):
    decrypted_bytes = cipher_suite.decrypt(encrypted_string.encode('utf-8'))
    data_dict = json.loads(decrypted_bytes.decode('utf-8'))
    return data_dict


# Optional test
if __name__ == "__main__":
    mock = {"RPM": 1500, "Fuel_rate": 45.2, "MAP": 180.5}

    enc = encrypt_payload(mock)
    print("Encrypted:", enc)

    dec = decrypt_payload(enc)
    print("Decrypted:", dec)