from fastapi import APIRouter, HTTPException, Body, Depends
from pymongo import MongoClient
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from bson import ObjectId
import bcrypt
import os
import random
import hashlib

# Import middleware and services
from middleware.auth import create_access_token, get_current_user_id, verify_token
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from services.email_service import EmailService

# Database connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://MANJU-A-R:Atlas%401708@cluster0.w3p8plb.mongodb.net/?retryWrites=true&w=majority')
client = MongoClient(MONGO_URI)
db = client["face_recognition_db"]
users_collection = db["users"]
otps_collection = db["otps"]

# Environment variables
REGISTRATION_SECRET_KEY = os.getenv('REGISTRATION_SECRET_KEY', 'Eyedentify@#25')
OTP_EXPIRATION_MINUTES = 10

# Email service
email_service = EmailService()

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

# Helper functions
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_otp() -> str:
    """Generate 6-digit OTP"""
    return str(random.randint(100000, 999999))

def hash_otp(otp: str) -> str:
    """Hash OTP for storage"""
    return hashlib.sha256(otp.encode()).hexdigest()

@router.post("/send-otp")
async def send_otp(email: str = Body(..., embed=True)):
    """Send OTP to email for registration"""
    try:
        # Validate email format
        if not email or '@' not in email:
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Check if email already exists
        existing_user = users_collection.find_one({"email": email.lower()})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Generate OTP
        otp = generate_otp()
        otp_hash = hash_otp(otp)
        
        # Store OTP in database with expiration
        expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRATION_MINUTES)
        otps_collection.update_one(
            {"email": email.lower()},
            {
                "$set": {
                    "otp_hash": otp_hash,
                    "expires_at": expires_at,
                    "created_at": datetime.utcnow(),
                    "attempts": 0
                }
            },
            upsert=True
        )
        
        # Send OTP email
        email_result = await email_service.send_otp_email(email, otp)
        
        if not email_result.get("success"):
            error_msg = email_result.get("message", "Unknown error")
            print(f"Email service error: {error_msg}")  # Debug log
            raise HTTPException(status_code=500, detail=f"Failed to send OTP email: {error_msg}")
        
        return {
            "status": "ok",
            "message": "OTP sent successfully to your email",
            "expires_in_minutes": OTP_EXPIRATION_MINUTES
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

@router.post("/verify-otp")
async def verify_otp(
    email: str = Body(..., embed=True),
    otp: str = Body(..., embed=True)
):
    """Verify OTP code"""
    try:
        # Get OTP record
        otp_record = otps_collection.find_one({"email": email.lower()})
        
        if not otp_record:
            raise HTTPException(status_code=400, detail="OTP not found. Please request a new OTP.")
        
        # Check expiration
        if datetime.utcnow() > otp_record["expires_at"]:
            otps_collection.delete_one({"email": email.lower()})
            raise HTTPException(status_code=400, detail="OTP expired. Please request a new OTP.")
        
        # Check attempts (prevent brute force)
        if otp_record.get("attempts", 0) >= 5:
            otps_collection.delete_one({"email": email.lower()})
            raise HTTPException(status_code=400, detail="Too many failed attempts. Please request a new OTP.")
        
        # Verify OTP
        otp_hash = hash_otp(otp)
        if otp_hash != otp_record["otp_hash"]:
            otps_collection.update_one(
                {"email": email.lower()},
                {"$inc": {"attempts": 1}}
            )
            raise HTTPException(status_code=400, detail="Invalid OTP code")
        
        # OTP verified successfully - mark as verified
        otps_collection.update_one(
            {"email": email.lower()},
            {"$set": {"verified": True, "verified_at": datetime.utcnow()}}
        )
        
        return {
            "status": "ok",
            "message": "OTP verified successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify OTP: {str(e)}")

@router.post("/register")
async def register(
    email: str = Body(..., embed=True),
    username: str = Body(..., embed=True),
    password: str = Body(..., embed=True),
    secret_key: str = Body(..., embed=True),
    otp: str = Body(..., embed=True)
):
    """Register new user with secret key and OTP verification"""
    try:
        # Validate secret key
        if secret_key != REGISTRATION_SECRET_KEY:
            raise HTTPException(status_code=403, detail="Invalid registration secret key")
        
        # Validate inputs
        if not email or not username or not password:
            raise HTTPException(status_code=400, detail="All fields are required")
        
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        
        # Check if email already exists
        existing_user = users_collection.find_one({"email": email.lower()})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Check if username already exists
        existing_username = users_collection.find_one({"username": username})
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")
        
        # Verify OTP
        otp_record = otps_collection.find_one({"email": email.lower()})
        if not otp_record or not otp_record.get("verified"):
            raise HTTPException(status_code=400, detail="Please verify your email with OTP first")
        
        # Verify OTP code matches
        otp_hash = hash_otp(otp)
        if otp_hash != otp_record["otp_hash"]:
            raise HTTPException(status_code=400, detail="Invalid OTP code")
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Create user
        user_doc = {
            "email": email.lower(),
            "username": username,
            "password": hashed_password,
            "isEmailVerified": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Delete OTP record after successful registration
        otps_collection.delete_one({"email": email.lower()})
        
        # Generate JWT token
        token = create_access_token({"sub": user_id, "email": email.lower()})
        
        return {
            "status": "ok",
            "message": "User registered successfully",
            "token": token,
            "user": {
                "id": user_id,
                "email": email.lower(),
                "username": username
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login")
async def login(
    email: str = Body(..., embed=True),
    password: str = Body(..., embed=True)
):
    """Login with email and password"""
    try:
        # Find user
        user = users_collection.find_one({"email": email.lower()})
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Generate JWT token
        token = create_access_token({"sub": str(user["_id"]), "email": user["email"]})
        
        return {
            "status": "ok",
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "username": user["username"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout user (client should discard token)"""
    return {
        "status": "ok",
        "message": "Logged out successfully"
    }

@router.get("/me")
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """Get current user information"""
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "status": "ok",
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "username": user["username"],
                "isEmailVerified": user.get("isEmailVerified", False),
                "createdAt": user["createdAt"].isoformat() if user.get("createdAt") else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user info: {str(e)}")

