from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pymongo import MongoClient
import gridfs, pickle, base64, io, torch
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import numpy as np
from bson import ObjectId
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------- MongoDB Atlas ----------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://MANJU-A-R:Atlas%401708@cluster0.w3p8plb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DATABASE_NAME = os.getenv("DATABASE_NAME", "face_recognition_db")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "faces")

try:
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    fs = gridfs.GridFS(db)
    logger.info("Successfully connected to MongoDB")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise

# ---------------- FaceNet ----------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
mtcnn = MTCNN(image_size=160, margin=0, min_face_size=20, keep_all=False, post_process=True, device=device)
facenet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

RECOGNITION_THRESHOLD = float(os.getenv("RECOGNITION_THRESHOLD", "0.50"))
REJECTION_THRESHOLD = float(os.getenv("REJECTION_THRESHOLD", "0.3"))

# ---------------- FastAPI ----------------
app = FastAPI(
    title="Face Recognition API",
    description="Production API for Face Recognition Dashboard",
    version="1.0.0"
)

# Get allowed origins from environment
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in allowed_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ---------------- Utils ----------------
def preprocess(img: Image.Image):
    face = mtcnn(img)
    if face is None:
        raise HTTPException(status_code=400, detail="No face detected. Please upload a clear frontal photo.")
    if face.ndim == 3:
        face = face.unsqueeze(0)
    return face.to(device)

def get_embedding(img_file: UploadFile):
    img = Image.open(img_file.file).convert("RGB")
    with torch.no_grad():
        face_tensor = preprocess(img)
        emb = facenet(face_tensor)
        emb = emb.squeeze(0).cpu().numpy().astype("float32")
        emb = emb / (np.linalg.norm(emb)+1e-10)
        return emb

def encode_embedding(emb: np.ndarray):
    return base64.b64encode(pickle.dumps(emb)).decode("utf-8")

def decode_embedding(b64: str):
    return pickle.loads(base64.b64decode(b64.encode("utf-8"))).astype("float32")

def cos_sim(a, b):
    a = np.asarray(a, dtype="float32").flatten()
    b = np.asarray(b, dtype="float32").flatten()
    return float(np.dot(a,b))

# ---------------- Routes ----------------
@app.post("/api/register")
async def register_face(
    name: str = Form(...), 
    file: UploadFile = File(...),
    full_name: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    crime: str = Form(...),
    description: str = Form(...),
    status: str = Form(...)
):
    try:
        print(f"Received registration data: name={name}, full_name={full_name}, age={age}, gender={gender}, crime={crime}, status={status}")
        emb = get_embedding(file)
        file.file.seek(0)
        image_id = fs.put(file.file.read(), filename=name)

        doc = collection.find_one({"name": name})
        if doc:
            embeddings = doc.get("embeddings", [])
            embeddings.append(encode_embedding(emb))
            image_ids = doc.get("image_ids", [])
            image_ids.append(image_id)
            collection.update_one({"_id": doc["_id"]}, {
                "$set": {
                    "embeddings": embeddings, 
                    "image_ids": image_ids,
                    "full_name": full_name,
                    "age": age,
                    "gender": gender,
                    "crime": crime,
                    "description": description,
                    "status": status
                }
            })
        else:
            collection.insert_one({
                "name": name,
                "full_name": full_name,
                "age": age,
                "gender": gender,
                "crime": crime,
                "description": description,
                "status": status,
                "embeddings": [encode_embedding(emb)],
                "image_ids": [image_id]
            })
        return {"status": "ok", "message": f"Criminal record registered for {full_name}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/recognize")
