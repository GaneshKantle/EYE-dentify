from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import re

class FaceCreateRequest(BaseModel):
    """Request model for creating a new face record."""
    name: str = Field(..., min_length=1, max_length=100, description="Full name of the person")
    age: Optional[str] = Field(None, max_length=10, description="Age of the person")
    crime: Optional[str] = Field(None, max_length=100, description="Type of crime")
    description: Optional[str] = Field(None, max_length=1000, description="Physical description")
    
    @validator('name')
    def validate_name(cls, v):
        """Validate name format."""
        if not re.match(r'^[a-zA-Z\s\-\.]+$', v):
            raise ValueError('Name can only contain letters, spaces, hyphens, and periods')
        return v.strip()
    
    @validator('age')
    def validate_age(cls, v):
        """Validate age format."""
        if v and not re.match(r'^\d{1,3}$', v):
            raise ValueError('Age must be a valid number')
        return v
    
    @validator('crime')
    def validate_crime(cls, v):
        """Validate crime description."""
        if v and len(v.strip()) == 0:
            return None
        return v.strip() if v else None
    
    @validator('description')
    def validate_description(cls, v):
        """Validate description."""
        if v and len(v.strip()) == 0:
            return None
        return v.strip() if v else None

class FaceUpdateRequest(BaseModel):
    """Request model for updating a face record."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    age: Optional[str] = Field(None, max_length=10)
    crime: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    
    @validator('name')
    def validate_name(cls, v):
        if v and not re.match(r'^[a-zA-Z\s\-\.]+$', v):
            raise ValueError('Name can only contain letters, spaces, hyphens, and periods')
        return v.strip() if v else None
    
    @validator('age')
    def validate_age(cls, v):
        if v and not re.match(r'^\d{1,3}$', v):
            raise ValueError('Age must be a valid number')
        return v
    
    @validator('crime')
    def validate_crime(cls, v):
        if v and len(v.strip()) == 0:
            return None
        return v.strip() if v else None
    
    @validator('description')
    def validate_description(cls, v):
        if v and len(v.strip()) == 0:
            return None
        return v.strip() if v else None

class FaceResponse(BaseModel):
    """Response model for face data."""
    name: str
    age: Optional[str] = None
    crime: Optional[str] = None
    description: Optional[str] = None
    image_urls: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class RecognitionRequest(BaseModel):
    """Request model for face recognition."""
    confidence_threshold: Optional[float] = Field(0.5, ge=0.0, le=1.0)

class RecognitionResponse(BaseModel):
    """Response model for face recognition results."""
    status: str
    similarity: Optional[float] = None
    name: Optional[str] = None
    age: Optional[str] = None
    crime: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    message: Optional[str] = None
    confidence: Optional[str] = None

class GalleryResponse(BaseModel):
    """Response model for gallery data."""
    faces: List[FaceResponse]
    total_count: int
    page: int = 1
    page_size: int = 50

class AssetCreateRequest(BaseModel):
    """Request model for creating assets."""
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    tags: List[str] = Field(default_factory=list)
    
    @validator('name')
    def validate_name(cls, v):
        if not re.match(r'^[a-zA-Z0-9\s\-\._]+$', v):
            raise ValueError('Name can only contain letters, numbers, spaces, hyphens, periods, and underscores')
        return v.strip()
    
    @validator('type')
    def validate_type(cls, v):
        allowed_types = ['face-shapes', 'eyes', 'noses', 'mouths', 'hair', 'accessories']
        if v not in allowed_types:
            raise ValueError(f'Type must be one of: {", ".join(allowed_types)}')
        return v
    
    @validator('tags')
    def validate_tags(cls, v):
        if len(v) > 10:
            raise ValueError('Maximum 10 tags allowed')
        return [tag.strip() for tag in v if tag.strip()]

class AssetResponse(BaseModel):
    """Response model for asset data."""
    id: str
    name: str
    type: str
    category: str
    cloudinary_url: str
    tags: List[str] = []
    description: Optional[str] = None
    upload_date: datetime
    usage_count: int = 0
    metadata: dict

class ErrorResponse(BaseModel):
    """Standard error response model."""
    error: str
    message: str
    error_code: str
    timestamp: str
    details: Optional[dict] = None

class SuccessResponse(BaseModel):
    """Standard success response model."""
    status: str = "success"
    message: str
    data: Optional[dict] = None
    timestamp: str
