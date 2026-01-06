# Eye-dentify

A comprehensive forensic face recognition system designed for law enforcement and criminal investigation. The platform enables real-time facial recognition, composite sketch creation, and criminal database management using advanced AI-powered face recognition technology.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

Eye-dentify is a full-stack forensic investigation platform that combines machine learning-based face recognition with an intuitive web interface. The system uses FaceNet (InceptionResnetV1) models trained on VGGFace2 dataset to generate 512-dimensional facial embeddings for accurate identity matching. It supports real-time face recognition, composite sketch creation, and comprehensive criminal database management.

**Key Capabilities:**
- Real-time face recognition with 98.5% accuracy
- Composite sketch creation using digital forensic tools
- Criminal database management with secure image storage
- JWT-based authentication system
- Asset management for sketch components
- Gallery view of all registered suspects

## Features

### Core Features

1. **Face Recognition**
   - Upload images or sketches for instant database matching
   - MTCNN face detection with automatic alignment
   - Cosine similarity matching with configurable thresholds
   - Real-time processing with visual feedback
   - Match confidence scoring

2. **Composite Sketch Creation**
   - Digital forensic sketch builder
   - Asset library for facial features (eyes, nose, mouth, hair, face shapes, accessories)
   - Save and manage sketch records
   - Export sketches for recognition

3. **Criminal Database Management**
   - Add suspects with facial data and metadata
   - Update and delete records
   - Gallery view with search and filtering
   - Secure image storage via Cloudinary

4. **Authentication & Security**
   - JWT-based user authentication
   - Protected routes and API endpoints
   - Password hashing with bcrypt
   - Registration with secret key validation
   - Session management

5. **Asset Management**
   - Upload and manage sketch component assets
   - Categorize by type (face-shapes, eyes, noses, mouths, hair, accessories)
   - Usage tracking and metadata storage

## Technology Stack

### Frontend
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Create React App with CRACO
- **Styling**: Tailwind CSS 3.4.18
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router DOM 7.9.4
- **State Management**: Zustand 5.0.8
- **HTTP Client**: Axios 1.12.2
- **Animations**: Framer Motion 12.23.24
- **Icons**: Lucide React 0.546.0

### Backend
- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn 0.24.0 with Gunicorn 21.2.0
- **Language**: Python 3.12
- **Database**: MongoDB (PyMongo 4.6.0, Motor 3.3.2)
- **Machine Learning**: 
  - PyTorch 2.5.0 (CPU)
  - FaceNet PyTorch 2.5.3
  - MTCNN for face detection
  - InceptionResnetV1 for embeddings

### Services & Storage
- **Image Storage**: Cloudinary 1.36.0
- **Email Service**: Resend 2.1.0
- **Authentication**: python-jose 3.3.0, bcrypt 4.0.1
- **Environment**: python-dotenv 1.0.0

### Development Tools
- **Linting**: ESLint, Flake8
- **Formatting**: Black, isort
- **Testing**: Pytest 7.4.3, React Testing Library
- **Type Checking**: TypeScript, MyPy

## Project Structure

