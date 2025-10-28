import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
from typing import Dict, Any, Optional
import os

class CloudinaryService:
    def __init__(self):
        cloudinary.config(
            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
            api_key=os.getenv('CLOUDINARY_API_KEY'),
            api_secret=os.getenv('CLOUDINARY_API_SECRET')
        )
    
    async def upload_asset(self, file, category: str, name: str) -> Dict[str, Any]:
        try:
            # Upload with folder structure
            result = cloudinary.uploader.upload(
                file,
                folder=f"forensic-assets/{category}",
                public_id=f"{name.lower().replace(' ', '-')}",
                resource_type="image",
                transformation=[
                    {"quality": "auto"},
                    {"fetch_format": "auto"}
                ]
            )
            
            return {
                "url": result['secure_url'],
                "public_id": result['public_id'],
                "width": result['width'],
                "height": result['height'],
                "format": result['format'],
                "file_size": result['bytes']
            }
        except Exception as e:
            raise Exception(f"Cloudinary upload failed: {str(e)}")
    
    async def delete_asset(self, public_id: str) -> bool:
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get('result') == 'ok'
        except Exception as e:
            raise Exception(f"Cloudinary delete failed: {str(e)}")
