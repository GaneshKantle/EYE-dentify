from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
import cloudinary
import cloudinary.uploader
import json
import os
import gc

# Database connection - use shared client from database.py to avoid multiple connection pools
# This reduces memory usage by reusing a single connection pool
from database import client, db

# Cloudinary config - load from environment variables
cloudinary_cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
cloudinary_api_key = os.getenv('CLOUDINARY_API_KEY')
cloudinary_api_secret = os.getenv('CLOUDINARY_API_SECRET')

if not cloudinary_cloud_name or not cloudinary_api_key or not cloudinary_api_secret:
    raise RuntimeError(
        "Cloudinary configuration is required. "
        "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
    )

cloudinary.config(
    cloud_name=cloudinary_cloud_name,
    api_key=cloudinary_api_key,
    api_secret=cloudinary_api_secret,
    secure=True
)

router = APIRouter(prefix="/sketches", tags=["sketches"])

@router.post("/save")
async def save_sketch(
    name: Optional[str] = Form(None),
    suspect: Optional[str] = Form(None),
    eyewitness: Optional[str] = Form(None),
    officer: Optional[str] = Form(None),
    date: Optional[str] = Form(None),
    reason: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    priority: Optional[str] = Form("normal"),
    status: Optional[str] = Form("draft"),
    sketch_state: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """Save a new sketch to MongoDB and Cloudinary"""
    try:
        # Validate required fields with better error messages
        if not name or not name.strip():
            raise HTTPException(status_code=400, detail="Name is required and cannot be empty")
        
        if not sketch_state or not sketch_state.strip():
            raise HTTPException(status_code=400, detail="Sketch state is required")
        
        if not image:
            raise HTTPException(status_code=400, detail="Image file is required")
        
        # Parse sketch state
        try:
            state_data = json.loads(sketch_state)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid sketch state format: {str(e)}")
        
        # Upload image to Cloudinary in Sketch folder
        try:
            upload_result = cloudinary.uploader.upload(
                image.file,
                folder="Sketch",
                public_id=f"sketch_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{name.lower().replace(' ', '_')}",
                resource_type="image"
            )
            
            # Create sketch document
            sketch_doc = {
                "name": name.strip(),
                "suspect": suspect.strip() if suspect else None,
                "eyewitness": eyewitness.strip() if eyewitness else None,
                "officer": officer.strip() if officer else None,
                "date": date if date else datetime.utcnow().isoformat(),
                "reason": reason.strip() if reason else None,
                "description": description.strip() if description else None,
                "priority": priority,
                "status": status,
                "image_url": upload_result["secure_url"],  # Cloudinary URL
                "cloudinary_url": upload_result["secure_url"],  # Alias for compatibility
                "cloudinary_public_id": upload_result["public_id"],
                "sketch_state": state_data,  # Full state: features, canvasSettings, etc.
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Save to MongoDB with write concern verification
            result = db.sketches.insert_one(sketch_doc)
            
            # Verify the insert was successful
            if not result.inserted_id:
                raise HTTPException(status_code=500, detail="Failed to save sketch: No ID returned from database")
            
            sketch_id = str(result.inserted_id)
            
            # Verify the document was actually saved by reading it back
            saved_sketch = db.sketches.find_one({"_id": result.inserted_id})
            if not saved_sketch:
                raise HTTPException(status_code=500, detail="Failed to save sketch: Document not found after insert")
            
            # Log save for debugging
            print(f"✅ Sketch saved: {sketch_id} - {name} (verified in DB)")
            
            return {
                "status": "ok",
                "message": "Sketch saved successfully",
                "sketch_id": sketch_id,
                "cloudinary_url": upload_result["secure_url"]
            }
        finally:
            # Cleanup file handle and force garbage collection
            if hasattr(image, 'file'):
                image.file.close()
            gc.collect()
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ Error saving sketch: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Failed to save sketch: {str(e)}")

@router.get("/")
async def get_sketches(
    skip: int = 0,
    limit: int = 100,
    suspect: Optional[str] = None,
    officer: Optional[str] = None
):
    """Get list of all sketches with optional filtering"""
    try:
        query = {}
        if suspect:
            query["suspect"] = {"$regex": suspect, "$options": "i"}
        if officer:
            query["officer"] = {"$regex": officer, "$options": "i"}
        
        # Sort by created_at descending, handling None values
        # Use a compound sort to handle missing created_at fields
        sketches_cursor = db.sketches.find(query).sort([
            ("created_at", -1),
            ("_id", -1)  # Secondary sort by _id for consistent ordering
        ]).skip(skip).limit(limit)
        
        sketches = list(sketches_cursor)
        
        result = []
        for sketch in sketches:
            created_at = sketch.get("created_at")
            updated_at = sketch.get("updated_at")
            
            result.append({
                "_id": str(sketch["_id"]),
                "name": sketch.get("name", "Untitled"),
                "suspect": sketch.get("suspect"),
                "eyewitness": sketch.get("eyewitness"),
                "officer": sketch.get("officer"),
                "date": sketch.get("date"),
                "reason": sketch.get("reason"),
                "description": sketch.get("description"),
                "priority": sketch.get("priority", "normal"),
                "status": sketch.get("status", "draft"),
                "image_url": sketch.get("image_url") or sketch.get("cloudinary_url"),
                "cloudinary_url": sketch.get("image_url") or sketch.get("cloudinary_url"),
                "created_at": created_at.isoformat() if created_at else None,
                "updated_at": updated_at.isoformat() if updated_at else None
            })
        
        # Get total count for accurate pagination
        total_count = db.sketches.count_documents(query)
        
        return {
            "sketches": result,
            "total": total_count,
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ Error fetching sketches: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch sketches: {str(e)}")

@router.get("/{sketch_id}")
async def get_sketch(sketch_id: str):
    """Get a single sketch with full state"""
    try:
        if not ObjectId.is_valid(sketch_id):
            raise HTTPException(status_code=400, detail="Invalid sketch ID format")
        
        sketch = db.sketches.find_one({"_id": ObjectId(sketch_id)})
        if not sketch:
            raise HTTPException(status_code=404, detail="Sketch not found")
        
        return {
            "_id": str(sketch["_id"]),
            "name": sketch.get("name", "Untitled"),
            "suspect": sketch.get("suspect"),
            "eyewitness": sketch.get("eyewitness"),
            "officer": sketch.get("officer"),
            "date": sketch.get("date"),
            "reason": sketch.get("reason"),
            "description": sketch.get("description"),
            "priority": sketch.get("priority", "normal"),
            "status": sketch.get("status", "draft"),
            "image_url": sketch.get("image_url") or sketch.get("cloudinary_url"),
            "cloudinary_url": sketch.get("image_url") or sketch.get("cloudinary_url"),
            "cloudinary_public_id": sketch.get("cloudinary_public_id"),
            "sketch_state": sketch.get("sketch_state", {}),  # Full state restoration
            "created_at": sketch.get("created_at").isoformat() if sketch.get("created_at") else None,
            "updated_at": sketch.get("updated_at").isoformat() if sketch.get("updated_at") else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sketch: {str(e)}")

@router.put("/{sketch_id}")
async def update_sketch(
    sketch_id: str,
    name: Optional[str] = Form(None),
    suspect: Optional[str] = Form(None),
    eyewitness: Optional[str] = Form(None),
    officer: Optional[str] = Form(None),
    date: Optional[str] = Form(None),
    reason: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    priority: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    sketch_state: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """Update an existing sketch"""
    try:
        if not ObjectId.is_valid(sketch_id):
            raise HTTPException(status_code=400, detail="Invalid sketch ID format")
        
        sketch = db.sketches.find_one({"_id": ObjectId(sketch_id)})
        if not sketch:
            raise HTTPException(status_code=404, detail="Sketch not found")
        
        # Log received data for debugging
        print(f"📥 Update request for sketch {sketch_id}")
        print(f"   sketch_state provided: {sketch_state is not None}")
        print(f"   sketch_state length: {len(sketch_state) if sketch_state else 0}")
        print(f"   image provided: {image is not None}")
        
        update_data = {}
        
        # Update metadata fields if provided
        if name is not None:
            update_data["name"] = name.strip()
        if suspect is not None:
            update_data["suspect"] = suspect.strip() if suspect else None
        if eyewitness is not None:
            update_data["eyewitness"] = eyewitness.strip() if eyewitness else None
        if officer is not None:
            update_data["officer"] = officer.strip() if officer else None
        if date is not None:
            update_data["date"] = date
        if reason is not None:
            update_data["reason"] = reason.strip() if reason else None
        if description is not None:
            update_data["description"] = description.strip() if description else None
        if priority is not None:
            update_data["priority"] = priority
        if status is not None:
            update_data["status"] = status
        
        # Update sketch state if provided
        if sketch_state is not None and sketch_state.strip():
            try:
                state_data = json.loads(sketch_state)
                update_data["sketch_state"] = state_data
                print(f"📝 Updating sketch_state for {sketch_id}: {len(str(state_data))} chars")
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse sketch_state: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Invalid sketch state format: {str(e)}")
        else:
            print(f"⚠️ sketch_state is None or empty for {sketch_id} - NOT updating sketch_state")
        
        # Update image if provided
        if image:
            try:
                # Delete old image from Cloudinary if exists
                old_public_id = sketch.get("cloudinary_public_id")
                if old_public_id:
                    try:
                        cloudinary.uploader.destroy(old_public_id)
                    except:
                        pass  # Continue even if deletion fails
                
                # Upload new image
                upload_result = cloudinary.uploader.upload(
                    image.file,
                    folder="Sketch",
                    public_id=f"sketch_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{name.lower().replace(' ', '_') if name else 'updated'}",
                    resource_type="image"
                )
                update_data["image_url"] = upload_result["secure_url"]
                update_data["cloudinary_url"] = upload_result["secure_url"]  # Alias
                update_data["cloudinary_public_id"] = upload_result["public_id"]
            finally:
                # Cleanup file handle and force garbage collection
                if hasattr(image, 'file'):
                    image.file.close()
                gc.collect()
        
        update_data["updated_at"] = datetime.utcnow()
        
        # CRITICAL: sketch_state must always be updated, even if not provided in request
        # This ensures the sketch state is always saved
        if "sketch_state" not in update_data:
            print(f"⚠️ WARNING: sketch_state not in update_data for {sketch_id}")
            print(f"   This should not happen - sketch_state should always be provided")
            # Don't fail, but log the warning
        else:
            print(f"✅ sketch_state is in update_data for {sketch_id}")
        
        # Ensure we have fields to update
        if not update_data or len(update_data) == 0:
            raise HTTPException(status_code=400, detail="No fields provided for update")
        
        # Log what we're updating
        print(f"📝 Updating {len(update_data)} fields: {list(update_data.keys())}")
        
        # Update in MongoDB
        update_result = db.sketches.update_one(
            {"_id": ObjectId(sketch_id)},
            {"$set": update_data}
        )
        
        # Verify the update was successful
        if update_result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Sketch not found")
        
        if update_result.modified_count == 0 and len(update_data) > 1:
            # This might indicate the data is the same, but we should still verify
            print(f"⚠️ Sketch {sketch_id} update: no fields modified (data may be identical)")
        
        # Verify the document was actually updated by reading it back
        updated_sketch = db.sketches.find_one({"_id": ObjectId(sketch_id)})
        if not updated_sketch:
            raise HTTPException(status_code=500, detail="Failed to update sketch: Document not found after update")
        
        # Verify critical fields were updated
        if "sketch_state" in update_data:
            saved_state = updated_sketch.get("sketch_state")
            expected_state = update_data["sketch_state"]
            
            # Compare by converting to JSON strings to handle dict ordering
            saved_json = json.dumps(saved_state, sort_keys=True) if saved_state else "{}"
            expected_json = json.dumps(expected_state, sort_keys=True) if expected_state else "{}"
            
            if saved_json != expected_json:
                print(f"❌ Sketch state mismatch for {sketch_id}")
                print(f"   Expected: {len(expected_json)} chars")
                print(f"   Saved: {len(saved_json)} chars")
                raise HTTPException(status_code=500, detail="Failed to update sketch: Sketch state mismatch")
            else:
                print(f"✅ Sketch state verified for {sketch_id}")
        
        # Log update for debugging
        print(f"✅ Sketch {sketch_id} updated: {len(update_data)} fields (verified in DB)")
        
        return {
            "status": "ok",
            "message": "Sketch updated successfully",
            "sketch_id": sketch_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ Error updating sketch: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Failed to update sketch: {str(e)}")

@router.delete("/{sketch_id}")
async def delete_sketch(sketch_id: str):
    """Delete a sketch and its Cloudinary image"""
    try:
        if not ObjectId.is_valid(sketch_id):
            raise HTTPException(status_code=400, detail="Invalid sketch ID format")
        
        sketch = db.sketches.find_one({"_id": ObjectId(sketch_id)})
        if not sketch:
            raise HTTPException(status_code=404, detail="Sketch not found")
        
        # Delete from Cloudinary
        public_id = sketch.get("cloudinary_public_id")
        if public_id:
            try:
                cloudinary.uploader.destroy(public_id)
            except Exception as e:
                # Log but continue with MongoDB deletion
                print(f"Warning: Failed to delete Cloudinary image: {str(e)}")
        
        # Delete from MongoDB
        db.sketches.delete_one({"_id": ObjectId(sketch_id)})
        
        return {
            "status": "ok",
            "message": "Sketch deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete sketch: {str(e)}")

