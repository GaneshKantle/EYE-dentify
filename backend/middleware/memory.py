"""Memory cleanup middleware to prevent memory leaks"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import gc

class MemoryCleanupMiddleware(BaseHTTPMiddleware):
    """Middleware to run garbage collection periodically to prevent memory leaks"""
    
    def __init__(self, app, gc_interval: int = 10):
        """
        Args:
            app: FastAPI application
            gc_interval: Run garbage collection every N requests (default: 10)
        """
        super().__init__(app)
        self.gc_interval = gc_interval
        self.request_count = 0
    
    async def dispatch(self, request: Request, call_next):
        """Process request and run GC periodically"""
        try:
            response = await call_next(request)
            return response
        finally:
            # Increment request counter
            self.request_count += 1
            
            # Run garbage collection periodically to prevent memory accumulation
            # Running GC on every request would be too expensive, so we do it every N requests
            if self.request_count % self.gc_interval == 0:
                gc.collect()

