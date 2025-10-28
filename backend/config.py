import os
import logging
from typing import Optional
from pydantic import BaseSettings, validator
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Database Configuration
    mongo_uri: str
    database_name: str = "face_recognition_db"
    
    # Cloudinary Configuration
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"
    debug: bool = False
    
    # Security
    secret_key: str
    allowed_origins: str = "http://localhost:3000"
    
    # Face Recognition
    recognition_threshold: float = 0.50
    rejection_threshold: float = 0.30
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "logs/app.log"
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    rate_limit_burst: int = 10
    
    @validator('allowed_origins')
    def parse_allowed_origins(cls, v):
        """Parse comma-separated origins into list."""
        return [origin.strip() for origin in v.split(',') if origin.strip()]
    
    @validator('environment')
    def validate_environment(cls, v):
        """Validate environment setting."""
        if v not in ['development', 'staging', 'production']:
            raise ValueError('Environment must be development, staging, or production')
        return v
    
    @validator('debug')
    def set_debug_from_environment(cls, v, values):
        """Set debug based on environment if not explicitly set."""
        if 'environment' in values:
            return values['environment'] == 'development'
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

# Global settings instance
settings = get_settings()

# Configure logging
def setup_logging():
    """Configure application logging."""
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    
    # Create logs directory if it doesn't exist
    os.makedirs(os.path.dirname(settings.log_file), exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(settings.log_file),
            logging.StreamHandler()
        ]
    )
    
    # Set specific loggers
    logging.getLogger("uvicorn").setLevel(log_level)
    logging.getLogger("fastapi").setLevel(log_level)
    logging.getLogger("pymongo").setLevel(logging.WARNING)
    logging.getLogger("cloudinary").setLevel(logging.WARNING)

# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)