async def recognize_face(file: UploadFile = File(...)):
    try:
        emb = get_embedding(file)
        faces = list(collection.find())
        if not faces:
            return {"status":"empty_db","message":"No faces stored"}

        best_score = -1
        best_name = None
        best_image_id = None
        best_doc = None

        for doc in faces:
            for emb_b64, img_id in zip(doc.get("embeddings", []), doc.get("image_ids", [])):
                sim = cos_sim(emb, decode_embedding(emb_b64))
                if sim > best_score:
                    best_score = sim
                    best_name = doc["name"]
                    best_image_id = img_id
                    best_doc = doc

        # Prepare criminal details
        criminal_details = {}
        if best_doc:
            criminal_details = {
                "full_name": best_doc.get("full_name", best_doc.get("name", "Unknown")),
                "age": best_doc.get("age", "N/A"),
                "gender": best_doc.get("gender", "N/A"),
                "crime": best_doc.get("crime", "N/A"),
                "description": best_doc.get("description", "No description available"),
                "status": best_doc.get("status", "Unknown")
            }

        return {
            "best_score": best_score,
            "best_name": best_name,
            "matched_image_id": str(best_image_id) if best_image_id else None,
            "recognized": best_score >= RECOGNITION_THRESHOLD,
            **criminal_details
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/faces")
async def list_faces():
    faces_list = []
    for doc in collection.find():
        # Check if this is an old record without criminal data
        has_criminal_data = any(key in doc for key in ["full_name", "age", "gender", "crime", "status"])
        
        if has_criminal_data:
            # New record with criminal data
            face_data = {
                "name": doc.get("name", "Unknown"),
                "full_name": doc.get("full_name", "Unknown"),
                "age": doc.get("age", 0),
                "gender": doc.get("gender", "Unknown"),
                "crime": doc.get("crime", "Unknown"),
                "description": doc.get("description", ""),
                "status": doc.get("status", "Unknown"),
                "image_id": str(doc.get("image_ids")[0]) if doc.get("image_ids") else None
            }
        else:
            # Old record without criminal data - show as legacy record
            face_data = {
                "name": doc.get("name", "Unknown"),
                "full_name": doc.get("name", "Unknown"),  # Use name as full_name for old records
                "age": "N/A",
                "gender": "N/A", 
                "crime": "N/A",
                "description": "Legacy record - no criminal data available",
                "status": "Unknown",
                "image_id": str(doc.get("image_ids")[0]) if doc.get("image_ids") else None
            }
        
        print(f"Returning face data: {face_data}")
        faces_list.append(face_data)
    print(f"Total faces returned: {len(faces_list)}")
    return faces_list

@app.get("/api/debug")
async def debug_database():
    """Debug endpoint to check database contents"""
    try:
        docs = list(collection.find())
        return {
            "total_documents": len(docs),
            "documents": docs
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/image/{image_id}")
async def get_image(image_id: str):
    try:
        data = fs.get(ObjectId(image_id)).read()
        return StreamingResponse(io.BytesIO(data), media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.delete("/api/delete/{name}")
async def delete_face(name: str):
    doc = collection.find_one({"name": name})
    if not doc:
        raise HTTPException(status_code=404, detail="Face not found")
    try:
        for img_id in doc.get("image_ids", []):
            fs.delete(img_id)
    except:
        pass
    collection.delete_one({"name": name})
    return {"status":"ok","message":f"{name} deleted"}

@app.put("/api/update/{name}")
async def update_criminal_record(
    name: str,
    full_name: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    crime: str = Form(...),
    description: str = Form(...),
    status: str = Form(...)
):
    try:
        doc = collection.find_one({"name": name})
        if not doc:
            raise HTTPException(status_code=404, detail="Criminal record not found")
        
        collection.update_one({"_id": doc["_id"]}, {
            "$set": {
                "full_name": full_name,
                "age": age,
                "gender": gender,
                "crime": crime,
                "description": description,
                "status": status
            }
        })
        return {"status": "ok", "message": f"Criminal record updated for {full_name}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/criminal-database")
async def get_criminal_database():
    criminals_list = []
    for doc in collection.find():
        criminals_list.append({
            "id": str(doc["_id"]),
            "name": doc.get("name", "Unknown"),
            "full_name": doc.get("full_name", "Unknown"),
            "age": doc.get("age", 0),
            "gender": doc.get("gender", "Unknown"),
            "crime": doc.get("crime", "Unknown"),
            "description": doc.get("description", ""),
            "status": doc.get("status", "Unknown"),
            "image_id": str(doc.get("image_ids")[0]) if doc.get("image_ids") else None
        })
    return criminals_list

@app.post("/api/clear")
async def clear_db():
    collection.delete_many({})
    for f in fs.find():
        fs.delete(f._id)
    return {"status":"ok","message":"Database cleared"}

@app.get("/health")
async def health_check():
    """Health check endpoint for production monitoring"""
    try:
        # Test database connection
        client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "environment": os.getenv("ENVIRONMENT", "development")
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Face Recognition API",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(
        app, 
        host=host, 
        port=port,
        log_level="info"
    )