from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from pymongo import MongoClient
from contextlib import asynccontextmanager
import cloudinary
import cloudinary.uploader
import torch, pickle, base64, numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
from dotenv import load_dotenv
import os
import gc
from routes.assets import router as assets_router
from routes.sketches import router as sketches_router

# Import auth router with error handling
print("🔍 Attempting to import auth router...")
auth_router = None
try:
    from routes.auth import router as auth_router
    print("✓ Auth router imported successfully")
    print(f"✓ Router object: {auth_router}")
    print(f"✓ Router prefix: {auth_router.prefix if auth_router else 'None'}")
    print(f"✓ Router routes count: {len(auth_router.routes) if auth_router else 0}")
except ImportError as e:
    print(f"✗ ImportError importing auth router: {e}")
    import traceback
    traceback.print_exc()
    auth_router = None
except Exception as e:
    print(f"✗ Failed to import auth router: {e}")
    import traceback
    traceback.print_exc()
    auth_router = None

# Load environment variables with error handling
try:
    load_dotenv()
except Exception as e:
    print(f"⚠️ Warning: Could not load .env file: {e}")
    print("Continuing with environment variables from system...")

# ---------------- MongoDB ---------------- 
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://MANJU-A-R:Atlas%401708@cluster0.w3p8plb.mongodb.net/?retryWrites=true&w=majority"
)
client = MongoClient(MONGO_URI)
db = client["face_recognition_db"]
collection = db["faces"]

# ---------------- Cloudinary ---------------- 
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "dqkhdusc4"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "249697193332389"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "iiN3cjMrzMXGKQew61kAH5lIIXE")
)

# ---------------- FaceNet ---------------- 
# Global variables for ML models (loaded at startup)
device = None
mtcnn = None
facenet = None
recognition_threshold = 0.50
rejection_threshold = 0.30

# ---------------- Utils ----------------
def _fixed_image_standardization(x):
    return (x - 0.5) / 0.5

def get_embedding(file: UploadFile):
    """Get face embedding from uploaded image"""
    if mtcnn is None or facenet is None:
        raise HTTPException(status_code=503, detail="ML models not loaded yet. Please wait and try again.")
    
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

