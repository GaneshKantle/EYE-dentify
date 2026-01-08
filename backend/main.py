from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pymongo import MongoClient
from contextlib import asynccontextmanager
from typing import Optional
from pathlib import Path
from datetime import datetime
import cloudinary
import cloudinary.uploader
import torch
import pickle
import base64
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
from dotenv import load_dotenv
import os
import gc

# Resolve backend/.env explicitly so we don't pick up the frontend root file
# Load environment variables BEFORE importing routes that depend on them
BASE_DIR = Path(__file__).resolve().parent
DOTENV_PATH = BASE_DIR / ".env"

# Load environment variables with error handling
try:
    if DOTENV_PATH.exists():
        load_dotenv(dotenv_path=DOTENV_PATH)
    else:
        load_dotenv()
except Exception as e:
    print(f"⚠️ Warning: Could not load .env file: {e}")
    print("Continuing with environment variables from system...")

# Now import routes after .env is loaded
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

# Validate required environment variables
REQUIRED_ENV_VARS = [
    "MONGO_URI",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "MOJOAUTH_API_KEY",
    "MOJOAUTH_API_SECRET",
    "MOJOAUTH_BASE_URL",
    "REGISTRATION_SECRET_KEY",
    "RESEND_API_KEY",
    "RESEND_TEST_EMAIL",
]

missing_env = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]
if missing_env:
    missing_str = ", ".join(missing_env)
    raise RuntimeError(
        f"Missing required environment variables: {missing_str}. "
        "Copy backend/env.example to backend/.env and update the placeholders before starting the server."
    )


def _bool_env(key: str, default: str = "false") -> bool:
    """Return boolean environment variables."""
    return os.getenv(key, default).strip().lower() in {"1", "true", "yes", "on"}


def _float_env(key: str, default: float) -> float:
    """Return float environment variables with validation."""
    value = os.getenv(key)
    if value is None:
        return float(default)
    try:
        return float(value)
    except ValueError as exc:
        raise RuntimeError(f"Environment variable {key} must be a float. Got: {value}") from exc


# ---------------- MongoDB ---------------- 
# Use shared database connection from database.py to avoid multiple connection pools
from database import client, db
collection = db["faces"]

# ---------------- Cloudinary ---------------- 
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

# ---------------- FaceNet ---------------- 
# Global variables for ML models (loaded at startup)
device: Optional[torch.device] = None
mtcnn: Optional[MTCNN] = None
facenet: Optional[InceptionResnetV1] = None
models_ready = False
recognition_threshold = _float_env("RECOGNITION_THRESHOLD", 0.50)
rejection_threshold = _float_env("REJECTION_THRESHOLD", 0.30)
# In memory-constrained or cold-start-prone environments (e.g. free tiers),
# loading ML models at startup can make every first request very slow.
# Default to lazy loading unless explicitly overridden via MODEL_AUTO_LOAD.
model_auto_load = _bool_env("MODEL_AUTO_LOAD", "false")

# ---------------- Utils ----------------
def _fixed_image_standardization(x):
    return (x - 0.5) / 0.5


def _load_models():
    """Load ML models synchronously with memory optimisations."""
    global device, mtcnn, facenet, models_ready

    if models_ready and mtcnn is not None and facenet is not None:
        return

    print("📦 Initialising ML models...")

    try:
        device = torch.device("cpu")
        print(f"🔧 Using device: {device}")

        torch.set_num_threads(1)
        if hasattr(torch, "set_num_interop_threads"):
            torch.set_num_interop_threads(1)

        os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "max_split_size_mb:128"

        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        print("📥 Loading MTCNN model...")
        mtcnn_local = MTCNN(
            image_size=160,
            margin=0,
            min_face_size=20,
            keep_all=False,
            post_process=True,
            device=device,
        )
        print("✓ MTCNN model loaded")

        gc.collect()

        print("📥 Loading FaceNet model...")
        facenet_local = InceptionResnetV1(pretrained="vggface2").eval()
        facenet_local = facenet_local.to(device)
        facenet_local.requires_grad_(False)
        print("✓ FaceNet model loaded")

        mtcnn = mtcnn_local
        facenet = facenet_local
        models_ready = True
        print("✅ ML models initialised successfully")

    except MemoryError as e:
        print(f"❌ Out of memory while loading ML models: {e}")
        print("💡 Tip: Consider upgrading to a higher memory tier or using model quantization")
        import traceback
        traceback.print_exc()
        mtcnn = None
        facenet = None
        models_ready = False
    except Exception as e:
        print(f"❌ Error loading ML models: {e}")
        import traceback
        traceback.print_exc()
        mtcnn = None
        facenet = None
        models_ready = False


