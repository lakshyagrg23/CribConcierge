"""
Image Upload Service for CribConcierge
Handles JPEG image uploads to MongoDB GridFS with validation and processing
"""

from flask import request, jsonify, Response
from werkzeug.utils import secure_filename
from PIL import Image
import gridfs
import pymongo
from bson import ObjectId
import io
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImageService:
    """
    Flask-based image upload service using MongoDB GridFS
    Replaces the Node.js ImageUploadComponent
    """
    
    def __init__(self, mongo_uri, db_name="imageupload", bucket_name="images"):
        self.mongo_uri = mongo_uri
        self.db_name = db_name
        self.bucket_name = bucket_name
        self.max_file_size = 50 * 1024 * 1024  # 50MB
        self.allowed_extensions = {'jpg', 'jpeg'}
        self.allowed_mime_types = {'image/jpeg', 'image/jpg'}
        
        # Initialize MongoDB connection
        self.client = None
        self.db = None
        self.fs = None
        self.initialized = False
        
    def init(self):
        """Initialize MongoDB connection and GridFS"""
        try:
            self.client = pymongo.MongoClient(
                self.mongo_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=5000
            )
            # Test connection
            self.client.admin.command('ping')
            
            self.db = self.client[self.db_name]
            self.fs = gridfs.GridFS(self.db, collection=self.bucket_name)
            self.initialized = True
            logger.info("✅ Image Service initialized successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to initialize Image Service: {str(e)}")
            raise e
    
    def validate_file(self, file):
        """Validate uploaded file"""
        if not file:
            return False, "No file provided"
            
        if file.filename == '':
            return False, "No file selected"
            
        # Check file extension
        if '.' not in file.filename:
            return False, "File must have an extension"
            
        ext = file.filename.rsplit('.', 1)[1].lower()
        if ext not in self.allowed_extensions:
            return False, "Only JPEG images are allowed"
            
        # Check MIME type
        if file.content_type not in self.allowed_mime_types:
            return False, "Invalid file type. Only JPEG images are allowed"
            
        return True, "Valid file"
    
    def process_image(self, file_data):
        """Process and validate image using Pillow"""
        try:
            # Open image with Pillow
            image = Image.open(io.BytesIO(file_data))
            
            # Verify it's actually a JPEG
            if image.format not in ['JPEG', 'JPG']:
                raise ValueError("File is not a valid JPEG image")
            
            # Get image metadata
            width, height = image.size
            
            # Optional: Compress image (equivalent to Sharp's quality setting)
            if image.mode in ('RGBA', 'LA', 'P'):
                image = image.convert('RGB')
            
            # Save processed image to bytes
            output_buffer = io.BytesIO()
            image.save(output_buffer, format='JPEG', quality=85, optimize=True)
            processed_data = output_buffer.getvalue()
            
            return {
                'data': processed_data,
                'width': width,
                'height': height,
                'format': image.format,
                'original_size': len(file_data),
                'processed_size': len(processed_data)
            }
            
        except Exception as e:
            raise ValueError(f"Image processing failed: {str(e)}")
    
    def save_to_gridfs(self, image_data, filename, metadata=None):
        """Save image to MongoDB GridFS"""
        try:
            if metadata is None:
                metadata = {}
                
            # Add upload metadata
            upload_metadata = {
                'uploadDate': datetime.utcnow(),
                'originalSize': len(image_data),
                'contentType': 'image/jpeg',
                **metadata
            }
            
            # Store in GridFS
            file_id = self.fs.put(
                image_data,
                filename=filename,
                content_type='image/jpeg',
                metadata=upload_metadata
            )
            
            return {
                'fileId': str(file_id),
                'filename': filename,
                'size': len(image_data),
                'uploadDate': upload_metadata['uploadDate'],
                'metadata': upload_metadata
            }
            
        except Exception as e:
            raise Exception(f"Failed to save to GridFS: {str(e)}")
    
    def upload_image(self):
        """Handle single image upload - Flask route handler"""
        try:
            if not self.initialized:
                return jsonify({
                    'success': False,
                    'message': 'Image service not initialized'
                }), 500
            
            # Check if file is in request
            if 'image' not in request.files:
                return jsonify({
                    'success': False,
                    'message': 'No image file in request'
                }), 400
            
            file = request.files['image']
            
            # Validate file
            is_valid, validation_message = self.validate_file(file)
            if not is_valid:
                return jsonify({
                    'success': False,
                    'message': validation_message
                }), 400
            
            # Check file size
            file_data = file.read()
            if len(file_data) > self.max_file_size:
                return jsonify({
                    'success': False,
                    'message': f'File too large. Maximum size is {self.max_file_size // (1024*1024)}MB'
                }), 400
            
            # Process image
            processed_image = self.process_image(file_data)
            
            # Generate unique filename
            timestamp = int(datetime.utcnow().timestamp() * 1000)
            secure_name = secure_filename(file.filename)
            filename = f"{timestamp}_{secure_name}"
            
            # Save to GridFS
            result = self.save_to_gridfs(
                processed_image['data'],
                filename,
                {
                    'originalName': file.filename,
                    'mimetype': file.content_type,
                    'width': processed_image['width'],
                    'height': processed_image['height'],
                    'originalSize': processed_image['original_size'],
                    'processedSize': processed_image['processed_size']
                }
            )
            
            logger.info(f"✅ Image uploaded successfully: {result['fileId']}")
            
            return jsonify({
                'success': True,
                'message': 'Image uploaded successfully',
                'data': result
            }), 200
            
        except ValueError as e:
            logger.error(f"❌ Validation error: {str(e)}")
            return jsonify({
                'success': False,
                'message': str(e)
            }), 400
            
        except Exception as e:
            logger.error(f"❌ Upload error: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Image upload failed'
            }), 500
    
    def get_image(self, image_id):
        """Retrieve image by ID - Flask route handler"""
        try:
            if not self.initialized:
                return jsonify({
                    'success': False,
                    'message': 'Image service not initialized'
                }), 500
            
            # Convert string ID to ObjectId
            try:
                object_id = ObjectId(image_id)
            except:
                return jsonify({
                    'success': False,
                    'message': 'Invalid image ID'
                }), 400
            
            # Get file from GridFS
            try:
                grid_file = self.fs.get(object_id)
            except gridfs.NoFile:
                return jsonify({
                    'success': False,
                    'message': 'Image not found'
                }), 404
            
            # Return image data
            def generate():
                while True:
                    chunk = grid_file.read(1024)
                    if not chunk:
                        break
                    yield chunk
            
            return Response(
                generate(),
                mimetype='image/jpeg',
                headers={
                    'Content-Disposition': f'inline; filename="{grid_file.filename}"',
                    'Content-Length': str(grid_file.length)
                }
            )
            
        except Exception as e:
            logger.error(f"❌ Get image error: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Failed to retrieve image'
            }), 500
    
    def delete_image(self, image_id):
        """Delete image by ID - Flask route handler"""
        try:
            if not self.initialized:
                return jsonify({
                    'success': False,
                    'message': 'Image service not initialized'
                }), 500
            
            # Convert string ID to ObjectId
            try:
                object_id = ObjectId(image_id)
            except:
                return jsonify({
                    'success': False,
                    'message': 'Invalid image ID'
                }), 400
            
            # Delete from GridFS
            try:
                self.fs.delete(object_id)
                logger.info(f"✅ Image deleted successfully: {image_id}")
                
                return jsonify({
                    'success': True,
                    'message': 'Image deleted successfully'
                }), 200
                
            except gridfs.NoFile:
                return jsonify({
                    'success': False,
                    'message': 'Image not found'
                }), 404
                
        except Exception as e:
            logger.error(f"❌ Delete image error: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Failed to delete image'
            }), 500
    
    def list_images(self):
        """List all images with pagination - Flask route handler"""
        try:
            if not self.initialized:
                return jsonify({
                    'success': False,
                    'message': 'Image service not initialized'
                }), 500
            
            # Get pagination parameters
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 10))
            skip = (page - 1) * limit
            
            # Get files from GridFS
            files_cursor = self.fs.find().skip(skip).limit(limit)
            files = list(files_cursor)
            
            # Format response
            formatted_files = []
            for file in files:
                formatted_files.append({
                    'id': str(file._id),
                    'filename': file.filename,
                    'size': file.length,
                    'uploadDate': file.upload_date,
                    'metadata': getattr(file, 'metadata', {})
                })
            
            # Get total count
            total_count = self.fs.find().count()
            
            return jsonify({
                'success': True,
                'data': formatted_files,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': total_count,
                    'totalPages': (total_count + limit - 1) // limit
                }
            }), 200
            
        except Exception as e:
            logger.error(f"❌ List images error: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Failed to retrieve images'
            }), 500
