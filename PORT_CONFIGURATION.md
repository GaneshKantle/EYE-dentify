# Port Configuration Guide

## Configuration Summary

### Frontend (React)
- **Port**: 5000
- **Configuration**: `craco.config.js` - devServer.port set to 5000
- **Environment**: `.env` file with `PORT=5000` (create if needed)
- **URL**: `http://localhost:5000`

### Backend (FastAPI)
- **Port**: 8000
- **Configuration**: Uses default uvicorn port 8000
- **CORS**: Updated to allow `http://localhost:5000`
- **URL**: `http://localhost:8000`

## Changes Made

### 1. Frontend Configuration
- ✅ Updated `craco.config.js` to set devServer port to 5000
- ✅ API client already configured to use `http://localhost:8000` (no changes needed)

### 2. Backend Configuration  
- ✅ Updated `backend/main.py` CORS to allow `http://localhost:5000`
- ✅ Updated `backend/env.example` with correct ALLOWED_ORIGINS

## Running the Application

### Start Backend (Port 8000)
```bash
cd backend
uvicorn main:app --reload
```
Backend will run on: `http://localhost:8000`

### Start Frontend (Port 5000)
```bash
npm start
```
Frontend will run on: `http://localhost:5000`

## Verification

1. **Backend**: Visit `http://localhost:8000/docs` - Should see API documentation
2. **Frontend**: Visit `http://localhost:5000` - Should see the application
3. **CORS**: Frontend should be able to make requests to backend without CORS errors

## Environment Variables

Create `.env` file in root directory (if not exists):
```
PORT=5000
REACT_APP_API_URL=http://localhost:8000
```

The backend already uses port 8000 by default, so no additional configuration needed there.