def get_embedding(file: UploadFile):
    """Get face embedding from uploaded image with memory cleanup and optimized image processing"""
    if mtcnn is None or facenet is None or not models_ready:
        _load_models()
    if mtcnn is None or facenet is None or not models_ready:
        raise HTTPException(status_code=503, detail="ML models not loaded yet. Please wait and try again.")
    
    img = None
    face = None
    emb = None
    try:
        file.file.seek(0)
        img = Image.open(file.file).convert("RGB")
        
        # Optimize: Resize large images early to reduce memory and processing time
        # FaceNet works on 160x160, so we can safely resize to max 800x800 before processing
        max_dimension = max(img.width, img.height)
        if max_dimension > 800:
            ratio = 800 / max_dimension
            new_width = int(img.width * ratio)
            new_height = int(img.height * ratio)
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        with torch.no_grad():
            face = mtcnn(img)
            if face is None:
                # If MTCNN fails, resize to 160x160 for direct processing
                img_resized = img.resize((160, 160), Image.Resampling.LANCZOS)
                face = torch.from_numpy(np.array(img_resized)).permute(2,0,1).float()/255.0
                face = _fixed_image_standardization(face)
            if face.ndim == 3:
                face = face.unsqueeze(0)
            face = face.to(device)
            emb = facenet(face)
            emb = emb.squeeze(0).cpu().numpy().astype("float32")
            emb = emb / (np.linalg.norm(emb)+1e-10)
            result = emb.copy()  # Create a copy to return
            return result
    finally:
        # Explicit memory cleanup
        if img is not None:
            img.close()
        if face is not None:
            del face
        if emb is not None:
            del emb
        # Force garbage collection after image processing
        gc.collect()

def _encode_embedding(embedding: np.ndarray) -> str:
    return base64.b64encode(pickle.dumps(embedding.astype("float32"))).decode("utf-8")

def _decode_embedding(b64: str) -> np.ndarray:
    return pickle.loads(base64.b64decode(b64.encode("utf-8"))).astype("float32")

def cos_sim(a, b):
    """Optimized cosine similarity using vectorized operations"""
    a = np.asarray(a, dtype="float32").flatten()
    b = np.asarray(b, dtype="float32").flatten()
    return float(np.dot(a,b))

def cos_sim_batch(query_emb: np.ndarray, embeddings: np.ndarray) -> np.ndarray:
    """Vectorized batch cosine similarity calculation - much faster for multiple comparisons"""
    query_emb = np.asarray(query_emb, dtype="float32").flatten()
    embeddings = np.asarray(embeddings, dtype="float32")
    if embeddings.ndim == 1:
        embeddings = embeddings.reshape(1, -1)
    # Normalize embeddings if needed (they should already be normalized)
    return np.dot(embeddings, query_emb).astype("float32")

