# EYE-dentify Development Guide

## Production URLs

- **Frontend**: `https://eye-dentify.vercel.app`
- **Backend**: `https://eye-dentify.onrender.com`
- **API Docs**: `https://eye-dentify.onrender.com/docs`

## Tech Stack

### Backend
- FastAPI 0.104.1
- Python 3.11+
- MongoDB
- PyTorch + FaceNet
- Cloudinary

### Frontend
- React 19.2.0
- TypeScript 4.9.5
- Tailwind CSS 3.4.18
- Axios

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

**Environment (.env):**
```env
MONGO_URI=your_mongo_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SECRET_KEY=your_secret_key
ALLOWED_ORIGINS=http://localhost:5000,https://eye-dentify.vercel.app
```

**Run:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
npm install
```

**Environment (.env):**
```env
REACT_APP_API_URL=http://localhost:8000
PORT=5000
```

**Run:**
```bash
npm start
```

## Project Structure

```
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── utils/
├── src/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   └── types/
└── public/
```

## Code Standards

### Python
- Type hints required
- PEP 8 style
- Async/await for I/O

### TypeScript/React
- Functional components
- TypeScript interfaces
- Error boundaries

## Testing

### Backend
```bash
cd backend
pytest tests/
```

### Frontend
```bash
npm test
```

## Adding Features

### New API Endpoint
1. Create route in `backend/routes/`
2. Add to `backend/main.py`
3. Update schemas in `backend/models/schemas.py`

### New Component
1. Create component in `src/components/`
2. Add types in `src/types/`
3. Update routes in `src/App.tsx`

## API Integration

```typescript
import { apiClient } from './lib/api';

// GET
const data = await apiClient.get('/api/v1/endpoint');

// POST
const result = await apiClient.post('/api/v1/endpoint', { data });

// File Upload
const response = await apiClient.uploadFile('/api/v1/upload', file, { name: 'test' });
```

## Database Operations

```python
from database import db

# Insert
result = db.faces.insert_one(document)

# Find
documents = list(db.faces.find(query))

# Update
result = db.faces.update_one(filter, update)

# Delete
result = db.faces.delete_one(filter)
```

## Environment Variables

### Backend (.env)
- `MONGO_URI`: MongoDB connection string
- `CLOUDINARY_*`: Cloudinary credentials
- `SECRET_KEY`: JWT secret
- `ALLOWED_ORIGINS`: CORS origins

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL
- `PORT`: Development server port

## Debugging

### Backend
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Frontend
- React DevTools
- Browser console
- Error boundaries

## Deployment

### Backend (Render)
- Connect GitHub repository
- Set environment variables
- Deploy automatically on push

### Frontend (Vercel)
- Connect GitHub repository
- Set environment variables
- Deploy automatically on push

---

**Production**: `https://eye-dentify.vercel.app` | `https://eye-dentify.onrender.com`
