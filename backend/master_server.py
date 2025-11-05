#!/usr/bin/env python3
"""
MASTER BACKEND SERVER
Face Recognition Dashboard - Complete API Server
"""
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import cloudinary
import cloudinary.uploader
import torch, pickle, base64, numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
from datetime import datetime
from bson import ObjectId
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routes.assets import router as assets_router
from routes.sketches import router as sketches_router

# Import auth router with error handling
try:
    from routes.auth import router as auth_router
    print("✓ Auth router imported successfully")
except Exception as e:
    print(f"✗ Failed to import auth router: {e}")
    import traceback
    traceback.print_exc()
    auth_router = None

# ==================== CONFIGURATION ====================
# MongoDB Configuration
MONGO_URI = "mongodb+srv://MANJU-A-R:Atlas%401708@cluster0.w3p8plb.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["face_recognition_db"]
collection = db["faces"]

# Cloudinary Configuration
cloudinary.config(
    cloud_name="dqkhdusc4",
    api_key="249697193332389",
    api_secret="iiN3cjMrzMXGKQew61kAH5lIIXE"
)

# Face Recognition Configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
mtcnn = MTCNN(image_size=160, margin=0, min_face_size=20, keep_all=False, post_process=True, device=device)
facenet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

recognition_threshold = 0.50
rejection_threshold = 0.30

# ==================== UTILITY FUNCTIONS ====================
def _fixed_image_standardization(x):
    return (x - 0.5) / 0.5

def get_embedding(file: UploadFile):
    file.file.seek(0)
    img = Image.open(file.file).convert("RGB")
    with torch.no_grad():
        face = mtcnn(img)
        if face is None:
            img_resized = img.resize((160,160))
            face = torch.from_numpy(np.array(img_resized)).permute(2,0,1).float()/255.0
            face = _fixed_image_standardization(face)
        if face.ndim == 3:
            face = face.unsqueeze(0)
        face = face.to(device)
        emb = facenet(face)
        emb = emb.squeeze(0).cpu().numpy().astype("float32")
        emb = emb / (np.linalg.norm(emb)+1e-10)
        return emb

def _encode_embedding(embedding: np.ndarray) -> str:
    return base64.b64encode(pickle.dumps(embedding.astype("float32"))).decode("utf-8")

def _decode_embedding(b64: str) -> np.ndarray:
    return pickle.loads(base64.b64decode(b64.encode("utf-8"))).astype("float32")

def cos_sim(a, b):
    a = np.asarray(a, dtype="float32").flatten()
    b = np.asarray(b, dtype="float32").flatten()
    return float(np.dot(a,b))

# ==================== FASTAPI APP ====================
app = FastAPI(title="Face Recognition Dashboard API", version="1.0.0")

# CORS Middleware - Load from environment or use defaults
allowed_origins = os.getenv(
    'ALLOWED_ORIGINS',
    'http://localhost:5000,https://eye-dentify.vercel.app'
).split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

# Include routers
app.include_router(assets_router)
app.include_router(sketches_router)

# Include auth router if it was successfully imported
if auth_router:
    try:
        app.include_router(auth_router)
        print("✓ Auth router included successfully")
    except Exception as e:
        print(f"✗ Error including auth router: {e}")
        import traceback
        traceback.print_exc()
else:
    print("✗ Auth router not included (import failed)")

# ==================== FACE RECOGNITION ROUTES ====================
@app.get("/")
async def root():
    return {"message": "Face Recognition API is running!", "status": "ok"}

