from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Face Recognition API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
try:
    client = MongoClient(MONGODB_URL)
    db = client["face_recognition"]
    faces_collection = db["faces"]
    users_collection = db["users"]
    logger.info("Successfully connected to MongoDB")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise

# Pydantic models
class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# Routes
@app.get("/")
async def root():
    return {"message": "Face Recognition API is running"}

@app.post("/api/auth/register")
async def register(user_data: UserRegister):
    logger.info(f"Registration attempt for email: {user_data.email}")
    
    try:
        # Check if user already exists
        existing_user = users_collection.find_one({"email": user_data.email})
        if existing_user:
            logger.warning(f"Registration failed: Email {user_data.email} already exists")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user (without password hashing for now)
        user_record = {
            "full_name": user_data.full_name,
            "email": user_data.email,
            "password": user_data.password,  # In production, hash this
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        result = users_collection.insert_one(user_record)
        
        if result.inserted_id:
            logger.info(f"Registration successful for email: {user_data.email}")
            return {
                "access_token": "dummy-token",  # In production, create real JWT
                "token_type": "bearer",
                "user": {
                    "id": str(result.inserted_id),
                    "full_name": user_data.full_name,
                    "email": user_data.email
                }
            }
        else:
            logger.error(f"Registration failed: Database insertion failed for email: {user_data.email}")
            raise HTTPException(status_code=500, detail="Registration failed")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    logger.info(f"Login attempt for email: {user_data.email}")
    
    try:
        # Find user
        user = users_collection.find_one({"email": user_data.email})
        if not user:
            logger.warning(f"Login failed: User not found for email: {user_data.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify password (simple comparison for now)
        if user["password"] != user_data.password:
            logger.warning(f"Login failed: Invalid password for email: {user_data.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        logger.info(f"Login successful for email: {user_data.email}")
        return {
            "access_token": "dummy-token",  # In production, create real JWT
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "full_name": user["full_name"],
                "email": user["email"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.get("/api/faces")
async def get_faces():
    try:
        faces = list(faces_collection.find({}, {"_id": 1, "name": 1, "full_name": 1, "age": 1, "gender": 1, "crime": 1, "description": 1, "status": 1, "created_at": 1, "image_url": 1}))
        
        # Convert ObjectId to string
        for face in faces:
            face["_id"] = str(face["_id"])
            if "created_at" not in face:
                face["created_at"] = datetime.utcnow()
        
        logger.info(f"Retrieved {len(faces)} faces from database")
        return faces
    except Exception as e:
        logger.error(f"Error retrieving faces: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve faces")

@app.post("/api/register")
async def register_face(
    name: str = Form(...),
    fullName: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    crime: str = Form(...),
    description: str = Form(""),
    status: str = Form("active"),
    image_url: str = Form(...)
):
    try:
        # Check if name already exists
        existing_face = faces_collection.find_one({"name": name})
        if existing_face:
            raise HTTPException(status_code=400, detail="Name already exists")
        
        # Create face record
        face_data = {
            "name": name,
            "full_name": fullName,
            "age": age,
            "gender": gender,
            "crime": crime,
            "description": description,
            "status": status,
            "image_url": image_url,
            "created_at": datetime.utcnow(),
            "created_by": "system"
        }
        
        result = faces_collection.insert_one(face_data)
        
        if result.inserted_id:
            logger.info(f"Face registered successfully: {name}")
            return {"message": "Face registered successfully", "id": str(result.inserted_id)}
        else:
            raise HTTPException(status_code=500, detail="Registration failed")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Face registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/recognize")
async def recognize_face(file: UploadFile = File(...)):
    return {
        "recognized": False,
        "best_name": "Unknown",
        "best_score": 0.0,
        "message": "Face recognition not implemented yet"
    }

@app.delete("/api/delete/{name}")
async def delete_face(name: str):
    result = faces_collection.delete_one({"name": name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Face not found")
    return {"message": f"Face {name} deleted successfully"}

@app.post("/api/clear")
async def clear_database():
    result = faces_collection.delete_many({})
    return {"message": f"Database cleared. {result.deleted_count} faces removed"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    return {
        "success": True,
        "data": [{
            "url": f"https://example.com/uploads/{file.filename}",
            "name": file.filename,
            "size": file.size
        }]
    }

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or default to 5000
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(
        app, 
        host=host, 
        port=port,
        log_level="info"
    )