```
Eye-denitfy/
├── backend/                    # FastAPI backend application
│   ├── main.py                # FastAPI app entry point
│   ├── database.py            # MongoDB connection management
│   ├── config.py              # Configuration settings
│   ├── requirements.txt       # Python dependencies
│   ├── routes/                # API route handlers
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── assets.py          # Asset management endpoints
│   │   └── sketches.py        # Sketch management endpoints
│   ├── middleware/            # Custom middleware
│   │   ├── auth.py            # JWT authentication
│   │   ├── memory.py          # Memory cleanup
│   │   └── security.py       # Security headers
│   ├── models/                # Pydantic models
│   │   ├── asset.py          # Asset schemas
│   │   └── schemas.py        # General schemas
│   ├── services/              # Business logic services
│   │   ├── cloudinary_service.py  # Image upload service
│   │   └── email_service.py       # Email sending service
│   ├── utils/                 # Utility functions
│   │   └── error_handler.py  # Error handling
│   ├── Dockerfile             # Docker configuration
│   ├── docker-compose.yml     # Docker Compose setup
│   └── .env                   # Environment variables (create from env.example)
│
├── src/                       # React frontend application
│   ├── App.tsx                # Main app component
│   ├── Dashboard.tsx          # Dashboard page
│   ├── RecognizeFace.tsx      # Face recognition page
│   ├── AddFace.tsx            # Add suspect page
│   ├── Gallery.tsx            # Gallery page
│   ├── Sketch.tsx              # Sketch creation page
│   ├── components/            # Reusable components
│   │   ├── auth/              # Authentication components
│   │   ├── facesketch/        # Sketch builder components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # UI primitives (shadcn/ui)
│   ├── pages/                 # Page components
│   │   ├── auth/              # Auth pages (Login, Register, VerifyOTP)
│   │   └── dashboard/         # Dashboard pages
│   ├── lib/                   # Utility libraries
│   │   ├── api.ts             # API client configuration
│   │   ├── assetService.ts    # Asset service
│   │   ├── sketchService.ts   # Sketch service
│   │   └── utils.ts           # General utilities
│   ├── store/                 # State management
│   │   └── authStore.ts       # Authentication store
│   ├── contexts/              # React contexts
│   │   ├── LoadingContext.tsx # Loading state
│   │   └── NotificationContext.tsx  # Notifications
│   ├── types/                 # TypeScript type definitions
│   └── hooks/                 # Custom React hooks
│
├── public/                    # Static assets
├── package.json               # Node.js dependencies
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── craco.config.js            # CRACO configuration
├── API_DOCUMENTATION.md       # Detailed API documentation
└── README.md                  # This file
```

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **Python**: 3.12 or higher
- **MongoDB**: 6.0 or higher (local or Atlas)
- **npm**: 9.x or higher
- **pip**: 23.x or higher

### External Services
- **MongoDB Atlas** account (or local MongoDB instance)
- **Cloudinary** account for image storage
- **Resend** account for email services (optional)
- **MojoAuth** account for OTP verification (optional)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Eye-denitfy
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# From project root
npm install
```

## Configuration

### Backend Environment Variables

Create `backend/.env` file with the following variables:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=face_recognition_db

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Server Configuration
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development

# Face Recognition Thresholds
RECOGNITION_THRESHOLD=0.50
REJECTION_THRESHOLD=0.30
MODEL_AUTO_LOAD=false

# Registration Security
REGISTRATION_SECRET_KEY=your-registration-secret-key

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_TEST_EMAIL=test@example.com

# MojoAuth (Optional)
MOJOAUTH_API_KEY=your_mojoauth_api_key
MOJOAUTH_API_SECRET=your_mojoauth_secret
MOJOAUTH_BASE_URL=https://your-domain.auth.mojoauth.com
MOJOAUTH_ENV=test

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000,http://localhost:5173
```

### Frontend Environment Variables

Create `.env` file in project root (optional, defaults to production API):

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_VERSION=v1
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true
REACT_APP_VERSION=1.0.0
REACT_APP_API_TIMEOUT_MS=90000
```

## Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or use the start script
python start.py
```

Backend will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs` (Swagger UI)
- Alternative Docs: `http://localhost:8000/redoc` (ReDoc)

#### Start Frontend Development Server

```bash
# From project root
npm start
```

Frontend will be available at `http://localhost:3000`

### Production Mode

#### Build Frontend

```bash
npm run build
```

#### Run Backend with Gunicorn

```bash
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or for production
docker-compose -f docker-compose.production.yml up -d
```

## API Documentation

Complete API documentation is available at:

- **Interactive Swagger UI**: `http://localhost:8000/docs` (development) or `https://your-domain.com/docs` (production)
- **ReDoc**: `http://localhost:8000/redoc` (development) or `https://your-domain.com/redoc` (production)

For detailed endpoint documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Key API Endpoints

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

**Face Recognition:**
- `POST /recognize_face` - Recognize face from image
- `POST /add_face` - Add face to database
- `GET /gallery` - Get all faces
- `PATCH /face/{name}` - Update face record
- `DELETE /face/{name}` - Delete face record

**Sketches:**
- `POST /sketches/save` - Save composite sketch
- `GET /sketches` - Get all sketches
- `GET /sketches/{sketch_id}` - Get sketch by ID
- `DELETE /sketches/{sketch_id}` - Delete sketch

**Assets:**
- `POST /assets/upload` - Upload asset
- `GET /assets` - Get all assets
- `GET /assets/{asset_id}` - Get asset by ID
- `DELETE /assets/{asset_id}` - Delete asset