@app.post("/add_face")
async def add_face(
    name: str = Form(...),
    age: str = Form(...),
    crime: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        emb = get_embedding(file)
        file.file.seek(0)

        # Upload image to Cloudinary
        upload_res = cloudinary.uploader.upload(file.file, folder="faces", public_id=name)
        image_url = upload_res["secure_url"]

        doc = collection.find_one({"name": name})
        if doc:
            # update existing
            collection.update_one(
                {"_id": doc["_id"]},
                {"$push":{
                    "embeddings": _encode_embedding(emb),
                    "image_urls": image_url
                },
                 "$set":{
                     "age": age,
                     "crime": crime,
                     "description": description
                 }}
            )
        else:
            # insert new
            collection.insert_one({
                "name": name,
                "age": age,
                "crime": crime,
                "description": description,
                "embeddings": [_encode_embedding(emb)],
                "image_urls": [image_url]
            })

        return {"status":"ok","message":f"Face registered for {name}","image_url":image_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/recognize_face")
async def recognize_face(file: UploadFile = File(...)):
    try:
        emb = get_embedding(file)
        faces = list(collection.find())
        if not faces:
            return {"status":"empty_db","message":"No faces stored"}

        best_score = -1
        best_face = None
        for doc in faces:
            for emb_b64, img_url in zip(doc.get("embeddings", []), doc.get("image_urls", [])):
                sim = cos_sim(emb, _decode_embedding(emb_b64))
                if sim > best_score:
                    best_score = sim
                    best_face = {
                        "name": doc["name"],
                        "age": doc.get("age",""),
                        "crime": doc.get("crime",""),
                        "description": doc.get("description",""),
                        "image_url": img_url
                    }

        if best_score >= recognition_threshold:
            return {"status":"recognized","similarity":best_score, **best_face}
        else:
            return {"status":"not_recognized","best_score":best_score}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/gallery")
async def gallery():
    faces_list = []
    for doc in collection.find():
        faces_list.append({
            "name": doc.get("name","Unknown"),
            "age": doc.get("age",""),
            "crime": doc.get("crime",""),
            "description": doc.get("description",""),
            "image_urls": doc.get("image_urls", [])
        })
    return {"faces": faces_list}

@app.post("/clear_db")
async def clear_db():
    collection.delete_many({})
    return {"status":"ok","message":"Database cleared"}

# ==================== ASSET MANAGEMENT ROUTES ====================
@app.get("/assets")
async def get_assets():
    try:
        assets = list(db.assets.find({"is_active": True}))
        return [{"id": str(asset["_id"]), **{k: v for k, v in asset.items() if k != "_id"}} for asset in assets]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/assets/upload")
async def upload_asset(
    name: str = Form(...),
    type: str = Form(...),
    description: str = Form(None),
    tags: str = Form("[]"),
    file: UploadFile = File(...)
):
    try:
        # Validate file type
        allowed_types = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file.file,
            folder=f"forensic-assets/{type}",
            public_id=f"{name.lower().replace(' ', '-')}",
            resource_type="image",
            transformation=[
                {"quality": "auto"},
                {"fetch_format": "auto"}
            ]
        )
        
        # Parse tags
        tags_list = json.loads(tags) if tags else []
        
        # Create asset document
        asset_data = {
            "name": name,
            "type": type,
            "category": type,
            "cloudinary_url": result["secure_url"],
            "cloudinary_public_id": result["public_id"],
            "tags": tags_list,
            "description": description,
            "upload_date": datetime.utcnow(),
            "is_active": True,
            "usage_count": 0,
            "metadata": {
                "width": result["width"],
                "height": result["height"],
                "file_size": result["bytes"],
                "format": result["format"]
            }
        }
        
        # Save to MongoDB
        result = db.assets.insert_one(asset_data)
        asset_data["id"] = str(result.inserted_id)
        
        # Remove ObjectId from response
        if "_id" in asset_data:
            del asset_data["_id"]
        
        return asset_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/assets/{asset_id}")
async def get_asset(asset_id: str):
    try:
        asset = db.assets.find_one({"_id": ObjectId(asset_id)})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        return {"id": str(asset["_id"]), **{k: v for k, v in asset.items() if k != "_id"}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/assets/{asset_id}")
async def delete_asset(asset_id: str):
    try:
        asset = db.assets.find_one({"_id": ObjectId(asset_id)})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Delete from Cloudinary
        cloudinary.uploader.destroy(asset["cloudinary_public_id"])
        
        # Delete from MongoDB
        db.assets.delete_one({"_id": ObjectId(asset_id)})
        
        return {"message": "Asset deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/assets/{asset_id}/usage")
async def increment_usage(asset_id: str):
    try:
        result = db.assets.update_one(
            {"_id": ObjectId(asset_id)},
            {"$inc": {"usage_count": 1}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Asset not found")
        return {"message": "Usage count incremented"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/assets/{asset_id}/name")
async def update_asset_name(asset_id: str, name: str = Form(...)):
    try:
        result = db.assets.update_one(
            {"_id": ObjectId(asset_id)},
            {"$set": {"name": name}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Asset not found")
        return {"message": "Asset name updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== SERVER STARTUP ====================
if __name__ == "__main__":
    import uvicorn
    print("Starting Face Recognition Dashboard API Server...")
    print("Server will be available at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
