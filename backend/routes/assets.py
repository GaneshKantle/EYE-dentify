from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from models.asset import AssetResponse
from services.cloudinary_service import CloudinaryService
from datetime import datetime
from bson import ObjectId
import json
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
DOTENV_PATH = BACKEND_DIR / ".env"

if DOTENV_PATH.exists():
    load_dotenv(dotenv_path=DOTENV_PATH)
else:
    load_dotenv()


# Database connection - use shared client from database.py to avoid multiple connection pools
# This reduces memory usage by reusing a single connection pool
from database import client, db

router = APIRouter(prefix="/assets", tags=["assets"])
cloudinary_service = CloudinaryService()

@router.post("/upload", response_model=AssetResponse)
async def upload_asset(
    name: str = Form(...),
    type: str = Form(...),
    description: str = Form(None),
    tags: str = Form("[]"),  # JSON string
    file: UploadFile = File(...)
):
    try:
        # Validate file type
        allowed_types = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        try:
            # Upload to Cloudinary
            cloudinary_result = await cloudinary_service.upload_asset(file.file, type, name)
            
            # Parse tags
            tags_list = json.loads(tags) if tags else []
            
            # Create asset document
            asset_data = {
                "name": name,
                "type": type,
                "category": type,  # Same as type for simplicity
                "cloudinary_url": cloudinary_result["url"],
                "cloudinary_public_id": cloudinary_result["public_id"],
                "tags": tags_list,
                "description": description,
                "upload_date": datetime.utcnow(),
                "is_active": True,
                "usage_count": 0,
                "metadata": {
                    "width": cloudinary_result["width"],
                    "height": cloudinary_result["height"],
                    "file_size": cloudinary_result["file_size"],
                    "format": cloudinary_result["format"]
                }
            }
            
            # Save to MongoDB
            result = db.assets.insert_one(asset_data)
            return AssetResponse(**{**asset_data, "id": str(result.inserted_id)})
        finally:
            # Cleanup file handle and force garbage collection
            if hasattr(file, 'file'):
                file.file.close()
            gc.collect()
        
    except Exception as e:
        print(f"❌ Asset upload failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[AssetResponse])
async def get_assets(type: Optional[str] = None):
    try:
        query = {"is_active": True}
        if type:
            query["type"] = type
            
        assets = list(db.assets.find(query))
        return [
            AssetResponse(**{
                **{k: v for k, v in asset.items() if k != "_id"},
                "id": str(asset["_id"])
            })
            for asset in assets
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(asset_id: str):
    try:
        asset = db.assets.find_one({"_id": ObjectId(asset_id)})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        return AssetResponse(**{
            **{k: v for k, v in asset.items() if k != "_id"},
            "id": str(asset["_id"])
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):
    try:
        asset = db.assets.find_one({"_id": ObjectId(asset_id)})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Delete from Cloudinary
        await cloudinary_service.delete_asset(asset["cloudinary_public_id"])
        
        # Delete from MongoDB
        db.assets.delete_one({"_id": ObjectId(asset_id)})
        
        return {"message": "Asset deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{asset_id}/usage")
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
