#!/usr/bin/env python3
"""
Face Recognition Dashboard - Production API Server
Professional forensic investigation system with face recognition capabilities.
"""

import logging
import os
import sys
from contextlib import asynccontextmanager
from typing import Dict, Any

import cloudinary
import torch
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from facenet_pytorch import MTCNN, InceptionResnetV1

from config import settings, logger
from middleware.security import (
    SecurityMiddleware,
    LoggingMiddleware,
    RateLimitMiddleware,
    RequestSizeMiddleware,
    HealthCheckMiddleware
)
from utils.error_handler import ErrorHandler, log_error
from models.schemas import ErrorResponse
from routes.assets import router as assets_router

# Global variables for ML models
mtcnn = None
facenet = None
device = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    global mtcnn, facenet, device
    
    logger.info("Starting Face Recognition API Server...")
    
    try:
        # Initialize ML models
        logger.info("Initializing ML models...")
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {device}")
        
        mtcnn = MTCNN(
            image_size=160,
            margin=0,
            min_face_size=20,
            keep_all=False,
            post_process=True,
            device=device
        )
        
        facenet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
        logger.info("ML models initialized successfully")
        
        # Initialize Cloudinary
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret
        )
        logger.info("Cloudinary configured")
        
        # Test database connection
        client = MongoClient(settings.mongo_uri)
        client.admin.command('ping')
        logger.info("Database connection established")
        
        logger.info("Application startup complete")
        
    except Exception as e:
        logger.error(f"Failed to initialize application: {str(e)}")
        sys.exit(1)
    
    yield
    
    # Cleanup
    logger.info("Shutting down application...")
    if 'client' in locals():
        client.close()
    logger.info("Application shutdown complete")

# Create FastAPI application
app = FastAPI(
    title="Face Recognition Dashboard API",
    description="Professional forensic investigation system with advanced face recognition capabilities",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
    lifespan=lifespan
)

# Add security middleware
app.add_middleware(SecurityMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware, calls_per_minute=settings.rate_limit_per_minute)
app.add_middleware(RequestSizeMiddleware, max_size=10 * 1024 * 1024)  # 10MB
app.add_middleware(HealthCheckMiddleware)

# Add trusted host middleware for production
if settings.environment == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"]  # Configure with actual domains in production
    )

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Include routers
app.include_router(assets_router, prefix="/api/v1")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    log_error(exc, request)
    
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(
                error="HTTP Error",
                message=str(exc.detail),
                error_code=f"HTTP_{exc.status_code}",
                timestamp=str(exc)
            ).dict()
        )
    
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal Server Error",
            message="An unexpected error occurred",
            error_code="INTERNAL_ERROR",
            timestamp=str(exc)
        ).dict()
    )

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.environment,
        "timestamp": "2024-01-01T00:00:00Z"  # This would be actual timestamp
    }

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "message": "Face Recognition Dashboard API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs" if settings.debug else "Documentation disabled in production"
    }

# API endpoints will be added here
@app.get("/api/v1/status", tags=["Status"])
async def api_status():
    """API status endpoint."""
    return {
        "api_version": "v1",
        "status": "operational",
        "features": {
            "face_recognition": True,
            "asset_management": True,
            "database": True,
            "cloud_storage": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting server on {settings.host}:{settings.port}")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug mode: {settings.debug}")
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
        access_log=True
    )
