# Face Recognition Dashboard - API Documentation

## Overview

The Face Recognition Dashboard API provides comprehensive endpoints for managing facial recognition data, assets, and forensic investigations. Built with FastAPI, it offers high performance, automatic documentation, and production-ready features.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://yourdomain.com`

## Authentication

Currently, the API operates without authentication. For production deployments, consider implementing:
- JWT tokens
- API keys
- OAuth2 integration

## API Versioning

All endpoints are prefixed with `/api/v1/` for version management.

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "error_code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z",
  "details": { ... }
}
```

## Endpoints

### Health & Status

#### GET /health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### GET /api/v1/status
Get detailed API status and feature availability.

**Response:**
```json
{
  "api_version": "v1",
  "status": "operational",
  "features": {
    "face_recognition": true,
    "asset_management": true,
    "database": true,
    "cloud_storage": true
  }
}
```

### Face Recognition

#### POST /api/v1/faces/add
Add a new face to the database.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `name` (string, required): Full name of the person
  - `age` (string, optional): Age of the person
  - `crime` (string, optional): Type of crime
  - `description` (string, optional): Physical description
  - `file` (file, required): Image file (JPEG, PNG, GIF, WebP)

**Response:**
```json
{
  "status": "ok",
  "message": "Face registered for John Doe",
  "image_url": "https://res.cloudinary.com/.../image.jpg"
}
```

**Validation Rules:**
- Name: 1-100 characters, letters/spaces/hyphens/periods only
- Age: 1-3 digits
- Crime: 1-100 characters
- Description: 1-1000 characters
- File: Max 10MB, image formats only

#### POST /api/v1/faces/recognize
Recognize a face from uploaded image.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file` (file, required): Image file to recognize

**Response (Match Found):**
```json
{
  "status": "recognized",
  "similarity": 0.85,
  "name": "John Doe",
  "age": "35",
  "crime": "Theft",
  "description": "Tall, brown hair",
  "image_url": "https://res.cloudinary.com/.../image.jpg"
}
```

**Response (No Match):**
```json
{
  "status": "not_recognized",
  "best_score": 0.25,
  "message": "No matching face found"
}
```

#### GET /api/v1/faces/gallery
Get all faces in the database.

**Response:**
```json
{
  "faces": [
    {
      "name": "John Doe",
      "age": "35",
      "crime": "Theft",
      "description": "Tall, brown hair",
      "image_urls": ["https://res.cloudinary.com/.../image.jpg"]
    }
  ],
  "total_count": 1,
  "page": 1,
  "page_size": 50
}
```

#### PATCH /api/v1/faces/{name}
Update face information.

**Request:**
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "name": "John Smith",
  "age": "36",
  "crime": "Robbery",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "status": "ok",
  "message": "Face updated"
}
```

#### DELETE /api/v1/faces/{name}
Delete a face from the database.

**Response:**
```json
{
  "status": "ok",
  "message": "Face deleted"
}
```

#### POST /api/v1/faces/{name}/image
Replace the primary image for a face.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file` (file, required): New image file

**Response:**
```json
{
  "status": "ok",
  "image_url": "https://res.cloudinary.com/.../new-image.jpg"
}
```

### Asset Management

#### GET /api/v1/assets
Get all assets.

**Query Parameters:**
- `type` (optional): Filter by asset type

**Response:**
```json
[
  {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Eye Shape 1",
    "type": "eyes",
    "category": "eyes",
    "cloudinary_url": "https://res.cloudinary.com/.../eye1.jpg",
    "tags": ["brown", "round"],
    "description": "Round brown eyes",
    "upload_date": "2024-01-01T00:00:00Z",
    "usage_count": 5,
    "metadata": {
      "width": 200,
      "height": 200,
      "file_size": 15432,
      "format": "jpg"
    }
  }
]
```

#### POST /api/v1/assets/upload
Upload a new asset.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `name` (string, required): Asset name
  - `type` (string, required): Asset type (face-shapes, eyes, noses, mouths, hair, accessories)
  - `description` (string, optional): Asset description
  - `tags` (string, optional): JSON array of tags
  - `file` (file, required): Image file