# ---------------- Application Lifespan ---------------- 
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models at startup with memory optimization"""
    global device, mtcnn, facenet
    
    print("🚀 Starting application...")
    print("📦 Loading ML models (this may take a moment)...")
    
    try:
        # Force CPU mode to reduce memory usage on Render
        # CUDA is not available on Render's free tier anyway
        device = torch.device("cpu")
        print(f"🔧 Using device: {device}")
        
        # Optimize PyTorch memory usage
        torch.set_num_threads(1)  # Limit threads to reduce memory
        if hasattr(torch, 'set_num_interop_threads'):
            torch.set_num_interop_threads(1)
        
        # Enable memory-efficient settings
        os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'max_split_size_mb:128'
        
        # Clear any existing cache
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        print("📥 Loading MTCNN model...")
        # Load MTCNN with minimal memory footprint
        mtcnn = MTCNN(
            image_size=160, 
            margin=0, 
            min_face_size=20, 
            keep_all=False, 
            post_process=True, 
            device=device
        )
        print("✓ MTCNN model loaded")
        
        # Force garbage collection before loading next model
        gc.collect()
        
        print("📥 Loading FaceNet model...")
        # Load FaceNet model with memory optimization
        facenet = InceptionResnetV1(pretrained='vggface2').eval()
        facenet = facenet.to(device)
        
        # Set model to evaluation mode and disable gradient computation
        facenet.requires_grad_(False)
        
        # Final garbage collection
        gc.collect()
        
        print("✓ FaceNet model loaded")
        print("✅ ML models loaded successfully!")
        
    except MemoryError as e:
        print(f"❌ Out of memory while loading ML models: {e}")
        print("💡 Tip: Consider upgrading to a higher memory tier or using model quantization")
        import traceback
        traceback.print_exc()
        # Clear variables on error
        mtcnn = None
        facenet = None
    except Exception as e:
        print(f"❌ Error loading ML models: {e}")
        import traceback
        traceback.print_exc()
        # Clear variables on error
        mtcnn = None
        facenet = None
    
    print("✅ Application startup complete!")
    
    yield
    
    print("🛑 Shutting down application...")
    # Cleanup models on shutdown
    if mtcnn is not None:
        del mtcnn
    if facenet is not None:
        del facenet
    gc.collect()
    print("✅ Cleanup complete")

# ---------------- FastAPI ---------------- 
app = FastAPI(title="Face Recognition Dashboard API", version="1.0.0", lifespan=lifespan)

# CORS logging middleware for debugging
class CORSLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "No origin")
        method = request.method
        path = request.url.path
        
        # Log CORS requests
        if method == "OPTIONS" or origin != "No origin":
            print(f"🌐 CORS Request: {method} {path} from origin: {origin}")
        
        # Let CORSMiddleware handle OPTIONS requests - just pass through
        response = await call_next(request)
        
        # Add CORS headers for localhost origins in development (as backup)
        # CORSMiddleware should handle this, but this ensures it works
        environment = os.getenv('ENVIRONMENT', 'development')
        if environment == 'development' and origin and origin != "No origin":
            if origin.startswith('http://localhost:') or origin.startswith('http://127.0.0.1:'):
                # Only add if not already set by CORSMiddleware
                if "Access-Control-Allow-Origin" not in response.headers:
                    response.headers["Access-Control-Allow-Origin"] = origin
                    response.headers["Access-Control-Allow-Credentials"] = "true"
                    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
                    response.headers["Access-Control-Allow-Headers"] = "*"
                    response.headers["Access-Control-Expose-Headers"] = "*"
        
        return response

# CORS Configuration - Load from environment or use defaults
# Supports both production domains and localhost for development
allowed_origins_env = os.getenv('ALLOWED_ORIGINS', '')
environment = os.getenv('ENVIRONMENT', 'development')

if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(',') if origin.strip()]
else:
    # Default: Allow common localhost origins for development + production domain
    allowed_origins = [
        'https://eye-dentify.vercel.app',
        'http://localhost:3000',
        'http://localhost:5000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5000',
        'http://127.0.0.1:5173',
    ]
    # In development, add more common ports and allow all localhost origins
    if environment == 'development':
        # Add common development ports
        for port in [3001, 3002, 5174, 5175, 8080, 8081, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 5001, 5002, 5003, 5004, 5005]:
            allowed_origins.extend([
                f'http://localhost:{port}',
                f'http://127.0.0.1:{port}'
            ])
        print("⚠️  Development mode: CORS allows localhost origins")

print(f"🌐 CORS allowed origins: {allowed_origins}")

# Add CORS middleware FIRST - it needs to handle OPTIONS requests before other middleware
# FastAPI's CORSMiddleware automatically handles OPTIONS requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600  # Cache preflight requests for 1 hour
)

# Add CORS logging middleware AFTER CORSMiddleware (for logging only)
app.add_middleware(CORSLoggingMiddleware)

# Include routes
app.include_router(assets_router)
app.include_router(sketches_router)

# Include auth router if it was successfully imported
print(f"🔍 Checking if auth router exists: {auth_router is not None}")
if auth_router:
    try:
        print(f"🔍 Including auth router with prefix: {auth_router.prefix}")
        app.include_router(auth_router)
        print("✓ Auth router included successfully")
        print(f"✓ Auth router prefix: {auth_router.prefix}")
        # Debug: Print registered routes with methods
        print(f"✓ Router has {len(auth_router.routes)} routes")
        for route in auth_router.routes:
            if hasattr(route, 'path') and hasattr(route, 'methods'):
                full_path = f"{auth_router.prefix}{route.path}" if route.path != "/" else auth_router.prefix
                print(f"  - {list(route.methods)} {full_path}")
    except Exception as e:
        print(f"✗ Error including auth router: {e}")
        import traceback
        traceback.print_exc()
else:
    print("✗ Auth router not included (import failed or router is None)")
    print("⚠️  WARNING: Auth routes will not be available!")
    print("⚠️  Check the import error above to see why the router wasn't imported")

# ---------------- Routes ----------------
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
    return {"status": "ok", "message": "Database cleared"}

# ---------------- CRUD for faces ----------------
@app.patch("/face/{name}")
async def update_face(name: str, payload: dict = Body(...)):
    try:
        allowed_fields = {"name", "age", "crime", "description"}
        update_fields = {k: v for k, v in payload.items() if k in allowed_fields}
        if not update_fields:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        result = collection.update_one({"name": name}, {"$set": update_fields})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Face not found")
        return {"status": "ok", "message": "Face updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/face/{name}")
async def delete_face(name: str):
    try:
        result = collection.delete_one({"name": name})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Face not found")
        return {"status": "ok", "message": "Face deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/face/{name}/image")
async def replace_primary_image(name: str, file: UploadFile = File(...)):
    try:
        # Upload image to Cloudinary
        upload_res = cloudinary.uploader.upload(file.file, folder="faces", public_id=name)
        image_url = upload_res["secure_url"]

        doc = collection.find_one({"name": name})
        if not doc:
            raise HTTPException(status_code=404, detail="Face not found")

        # Replace primary image (index 0)
        if doc.get("image_urls"):
            collection.update_one({"_id": doc["_id"]}, {"$set": {"image_urls.0": image_url}})
        else:
            collection.update_one({"_id": doc["_id"]}, {"$set": {"image_urls": [image_url]}})

        return {"status": "ok", "image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Face Recognition Dashboard API",
        "status": "operational",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/debug/routes")
async def debug_routes():
    """Debug endpoint to list all registered routes"""
    routes = []
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            routes.append({
                "path": route.path,
                "methods": list(route.methods) if hasattr(route, 'methods') else []
            })
    return {"routes": routes}

# ---------------- Server Startup ---------------- 
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )