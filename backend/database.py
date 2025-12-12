"""Shared database connection module to avoid multiple MongoDB clients"""
from pymongo import MongoClient
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
DOTENV_PATH = BASE_DIR / ".env"

try:
    if DOTENV_PATH.exists():
        load_dotenv(dotenv_path=DOTENV_PATH)
    else:
        load_dotenv()
except Exception as e:
    print(f"⚠️ Warning: Could not load .env file: {e}")

# MongoDB connection - single shared instance
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "face_recognition_db")

if not MONGO_URI:
    raise RuntimeError(
        "MONGO_URI environment variable is required. "
        "Copy backend/env.example to backend/.env and set MONGO_URI before starting the server."
    )

# Configure MongoDB connection with connection pooling and timeouts for production
# Reduced maxPoolSize from 10 to 5 to save memory on Render's 512MB limit
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,  # 5s to find server
    connectTimeoutMS=10000,          # 10s to connect
    socketTimeoutMS=30000,           # 30s socket timeout
    maxPoolSize=5,                  # Connection pool max size (reduced for memory)
    minPoolSize=1,                  # Keep 1 connection alive
    retryWrites=True,
    retryReads=True
)

db = client[DATABASE_NAME]