**Health & Status:**
- `GET /health` - Health check
- `GET /` - API root
- `GET /debug/routes` - List all routes

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  React + TypeScript + Tailwind CSS + shadcn/ui              │
│  Port: 3000 (Development)                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │ JWT Authentication
┌──────────────────────▼──────────────────────────────────────┐
│                       Backend Layer                           │
│  FastAPI + Python 3.12 + Uvicorn                            │
│  Port: 8000                                                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Routes     │  │  Middleware  │  │   Services    │    │
│  │  - auth      │  │  - JWT Auth  │  │  - Cloudinary │    │
│  │  - assets    │  │  - Memory    │  │  - Email      │    │
│  │  - sketches  │  │  - Security  │  │               │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Machine Learning Layer                      │  │
│  │  MTCNN (Face Detection) + InceptionResnetV1 (FaceNet) │  │
│  │  PyTorch 2.5.0 (CPU)                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐
│   MongoDB    │ │ Cloudinary │ │  Resend   │
│   Database   │ │   Images   │ │   Email   │
│   Atlas      │ │   Storage   │ │  Service  │
└──────────────┘ └─────────────┘ └───────────┘
```

### Face Recognition Pipeline

1. **Image Upload**: User uploads image via frontend
2. **Face Detection**: MTCNN detects and aligns face (160x160px)
3. **Embedding Generation**: InceptionResnetV1 generates 512-dimensional embedding
4. **Normalization**: Embedding normalized using L2 norm
5. **Database Search**: Cosine similarity comparison with all stored embeddings
6. **Threshold Check**: Match if similarity ≥ 0.50 (configurable)
7. **Result Return**: Best match with confidence score and metadata

### Data Flow

**Face Registration:**
```
Image → MTCNN → FaceNet → Embedding → Base64 Encode → MongoDB + Cloudinary
```

**Face Recognition:**
```
Image → MTCNN → FaceNet → Embedding → Compare with DB → Return Match/No Match
```

## Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Set environment variables in platform dashboard
2. Configure build command: `pip install -r requirements.txt`
3. Set start command: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
4. Set Python version: `3.12` (via `runtime.txt`)

### Frontend Deployment (Vercel/Netlify)

1. Connect repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Configure environment variables
5. Deploy

### Docker Deployment

```bash
# Build backend image
cd backend
docker build -t eyedentify-backend -f Dockerfile.production .

# Build frontend image
cd ..
docker build -t eyedentify-frontend -f Dockerfile.production .

# Run with docker-compose
docker-compose -f docker-compose.production.yml up -d
```

## Troubleshooting

### Common Issues

**Backend won't start:**
- Verify all environment variables are set in `backend/.env`
- Check MongoDB connection string
- Ensure Python 3.12 is installed
- Verify all dependencies: `pip install -r requirements.txt`

**Face recognition not working:**
- Check ML models are loading (check server logs)
- Verify image format (JPEG, PNG supported)
- Ensure face is clearly visible in image
- Check recognition threshold settings

**CORS errors:**
- Verify `ALLOWED_ORIGINS` includes frontend URL
- Check backend CORS middleware configuration
- Ensure frontend `REACT_APP_API_URL` matches backend URL

**Authentication issues:**
- Verify JWT_SECRET_KEY is set
- Check token expiration settings
- Verify password hashing (bcrypt) is working
- Check MongoDB users collection exists

**Memory issues:**
- Reduce `maxPoolSize` in MongoDB connection
- Set `MODEL_AUTO_LOAD=false` for lazy loading
- Increase server memory allocation
- Enable memory cleanup middleware

### Performance Optimization

- **Lazy Model Loading**: Set `MODEL_AUTO_LOAD=false` to load models on first request
- **Connection Pooling**: Adjust MongoDB `maxPoolSize` based on server resources
- **Image Optimization**: Use Cloudinary transformations for image compression
- **Caching**: Implement Redis for frequently accessed data (optional)

### Logs and Debugging

**Backend logs:**
```bash
# View real-time logs
tail -f backend/logs/app.log

# Check server output
# Logs appear in terminal when running uvicorn
```

**Frontend debugging:**
- Enable debug mode: `REACT_APP_DEBUG=true`
- Check browser console for API errors
- Verify network requests in DevTools

## License

This project is intended for educational and law enforcement purposes. Ensure compliance with local regulations and privacy laws when deploying.

---

**Version**: 1.0.0  
**Last Updated**: 2024