**Response:**
```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "Eye Shape 1",
  "type": "eyes",
  "category": "eyes",
  "cloudinary_url": "https://res.cloudinary.com/.../eye1.jpg",
  "tags": ["brown", "round"],
  "description": "Round brown eyes",
  "upload_date": "2024-01-01T00:00:00Z",
  "usage_count": 0,
  "metadata": {
    "width": 200,
    "height": 200,
    "file_size": 15432,
    "format": "jpg"
  }
}
```

#### GET /api/v1/assets/{asset_id}
Get specific asset by ID.

**Response:**
```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "Eye Shape 1",
  "type": "eyes",
  "category": "eyes",
  "cloudinary_url": "https://res.cloudinary.com/.../eye1.jpg",
  "tags": ["brown", "round"],
  "description": "Round brown eyes",
  "upload_date": "2024-01-01T00:00:00Z",
  "usage_count": 5,
  "metadata": {
    "width": 200,
    "height": 200,
    "file_size": 15432,
    "format": "jpg"
  }
}
```

#### DELETE /api/v1/assets/{asset_id}
Delete an asset.

**Response:**
```json
{
  "message": "Asset deleted successfully"
}
```

#### PUT /api/v1/assets/{asset_id}/usage
Increment usage count for an asset.

**Response:**
```json
{
  "message": "Usage count incremented"
}
```

#### PUT /api/v1/assets/{asset_id}/name
Update asset name.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `name` (string, required): New asset name

**Response:**
```json
{
  "message": "Asset name updated successfully"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `DATABASE_ERROR` | Database operation failed |
| `UPLOAD_ERROR` | File upload failed |
| `RECOGNITION_ERROR` | Face recognition processing failed |
| `INTERNAL_ERROR` | Unexpected server error |
| `HTTP_400` | Bad request |
| `HTTP_404` | Resource not found |
| `HTTP_413` | Request too large |
| `HTTP_429` | Rate limit exceeded |
| `HTTP_500` | Internal server error |

## Rate Limiting

- **General API**: 60 requests per minute per IP
- **File Uploads**: 2 requests per minute per IP
- **Burst**: 20 requests allowed in burst mode

## File Upload Limits

- **Maximum file size**: 10MB
- **Allowed formats**: JPEG, PNG, GIF, WebP
- **Processing timeout**: 60 seconds

## Face Recognition Parameters

- **Recognition threshold**: 0.50 (50% similarity)
- **Rejection threshold**: 0.30 (30% similarity)
- **Image processing**: 160x160 pixels
- **Model**: FaceNet (VGGFace2 pretrained)

## WebSocket Support

Currently not implemented. Future versions may include:
- Real-time face recognition
- Live collaboration features
- Real-time notifications

## SDKs and Libraries

### JavaScript/TypeScript
```javascript
import { apiClient } from './lib/api';

// Add face
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('file', fileInput.files[0]);

const result = await apiClient.post('/faces/add', formData);
```

### Python
```python
import requests

# Add face
files = {'file': open('image.jpg', 'rb')}
data = {'name': 'John Doe', 'age': '35'}

response = requests.post(
    'http://localhost:8000/api/v1/faces/add',
    files=files,
    data=data
)
```

### cURL Examples

#### Add Face
```bash
curl -X POST "http://localhost:8000/api/v1/faces/add" \
  -F "name=John Doe" \
  -F "age=35" \
  -F "crime=Theft" \
  -F "description=Tall, brown hair" \
  -F "file=@image.jpg"
```

#### Recognize Face
```bash
curl -X POST "http://localhost:8000/api/v1/faces/recognize" \
  -F "file=@image.jpg"
```

#### Get Gallery
```bash
curl -X GET "http://localhost:8000/api/v1/faces/gallery"
```

## Testing

### Interactive Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Test Scripts
```bash
# Run API tests
cd backend
python -m pytest tests/

# Run with coverage
python -m pytest tests/ --cov=.
```

## Changelog

### Version 1.0.0
- Initial release
- Face recognition endpoints
- Asset management
- Production-ready configuration
- Comprehensive error handling
- Rate limiting
- Security middleware

## Support

For API support:
1. Check the interactive documentation
2. Review error messages and codes
3. Check server logs
4. Contact development team

---

**Note**: This API is designed for forensic and law enforcement use. Ensure compliance with local regulations and privacy laws.
