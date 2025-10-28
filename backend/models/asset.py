from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

class AssetMetadata(BaseModel):
    width: int
    height: int
    file_size: int
    format: str

class Asset(BaseModel):
    id: Optional[str] = Field(alias="_id")
    name: str
    type: str  # face-shapes, eyes, etc.
    category: str
    cloudinary_url: str
    cloudinary_public_id: str
    tags: List[str] = []
    description: Optional[str] = None
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    usage_count: int = 0
    metadata: AssetMetadata

class AssetCreate(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    tags: List[str] = []

class AssetResponse(BaseModel):
    id: str
    name: str
    type: str
    category: str
    cloudinary_url: str
    tags: List[str]
    description: Optional[str]
    upload_date: datetime
    usage_count: int
    metadata: AssetMetadata
