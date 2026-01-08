# EYE-dentify API Documentation

## Base URL

- **Production**: `https://eye-dentify.onrender.com`
- **API Documentation**: `https://eye-dentify.onrender.com/docs`
- **ReDoc**: `https://eye-dentify.onrender.com/redoc`

## Authentication

JWT-based authentication required for protected endpoints.

## API Versioning

All endpoints prefixed with `/api/v1/`.

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed",
  "data": {}
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Error message",
  "error_code": "ERROR_CODE"
}
```

## Endpoints

### Health & Status

#### GET /health
Check API health.

#### GET /api/v1/status
Get API status and feature availability.

### Authentication

#### POST /api/v1/auth/register
Register new user.

**Request:**
- `email` (string, required)
- `password` (string, required)
- `name` (string, optional)

#### POST /api/v1/auth/login
User login.

**Request:**
- `email` (string, required)
- `password` (string, required)

#### POST /api/v1/auth/logout
User logout (requires authentication).

#### GET /api/v1/auth/me
Get current user (requires authentication).

### Face Recognition

#### POST /api/v1/faces/add
Add face to database.

**Request (multipart/form-data):**
- `name` (string, required)
- `age` (string, optional)
- `crime` (string, optional)
- `description` (string, optional)
- `file` (file, required): Image (JPEG, PNG, GIF, WebP, max 10MB)

**Response:**
```json
{
  "status": "ok",
  "message": "Face registered",
  "image_url": "https://res.cloudinary.com/.../image.jpg"
}
```

#### POST /api/v1/faces/recognize
Recognize face from image.

**Request (multipart/form-data):**
- `file` (file, required): Image to recognize

**Response (Match Found):**
```json
{
  "status": "recognized",
  "similarity": 0.85,
  "name": "John Doe",
  "age": "35",
  "crime": "Theft",
  "description": "Description",
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
Get all faces.

**Query Parameters:**
- `page` (optional): Page number
- `page_size` (optional): Items per page (default: 50)

#### PATCH /api/v1/faces/{name}
Update face information.

#### DELETE /api/v1/faces/{name}
Delete face from database.

#### POST /api/v1/faces/{name}/image
Replace face image.

### Asset Management

#### GET /api/v1/assets
Get all assets.

**Query Parameters:**
- `type` (optional): Filter by type

#### POST /api/v1/assets/upload
Upload new asset.

**Request (multipart/form-data):**
- `name` (string, required)
- `type` (string, required): face-shapes, eyes, noses, mouths, hair, accessories
- `description` (string, optional)
- `tags` (string, optional): JSON array
- `file` (file, required)

#### GET /api/v1/assets/{asset_id}
Get asset by ID.

#### DELETE /api/v1/assets/{asset_id}
Delete asset.

### Sketch Management

#### POST /api/v1/sketches/save
Save composite sketch.

**Request:**
- `name` (string, required)
- `components` (object, required): Sketch components
- `image_url` (string, required)

#### GET /api/v1/sketches
Get all sketches.

#### GET /api/v1/sketches/{sketch_id}
Get sketch by ID.

#### DELETE /api/v1/sketches/{sketch_id}
Delete sketch.

## Rate Limits

- **General API**: 60 requests/minute per IP
- **File Uploads**: 2 requests/minute per IP

## File Upload Limits

- **Max Size**: 10MB
- **Formats**: JPEG, PNG, GIF, WebP
- **Timeout**: 60 seconds

## Face Recognition Parameters

- **Recognition Threshold**: 0.50 (50% similarity)
- **Rejection Threshold**: 0.30 (30% similarity)
- **Image Processing**: 160x160 pixels

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `DATABASE_ERROR` | Database operation failed |
| `UPLOAD_ERROR` | File upload failed |
| `RECOGNITION_ERROR` | Face recognition failed |
| `HTTP_400` | Bad request |
| `HTTP_404` | Resource not found |
| `HTTP_413` | Request too large |
| `HTTP_429` | Rate limit exceeded |
| `HTTP_500` | Internal server error |

## Interactive Documentation

- **Swagger UI**: `https://eye-dentify.onrender.com/docs`
- **ReDoc**: `https://eye-dentify.onrender.com/redoc`

## Testing Examples

### cURL - Add Face
```bash
curl -X POST "https://eye-dentify.onrender.com/api/v1/faces/add" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=John Doe" \
  -F "file=@image.jpg"
```

### cURL - Recognize Face
```bash
curl -X POST "https://eye-dentify.onrender.com/api/v1/faces/recognize" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg"
```

### JavaScript/TypeScript
```javascript
import { apiClient } from './lib/api';

// Add face
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('file', fileInput.files[0]);
const result = await apiClient.post('/faces/add', formData);
```

---

**Production API**: `https://eye-dentify.onrender.com`
