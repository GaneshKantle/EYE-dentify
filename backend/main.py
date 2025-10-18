from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pymongo import MongoClient
import gridfs, pickle, base64, io, torch
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import numpy as np
from bson import ObjectId

# ---------------- MongoDB Atlas ----------------
MONGO_URI = "mongodb+srv://MANJU-A-R:Atlas%401708@cluster0.w3p8plb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["face_recognition_db"]
collection = db["faces"]
fs = gridfs.GridFS(db)

# ---------------- FaceNet ----------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
mtcnn = MTCNN(image_size=160, margin=0, min_face_size=20, keep_all=False, post_process=True, device=device)
facenet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

RECOGNITION_THRESHOLD = 0.50
REJECTION_THRESHOLD = 0.3

# ---------------- FastAPI ----------------
app = FastAPI()
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"]
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
async def register_face(name: str = Form(...), file: UploadFile = File(...)):
    try:
        emb = get_embedding(file)
        file.file.seek(0)
        image_id = fs.put(file.file.read(), filename=name)

        doc = collection.find_one({"name": name})
        if doc:
            embeddings = doc.get("embeddings", [])
            embeddings.append(encode_embedding(emb))
            image_ids = doc.get("image_ids", [])
            image_ids.append(image_id)
            collection.update_one({"_id": doc["_id"]}, {"$set": {"embeddings": embeddings, "image_ids": image_ids}})
        else:
            collection.insert_one({
                "name": name,
                "embeddings": [encode_embedding(emb)],
                "image_ids": [image_id]
            })
        return {"status": "ok", "message": f"Face registered for {name}"}
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

        for doc in faces:
            for emb_b64, img_id in zip(doc.get("embeddings", []), doc.get("image_ids", [])):
                sim = cos_sim(emb, decode_embedding(emb_b64))
                if sim > best_score:
                    best_score = sim
                    best_name = doc["name"]
                    best_image_id = img_id

        return {
            "best_score": best_score,
            "best_name": best_name,
            "matched_image_id": str(best_image_id) if best_image_id else None,
            "recognized": best_score >= RECOGNITION_THRESHOLD
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/faces")
async def list_faces():
    faces_list = []
    for doc in collection.find():
        faces_list.append({
            "name": doc.get("name", "Unknown"),
            "image_id": str(doc.get("image_ids")[0]) if doc.get("image_ids") else None
        })
    return faces_list

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

@app.post("/api/clear")
async def clear_db():
    collection.delete_many({})
    for f in fs.find():
        fs.delete(f._id)
    return {"status":"ok","message":"Database cleared"}
