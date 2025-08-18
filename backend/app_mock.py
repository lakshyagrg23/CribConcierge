"""
Modified Flask App for Testing Without MongoDB
This version will run without MongoDB for initial testing
"""

import sys
import json
import os
from dotenv import load_dotenv
import re
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=['http://localhost:8080', 'http://localhost:3000'])

# Mock data storage (for testing without MongoDB)
mock_images = {}
mock_properties = []

# ==================== MOCK IMAGE ROUTES ====================

@app.route("/api/upload", methods=['POST'])
def upload_image():
    """Mock image upload for testing"""
    try:
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No image file in request'
            }), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400
        
        # Mock successful upload
        import uuid
        file_id = str(uuid.uuid4())
        mock_images[file_id] = {
            'filename': file.filename,
            'size': len(file.read()),
            'content_type': file.content_type
        }
        
        return jsonify({
            'success': True,
            'message': 'Image uploaded successfully (MOCK)',
            'data': {
                'fileId': file_id,
                'filename': file.filename,
                'size': mock_images[file_id]['size']
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Upload failed: {str(e)}'
        }), 500

@app.route("/api/images/<image_id>", methods=['GET'])
def get_image(image_id):
    """Mock image retrieval"""
    if image_id in mock_images:
        return jsonify({
            'success': True,
            'message': 'Image found (MOCK)',
            'data': mock_images[image_id]
        }), 200
    else:
        return jsonify({
            'success': False,
            'message': 'Image not found'
        }), 404

@app.route("/api/images", methods=['GET'])
def list_images():
    """Mock image listing"""
    return jsonify({
        'success': True,
        'data': [
            {'id': k, **v} for k, v in mock_images.items()
        ],
        'pagination': {
            'page': 1,
            'limit': 10,
            'total': len(mock_images)
        }
    }), 200

# ==================== MOCK AI ROUTES ====================

@app.route("/api/addListing", methods=['POST'])
def add_listing():
    """Mock property listing for testing"""
    data = request.get_json()
    try:
        property_data = {
            'id': len(mock_properties) + 1,
            'propertyName': data.get('propertyName', ''),
            'propertyAddress': data.get('propertyAddress', ''),
            'propertyCostRange': data.get('propertyCostRange', ''),
            'description': data.get('description', ''),
            'roomPhotoId': data.get('roomPhotoId'),
            'bathroomPhotoId': data.get('bathroomPhotoId'),
            'drawingRoomPhotoId': data.get('drawingRoomPhotoId'),
            'kitchenPhotoId': data.get('kitchenPhotoId')
        }
        
        mock_properties.append(property_data)
        
        return jsonify({
            "msg": "Success (MOCK)", 
            "propertyId": f"property_{len(mock_properties)}",
            "imageIds": {
                "room": data.get('roomPhotoId'),
                "bathroom": data.get('bathroomPhotoId'),
                "drawingRoom": data.get('drawingRoomPhotoId'),
                "kitchen": data.get('kitchenPhotoId')
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/askIt", methods=["GET"])
def ask_question():
    """Mock AI chat for testing"""
    question = request.args.get("question")
    
    if not question:
        return jsonify({"error": "No question provided"}), 400
        
    # Mock AI response
    mock_responses = {
        "hello": "Hello! I'm your real estate assistant. I can help you find properties, answer questions about listings, and provide property recommendations.",
        "properties": f"I found {len(mock_properties)} properties in our database. Here are some great options for you!",
        "default": f"Thank you for your question: '{question}'. This is a mock response since the AI system is not yet connected. Once MongoDB is set up, I'll be able to provide detailed property information and recommendations."
    }
    
    # Simple response logic
    response = mock_responses.get("default")
    if "hello" in question.lower():
        response = mock_responses["hello"]
    elif "property" in question.lower() or "properties" in question.lower():
        response = mock_responses["properties"]
    
    return jsonify({"answer": response}), 200

# ==================== HEALTH CHECK ROUTES ====================

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "mode": "MOCK - MongoDB not connected",
        "services": {
            "image_service": "MOCK",
            "ai_service": "MOCK",
            "mongodb": "DISCONNECTED"
        },
        "message": "Backend is running in mock mode. Set up MongoDB to enable full functionality."
    }), 200

@app.route("/", methods=["GET"])
def root():
    """Root endpoint with API information"""
    return jsonify({
        "name": "CribConcierge Backend API",
        "version": "2.0.0-MOCK",
        "description": "Mock mode - MongoDB not connected",
        "endpoints": {
            "images": {
                "upload": "POST /api/upload",
                "get": "GET /api/images/{id}",
                "list": "GET /api/images"
            },
            "ai": {
                "add_listing": "POST /api/addListing",
                "ask_question": "GET /api/askIt?question={query}"
            },
            "health": "GET /api/health"
        },
        "frontend_url": "http://localhost:8080",
        "setup_mongodb": "See TROUBLESHOOTING.md for MongoDB setup"
    }), 200

# Legacy routes for backward compatibility
@app.route("/addListing", methods=['POST'])
def add_listing_legacy():
    return add_listing()

@app.route("/askIt", methods=["GET"])
def ask_question_legacy():
    return ask_question()

@app.route("/image/<image_id>", methods=['GET'])
def get_image_legacy(image_id):
    return get_image(image_id)

if __name__ == "__main__":
    print("🚀 Starting CribConcierge Backend in MOCK MODE...")
    print("⚠️  MongoDB is not connected - using mock data")
    print("📖 See TROUBLESHOOTING.md for MongoDB setup instructions")
    print("🌐 Backend API running on http://localhost:5090")
    
    # Configure Flask for file uploads
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=5090,
        debug=True,
        threaded=True
    )
