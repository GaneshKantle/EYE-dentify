from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from models.asset import AssetResponse, AssetMetadata
from services.cloudinary_service import CloudinaryService
from datetime import datetime
from bson import ObjectId
import json
import os
import gc
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
        # Validate name
        if not name or not name.strip():
            raise HTTPException(status_code=422, detail="Asset name is required and cannot be empty")
        
        # Validate asset type
        allowed_asset_types = ['face-shapes', 'eyes', 'noses', 'mouths', 'hair', 'accessories', 'eyebrows', 'nose', 'lips', 'facial-hair', 'ears', 'neck']
        if type not in allowed_asset_types:
            raise HTTPException(
                status_code=422, 
                detail=f"Invalid asset type '{type}'. Allowed types: {', '.join(allowed_asset_types)}"
            )
        
        # Validate file type
        allowed_file_types = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
        if not file.content_type or file.content_type not in allowed_file_types:
            raise HTTPException(status_code=400, detail="Invalid file type. Allowed types: PNG, JPEG, JPG, GIF, WebP")
        
        try:
            # Upload to Cloudinary
            cloudinary_result = await cloudinary_service.upload_asset(file.file, type, name)
            
            # Validate Cloudinary response has required fields
            required_fields = ["url", "public_id", "width", "height", "file_size", "format"]
            missing_fields = [field for field in required_fields if field not in cloudinary_result]
            if missing_fields:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Cloudinary upload incomplete. Missing fields: {', '.join(missing_fields)}"
                )
            
            # Parse tags with error handling
            try:
                tags_list = json.loads(tags) if tags and tags.strip() else []
                if not isinstance(tags_list, list):
                    tags_list = []
            except (json.JSONDecodeError, ValueError):
                tags_list = []
            
            # Create asset document
            asset_data = {
                "name": name.strip() if name else "",
                "type": type,
                "category": type,  # Same as type for simplicity
                "cloudinary_url": cloudinary_result["url"],
                "cloudinary_public_id": cloudinary_result["public_id"],
                "tags": tags_list,
                "description": description.strip() if description else None,
                "upload_date": datetime.utcnow(),
                "is_active": True,
                "usage_count": 0,
                "metadata": {
                    "width": int(cloudinary_result["width"]),
                    "height": int(cloudinary_result["height"]),
                    "file_size": int(cloudinary_result["file_size"]),
                    "format": str(cloudinary_result["format"])
                }
            }
            
            # Save to MongoDB
            result = db.assets.insert_one(asset_data)
            
            # Prepare response data (exclude fields not in AssetResponse model)
            response_data = {
                "id": str(result.inserted_id),
                "name": asset_data["name"],
                "type": asset_data["type"],
                "category": asset_data["category"],
                "cloudinary_url": asset_data["cloudinary_url"],
                "tags": asset_data["tags"],
                "description": asset_data["description"],
                "upload_date": asset_data["upload_date"],
                "usage_count": asset_data["usage_count"],
                "metadata": AssetMetadata(**asset_data["metadata"])
            }
            
            return AssetResponse(**response_data)
        finally:
            # Cleanup file handle and force garbage collection
            if hasattr(file, 'file'):
                file.file.close()
            gc.collect()
        
    except HTTPException:
        # Re-raise HTTP exceptions (validation errors, etc.)
        raise
    except Exception as e:
        print(f"❌ Asset upload failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[AssetResponse])
async def get_assets(type: Optional[str] = None):
    try:
        query = {"is_active": True}
        if type:
            query["type"] = type
            
        assets = list(db.assets.find(query))
        result = []
        for asset in assets:
            # Filter out fields not in AssetResponse model with safe access
            try:
                response_data = {
                    "id": str(asset["_id"]),
                    "name": asset.get("name", ""),
                    "type": asset.get("type", ""),
                    "category": asset.get("category", asset.get("type", "")),
                    "cloudinary_url": asset.get("cloudinary_url", ""),
                    "tags": asset.get("tags", []),
                    "description": asset.get("description"),
                    "upload_date": asset.get("upload_date", datetime.utcnow()),
                    "usage_count": asset.get("usage_count", 0),
                    "metadata": AssetMetadata(**asset.get("metadata", {}))
                }
                result.append(AssetResponse(**response_data))
            except Exception as e:
                # Skip malformed assets and log error
                print(f"⚠️ Skipping malformed asset {asset.get('_id')}: {str(e)}")
                continue
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(asset_id: str):
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(asset_id):
            raise HTTPException(status_code=400, detail="Invalid asset ID format")
        
        asset = db.assets.find_one({"_id": ObjectId(asset_id)})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Filter out fields not in AssetResponse model with safe access
        response_data = {
            "id": str(asset["_id"]),
            "name": asset.get("name", ""),
            "type": asset.get("type", ""),
            "category": asset.get("category", asset.get("type", "")),
            "cloudinary_url": asset.get("cloudinary_url", ""),
            "tags": asset.get("tags", []),
            "description": asset.get("description"),
            "upload_date": asset.get("upload_date", datetime.utcnow()),
            "usage_count": asset.get("usage_count", 0),
            "metadata": AssetMetadata(**asset.get("metadata", {}))
        }
        return AssetResponse(**response_data)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid asset ID: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(asset_id):
            raise HTTPException(status_code=400, detail="Invalid asset ID format")
        
        asset = db.assets.find_one({"_id": ObjectId(asset_id)})
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Delete from Cloudinary if public_id exists
        public_id = asset.get("cloudinary_public_id")
        if public_id:
            try:
                await cloudinary_service.delete_asset(public_id)
            except Exception as e:
                print(f"⚠️ Failed to delete from Cloudinary: {str(e)}")
                # Continue with MongoDB deletion even if Cloudinary fails
        
        # Delete from MongoDB
        db.assets.delete_one({"_id": ObjectId(asset_id)})
        
        return {"message": "Asset deleted successfully"}
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid asset ID: {str(e)}")
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
