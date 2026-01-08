# EYE-dentify Port Configuration

## Production URLs

- **Frontend**: `https://eye-dentify.vercel.app`
- **Backend**: `https://eye-dentify.onrender.com`
- **API Docs**: `https://eye-dentify.onrender.com/docs`

## Local Development

### Backend
- **Port**: 8000
- **URL**: `http://localhost:8000`
- **Command**: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`

### Frontend
- **Port**: 5000
- **URL**: `http://localhost:5000`
- **Configuration**: `craco.config.js`
- **Command**: `npm start`

## Environment Variables

### Backend (.env)
```env
PORT=8000
HOST=0.0.0.0
```

### Frontend (.env)
```env
PORT=5000
REACT_APP_API_URL=http://localhost:8000
```

## CORS Configuration

Backend allows:
- `http://localhost:5000` (development)
- `https://eye-dentify.vercel.app` (production)

## Verification

1. **Backend**: Visit `http://localhost:8000/docs`
2. **Frontend**: Visit `http://localhost:5000`
3. **Production**: Visit `https://eye-dentify.vercel.app`

---

**Production**: `https://eye-dentify.vercel.app` | `https://eye-dentify.onrender.com`
