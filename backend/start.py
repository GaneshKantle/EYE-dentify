#!/usr/bin/env python3
"""
Start script for Render deployment
This is a simple wrapper around uvicorn - you can also use uvicorn directly
"""
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