# ---------------- Application Lifespan ---------------- 
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models at startup with memory optimization"""
    global device, mtcnn, facenet, models_ready
    
    print("🚀 Starting application...")
    if model_auto_load:
        print("📦 Loading ML models at startup (MODEL_AUTO_LOAD=true)...")
        _load_models()
    else:
        print("⏳ MODEL_AUTO_LOAD=false. Models will be loaded on first request.")
    
    print("✅ Application startup complete!")
    
    yield
    
    print("🛑 Shutting down application...")
    # Cleanup models on shutdown
    if mtcnn is not None:
        del mtcnn
    if facenet is not None:
        del facenet
    mtcnn = None
    facenet = None
    device = None
    models_ready = False
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
        
        # Add CORS headers as backup if not already set by CORSMiddleware
        # This ensures CORS works even if there's a configuration issue
        environment = os.getenv('ENVIRONMENT', 'development')
        if origin and origin != "No origin":
            # Check if CORS headers are missing (shouldn't happen, but safety net)
            if "Access-Control-Allow-Origin" not in response.headers:
                # For development: allow localhost origins
                if environment == 'development':
                    if origin.startswith('http://localhost:') or origin.startswith('http://127.0.0.1:'):
                        response.headers["Access-Control-Allow-Origin"] = origin
                        response.headers["Access-Control-Allow-Credentials"] = "true"
                        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
                        response.headers["Access-Control-Allow-Headers"] = "*"
                        response.headers["Access-Control-Expose-Headers"] = "*"
                # For production: check if origin is in allowed list or allow common patterns
                else:
                    # Get allowed origins from environment or use defaults
                    allowed_origins_env = os.getenv('ALLOWED_ORIGINS', '')
                    if allowed_origins_env:
                        allowed_origins_list = [o.strip() for o in allowed_origins_env.split(',') if o.strip()]
                    else:
                        # Default production origins - include common deployment platforms
                        allowed_origins_list = [
                            'https://eye-dentify.vercel.app',
                            'https://eye-dentify.onrender.com',
                            'http://localhost:3000',
                            'http://localhost:5000',
                            'http://localhost:5173',
                        ]
                    
                    # If origin matches allowed origins or is localhost, add CORS headers
                    if origin in allowed_origins_list or origin.startswith('http://localhost:') or origin.startswith('http://127.0.0.1:'):
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
    # Default: Allow common localhost origins for development + production domains
    allowed_origins = [
        'https://eye-dentify.vercel.app',
        'https://eye-dentify.onrender.com',  # Add Render deployment URL
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

# Add memory cleanup middleware to prevent memory leaks
from middleware.memory import MemoryCleanupMiddleware
app.add_middleware(MemoryCleanupMiddleware, gc_interval=10)  # Run GC every 10 requests

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
    age: str = Form(""),
    crime: str = Form(""),
    description: str = Form(""),
    file: UploadFile = File(...)
):
    # Validate required fields
    if not name or not name.strip():
        raise HTTPException(status_code=400, detail="Name is required and cannot be empty")
    
    emb = None
    try:
        emb = get_embedding(file)
        file.file.seek(0)

        # Upload image to Cloudinary
        upload_res = cloudinary.uploader.upload(file.file, folder="faces", public_id=name)
        image_url = upload_res["secure_url"]

        encoded_emb = _encode_embedding(emb)
        del emb  # Clean up embedding after encoding
        
        doc = collection.find_one({"name": name})
        if doc:
            # update existing
            collection.update_one(
                {"_id": doc["_id"]},
                {"$push":{
                    "embeddings": encoded_emb,
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
                "embeddings": [encoded_emb],
                "image_urls": [image_url]
            })

        return {"status":"ok","message":f"Face registered for {name}","image_url":image_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        # Cleanup and force garbage collection
        if emb is not None:
            del emb
        gc.collect()

@app.post("/recognize_face")
async def recognize_face(file: UploadFile = File(...)):
    """
    Optimized face recognition with:
    - Early exit on high-confidence matches (>0.90)
    - Batch processing for embeddings from same person
    - Vectorized similarity calculations
    - Memory-efficient cursor iteration
    """
    emb = None
    try:
        emb = get_embedding(file)
        
        # High confidence threshold for early exit (very confident matches)
        HIGH_CONFIDENCE_THRESHOLD = 0.90
        
        # Use cursor iteration instead of loading all faces into memory
        cursor = collection.find({}, {"name": 1, "age": 1, "crime": 1, "description": 1, "embeddings": 1, "image_urls": 1})
        
        best_score = -1
        best_face = None
        
        # Process one document at a time to minimize memory usage
        for doc in cursor:
            embeddings_list = doc.get("embeddings", [])
            image_urls_list = doc.get("image_urls", [])
            
            # Optimize: Batch process embeddings for same person when possible
            if len(embeddings_list) > 1:
                # Decode all embeddings for this person at once
                decoded_embs = np.array([_decode_embedding(emb_b64) for emb_b64 in embeddings_list])
                
                # Vectorized batch similarity calculation (much faster)
                similarities = cos_sim_batch(emb, decoded_embs)
                
                # Find best match for this person
                best_idx = int(np.argmax(similarities))
                max_sim = float(similarities[best_idx])
                
                if max_sim > best_score:
                    best_score = max_sim
                    best_face = {
                        "name": doc["name"],
                        "age": doc.get("age",""),
                        "crime": doc.get("crime",""),
                        "description": doc.get("description",""),
                        "image_url": image_urls_list[best_idx] if best_idx < len(image_urls_list) else image_urls_list[0]
                    }
                
                # Clean up
                del decoded_embs, similarities
                
                # Early exit: If we found a very high confidence match, return immediately
                if best_score >= HIGH_CONFIDENCE_THRESHOLD:
                    cursor.close()
                    return {"status":"recognized","similarity":best_score, **best_face}
            else:
                # Single embedding - use optimized single comparison
                if embeddings_list:
                    decoded_emb = _decode_embedding(embeddings_list[0])
                    sim = cos_sim(emb, decoded_emb)
                    del decoded_emb
                    
                    if sim > best_score:
                        best_score = sim
                        best_face = {
                            "name": doc["name"],
                            "age": doc.get("age",""),
                            "crime": doc.get("crime",""),
                            "description": doc.get("description",""),
                            "image_url": image_urls_list[0] if image_urls_list else ""
                        }
                    
                    # Early exit for high confidence
                    if best_score >= HIGH_CONFIDENCE_THRESHOLD:
                        cursor.close()
                        return {"status":"recognized","similarity":best_score, **best_face}
            
            # Clean up document data after processing
            del embeddings_list, image_urls_list
        
        # Clean up cursor
        cursor.close()
        
        if best_score >= recognition_threshold:
            return {"status":"recognized","similarity":best_score, **best_face}
        else:
            return {"status":"not_recognized","best_score":best_score}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        # Cleanup embedding and force garbage collection
        if emb is not None:
            del emb
        gc.collect()

@app.get("/gallery")
async def gallery():
    """Get gallery with projection to exclude large embeddings field"""
    faces_list = []
    # Use projection to exclude embeddings (large field) to save memory
    cursor = collection.find({}, {"name": 1, "age": 1, "crime": 1, "description": 1, "image_urls": 1})
    try:
        for doc in cursor:
            faces_list.append({
                "name": doc.get("name","Unknown"),
                "age": doc.get("age",""),
                "crime": doc.get("crime",""),
                "description": doc.get("description",""),
                "image_urls": doc.get("image_urls", [])
            })
    finally:
        cursor.close()
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
    finally:
        # Cleanup file handle and force garbage collection
        if hasattr(file, 'file'):
            file.file.close()
        gc.collect()

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
    """Health check endpoint with MongoDB connection verification"""
    try:
        # Verify MongoDB connection
        client.admin.command('ping')
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }

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