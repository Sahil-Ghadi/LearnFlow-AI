import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

if not firebase_admin._apps:
    try:
        key_path = "serviceAccountKey.json"
    
        if os.path.exists(key_path):
            cred = credentials.Certificate(key_path)
            print(f"Loading Firebase credentials from {key_path}")
        else:
            # Fallback to default credentials (useful for cloud deployment)
            print("Warning: serviceAccountKey.json not found. Attempting to use default credentials.")
            cred = credentials.ApplicationDefault()
        
        print("Initializing Firebase Admin App...")
        firebase_admin.initialize_app(cred)
        print("Firebase Admin successfully initialized.")
    except Exception as e:
        print(f"Error initializing Firebase Admin: {e}")
        
#global db instance
db = firestore.client()
