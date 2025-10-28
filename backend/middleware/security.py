import logging
from typing import Dict, Any, Optional
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class SecurityMiddleware(BaseHTTPMiddleware):
    """Security middleware for production deployment."""
    
    async def dispatch(self, request: Request, call_next):
        # Add security headers
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Remove server header
        if "server" in response.headers:
            del response.headers["server"]
        
        return response

class LoggingMiddleware(BaseHTTPMiddleware):
    """Request logging middleware."""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url.path}")
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log response
            logger.info(
                f"Response: {response.status_code} - "
                f"Time: {process_time:.3f}s - "
                f"Path: {request.url.path}"
            )
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"Error: {str(e)} - "
                f"Time: {process_time:.3f}s - "
                f"Path: {request.url.path}",
                exc_info=True
            )
            raise

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware."""
    
    def __init__(self, app, calls_per_minute: int = 60):
        super().__init__(app)
        self.calls_per_minute = calls_per_minute
        self.clients: Dict[str, list] = {}
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean old entries
        if client_ip in self.clients:
            self.clients[client_ip] = [
                timestamp for timestamp in self.clients[client_ip]
                if current_time - timestamp < 60
            ]
        else:
            self.clients[client_ip] = []
        
        # Check rate limit
        if len(self.clients[client_ip]) >= self.calls_per_minute:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate Limit Exceeded",
                    "message": f"Too many requests. Limit: {self.calls_per_minute} per minute",
                    "retry_after": 60
                }
            )
        
        # Add current request
        self.clients[client_ip].append(current_time)
        
        response = await call_next(request)
        return response

class RequestSizeMiddleware(BaseHTTPMiddleware):
    """Middleware to limit request size."""
    
    def __init__(self, app, max_size: int = 10 * 1024 * 1024):  # 10MB default
        super().__init__(app)
        self.max_size = max_size
    
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        
        if content_length and int(content_length) > self.max_size:
            logger.warning(f"Request too large: {content_length} bytes")
            return JSONResponse(
                status_code=413,
                content={
                    "error": "Request Too Large",
                    "message": f"Request size exceeds maximum allowed size of {self.max_size} bytes"
                }
            )
        
        return await call_next(request)

class HealthCheckMiddleware(BaseHTTPMiddleware):
    """Health check middleware."""
    
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/health":
            return JSONResponse(
                status_code=200,
                content={
                    "status": "healthy",
                    "timestamp": datetime.utcnow().isoformat(),
                    "version": "1.0.0"
                }
            )
        
        return await call_next(request)
