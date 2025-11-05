#!/usr/bin/env python3
"""
Start script for Render deployment
This is a simple wrapper around uvicorn - you can also use uvicorn directly
"""
import os
import sys
import uvicorn

if __name__ == "__main__":
    # Get port from environment variable (Render provides this)
    port = int(os.environ.get("PORT", 8000))
    
    print(f"Starting server on 0.0.0.0:{port}")
    print(f"Environment: {os.environ.get('ENVIRONMENT', 'production')}")
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=port,
            log_level="info",
            access_log=True
        )
    except Exception as e:
        print(f"Error starting server: {e}", file=sys.stderr)
        sys.exit(1)
