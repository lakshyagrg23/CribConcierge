#!/usr/bin/env python3

"""
Simplified Flask Backend for Testing Image Upload Integration
This version doesn't require LangChain dependencies for basic testing
"""

import json
import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# In-memory storage for testing (replace with database in production)
property_listings = []

@app.route("/addListing", methods=['POST'])
def add_listing():
    """Add a property listing with image IDs"""
    try:
        data = request.get_json()
        
        # Extract property data and image IDs
        property_data = {
            'id': len(property_listings) + 1,
            'propertyName': data.get('propertyName', ''),
            'propertyAddress': data.get('propertyAddress', ''),
            'propertyCostRange': data.get('propertyCostRange', ''),
            'description': data.get('description', ''),
            'roomPhotoId': data.get('roomPhotoId'),
            'bathroomPhotoId': data.get('bathroomPhotoId'),
            'drawingRoomPhotoId': data.get('drawingRoomPhotoId'),
            'kitchenPhotoId': data.get('kitchenPhotoId')
        }
        
        # Store the listing
        property_listings.append(property_data)
        
        print(f"✅ Added property listing: {property_data['propertyName']}")
        print(f"📄 Property details: {json.dumps(property_data, indent=2)}")
        
        return jsonify({
            "msg": "Success", 
            "propertyId": f"property_{property_data['id']}",
            "data": property_data,
            "imageIds": {
                "room": property_data['roomPhotoId'],
                "bathroom": property_data['bathroomPhotoId'],
                "drawingRoom": property_data['drawingRoomPhotoId'],
                "kitchen": property_data['kitchenPhotoId']
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error in addListing: {str(e)}")
        return jsonify({"error": str(e)}), 400

@app.route("/getListings", methods=['GET'])
def get_listings():
    """Get all property listings"""
    return jsonify({
        "success": True,
        "count": len(property_listings),
        "listings": property_listings
    }), 200

@app.route("/askIt", methods=["GET"])
def ask_question():
    """Simple Q&A about properties (simplified version for testing)"""
    question = request.args.get("question", "")
    
    if not question:
        return jsonify({"answer": "Please provide a question."}), 400
    
    try:
        # Simple response based on stored property data
        if property_listings:
            last_property = property_listings[-1]
            
            if "cost" in question.lower() or "price" in question.lower():
                answer = f"The property '{last_property['propertyName']}' is priced at ₹{last_property['propertyCostRange']}."
            elif "address" in question.lower() or "location" in question.lower():
                answer = f"The property is located at {last_property['propertyAddress']}."
            elif "photo" in question.lower() or "image" in question.lower():
                photo_count = sum(1 for photo_id in [
                    last_property['roomPhotoId'],
                    last_property['bathroomPhotoId'], 
                    last_property['drawingRoomPhotoId'],
                    last_property['kitchenPhotoId']
                ] if photo_id)
                answer = f"The property '{last_property['propertyName']}' has {photo_count} uploaded photos. You can view them using the image service."
            else:
                answer = f"Here's information about '{last_property['propertyName']}': {last_property['description']} Located at {last_property['propertyAddress']} for ₹{last_property['propertyCostRange']}."
        else:
            answer = "No property listings found. Please add a property first."
        
        print(f"🤖 Question: {question}")
        print(f"🤖 Answer: {answer}")
        
        return jsonify({"answer": answer})
        
    except Exception as err:
        print(f"❌ Error in askIt: {str(err)}")
        return jsonify({"answer": "Sorry, I couldn't process your question."})

@app.route("/getImage/<image_id>", methods=["GET"])
def get_image(image_id):
    """Proxy endpoint to retrieve images from the Node.js image service"""
    try:
        print(f"🖼️ Requesting image: {image_id}")
        
        # Forward the request to the Node.js image service
        response = requests.get(f"http://localhost:3000/image/{image_id}")
        
        if response.status_code == 200:
            print(f"✅ Image retrieved successfully: {image_id}")
            return response.content, 200, {
                'Content-Type': response.headers.get('Content-Type', 'image/jpeg')
            }
        else:
            print(f"❌ Image not found: {image_id}")
            return jsonify({"error": "Image not found"}), 404
            
    except Exception as e:
        print(f"❌ Failed to retrieve image {image_id}: {str(e)}")
        return jsonify({"error": f"Failed to retrieve image: {str(e)}"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Flask Backend (Test Mode)",
        "listings_count": len(property_listings)
    }), 200

if __name__ == "__main__":
    print("🚀 Starting Flask Backend (Test Mode) on port 5090...")
    print("📋 Available endpoints:")
    print("  POST /addListing - Add property with image IDs")
    print("  GET /getListings - Get all properties")
    print("  GET /askIt?question=... - Ask about properties")
    print("  GET /getImage/<id> - Get image via proxy")
    print("  GET /health - Health check")
    print("=" * 50)
    
    app.run(host='localhost', port=5090, debug=True)
