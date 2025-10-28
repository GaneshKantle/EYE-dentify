import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
import traceback
import time
from datetime import datetime

logger = logging.getLogger(__name__)

class APIException(HTTPException):
    """Custom API exception with additional context."""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        self.context = context or {}

class ErrorHandler:
    """Centralized error handling for the application."""
    
    @staticmethod
    def handle_validation_error(error: Exception) -> JSONResponse:
        """Handle validation errors."""
        logger.warning(f"Validation error: {str(error)}")
        return JSONResponse(
            status_code=400,
            content={
                "error": "Validation Error",
                "message": str(error),
                "error_code": "VALIDATION_ERROR",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    @staticmethod
    def handle_database_error(error: Exception) -> JSONResponse:
        """Handle database errors."""
        logger.error(f"Database error: {str(error)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Database Error",
                "message": "An internal database error occurred",
                "error_code": "DATABASE_ERROR",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    @staticmethod
    def handle_cloudinary_error(error: Exception) -> JSONResponse:
        """Handle Cloudinary errors."""
        logger.error(f"Cloudinary error: {str(error)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "File Upload Error",
                "message": "Failed to process image upload",
                "error_code": "UPLOAD_ERROR",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    @staticmethod
    def handle_face_recognition_error(error: Exception) -> JSONResponse:
        """Handle face recognition errors."""
        logger.error(f"Face recognition error: {str(error)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Face Recognition Error",
                "message": "Failed to process face recognition",
                "error_code": "RECOGNITION_ERROR",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    @staticmethod
    def handle_generic_error(error: Exception) -> JSONResponse:
        """Handle generic errors."""
        logger.error(f"Unexpected error: {str(error)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "message": "An unexpected error occurred",
                "error_code": "INTERNAL_ERROR",
                "timestamp": datetime.utcnow().isoformat()
            }
        )

def create_error_response(
    status_code: int,
    message: str,
    error_code: str,
    details: Optional[Dict[str, Any]] = None
) -> JSONResponse:
    """Create a standardized error response."""
    return JSONResponse(
        status_code=status_code,
        content={
            "error": "API Error",
            "message": message,
            "error_code": error_code,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

def log_request(request: Request, response_time: float):
    """Log request details."""
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {getattr(request, 'status_code', 'N/A')} - "
        f"Time: {response_time:.3f}s - "
        f"IP: {request.client.host if request.client else 'unknown'}"
    )

def log_error(error: Exception, request: Optional[Request] = None):
    """Log error with context."""
    context = ""
    if request:
        context = f" - Request: {request.method} {request.url.path}"
    
    logger.error(f"Error: {str(error)}{context}", exc_info=True)
