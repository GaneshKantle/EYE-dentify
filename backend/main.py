from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import cloudinary
import cloudinary.uploader
import torch, pickle, base64, numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image

# ---------------- MongoDB ----------------
MONGO_URI = "mongodb+srv://MANJU-A-R:Atlas%401708@cluster0.w3p8plb.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["face_recognition_db"]
collection = db["faces"]

# ---------------- Cloudinary ----------------
cloudinary.config(
    cloud_name="dqkhdusc4",
    api_key="249697193332389",
    api_secret="iiN3cjMrzMXGKQew61kAH5lIIXE"
)

# ---------------- FaceNet ----------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
mtcnn = MTCNN(image_size=160, margin=0, min_face_size=20, keep_all=False, post_process=True, device=device)
facenet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

recognition_threshold = 0.50
rejection_threshold = 0.30

# ---------------- Utils ----------------
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

# ---------------- FastAPI ----------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

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
    return {"status":"ok","message":"Database cleared"}
