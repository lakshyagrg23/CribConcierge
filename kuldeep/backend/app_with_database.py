import os
import json
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

# MongoDB Setup
class PropertyDatabase:
    def __init__(self, mongodb_uri="mongodb://localhost:27017", db_name="imageupload"):
        self.client = MongoClient(mongodb_uri)
        self.db = self.client[db_name]
        self.properties = self.db.properties  # Properties collection
        
    def add_property(self, property_data):
        """Add a new property to the database"""
        property_data['created_at'] = datetime.utcnow()
        property_data['updated_at'] = datetime.utcnow()
        result = self.properties.insert_one(property_data)
        return str(result.inserted_id)
    
    def get_all_properties(self):
        """Get all properties from database"""
        properties = list(self.properties.find())
        # Convert ObjectId to string for JSON serialization
        for prop in properties:
            prop['_id'] = str(prop['_id'])
        return properties
    
    def get_property_by_id(self, property_id):
        """Get a specific property by ID"""
        try:
            if ObjectId.is_valid(property_id):
                property_data = self.properties.find_one({"_id": ObjectId(property_id)})
            else:
                property_data = self.properties.find_one({"propertyId": property_id})
            
            if property_data:
                property_data['_id'] = str(property_data['_id'])
            return property_data
        except Exception:
            return None
    
    def update_property(self, property_id, update_data):
        """Update a property"""
        update_data['updated_at'] = datetime.utcnow()
        result = self.properties.update_one(
            {"_id": ObjectId(property_id)}, 
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    def delete_property(self, property_id):
        """Delete a property"""
        result = self.properties.delete_one({"_id": ObjectId(property_id)})
        return result.deleted_count > 0

# Initialize Flask app and database
app = Flask(__name__)
CORS(app)
db = PropertyDatabase()

@app.route("/addListing", methods=['POST'])
def add_listing():
    """Add a property listing with image IDs to MongoDB"""
    try:
        data = request.get_json()
        
        # Create property document
        property_data = {
            'propertyName': data.get('propertyName', ''),
            'propertyAddress': data.get('propertyAddress', ''),
            'propertyCostRange': data.get('propertyCostRange', ''),
            'description': data.get('description', ''),
            'roomPhotoId': data.get('roomPhotoId'),
            'bathroomPhotoId': data.get('bathroomPhotoId'),
            'drawingRoomPhotoId': data.get('drawingRoomPhotoId'),
            'kitchenPhotoId': data.get('kitchenPhotoId'),
            'bedrooms': data.get('bedrooms', 2),
            'bathrooms': data.get('bathrooms', 1),
            'area': data.get('area', ''),
            'features': data.get('features', []),
            'status': 'active'
        }
        
        # Add to MongoDB
        property_id = db.add_property(property_data)
        property_data['propertyId'] = property_id
        
        print(f"✅ Added property to MongoDB: {property_data['propertyName']}")
        print(f"📄 Property ID: {property_id}")
        
        return jsonify({
            "msg": "Success", 
            "propertyId": property_id,
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
    """Get all property listings from MongoDB"""
    try:
        properties = db.get_all_properties()
        
        # Transform data for frontend compatibility
        formatted_properties = []
        for prop in properties:
            formatted_prop = {
                "id": prop['_id'],
                "title": prop.get('propertyName', ''),
                "price": f"₹{prop.get('propertyCostRange', '')}",
                "location": prop.get('propertyAddress', ''),
                "bedrooms": prop.get('bedrooms', 2),
                "bathrooms": prop.get('bathrooms', 1),
                "area": prop.get('area', ''),
                "features": prop.get('features', []),
                "roomPhotoId": prop.get('roomPhotoId'),
                "bathroomPhotoId": prop.get('bathroomPhotoId'),
                "drawingRoomPhotoId": prop.get('drawingRoomPhotoId'),
                "kitchenPhotoId": prop.get('kitchenPhotoId'),
                "description": prop.get('description', ''),
                "created_at": prop.get('created_at'),
                "updated_at": prop.get('updated_at')
            }
            formatted_properties.append(formatted_prop)
        
        print(f"📊 Retrieved {len(formatted_properties)} properties from database")
        
        return jsonify({
            "success": True,
            "count": len(formatted_properties),
            "properties": formatted_properties
        }), 200
        
    except Exception as e:
        print(f"❌ Error in getListings: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/getProperty/<property_id>", methods=['GET'])
def get_property(property_id):
    """Get a specific property by ID"""
    try:
        property_data = db.get_property_by_id(property_id)
        
        if not property_data:
            return jsonify({"error": "Property not found"}), 404
        
        # Format for frontend
        formatted_property = {
            "id": property_data['_id'],
            "propertyName": property_data.get('propertyName', ''),
            "propertyAddress": property_data.get('propertyAddress', ''),
            "propertyCostRange": property_data.get('propertyCostRange', ''),
            "roomPhotoId": property_data.get('roomPhotoId'),
            "bathroomPhotoId": property_data.get('bathroomPhotoId'),
            "drawingRoomPhotoId": property_data.get('drawingRoomPhotoId'),
            "kitchenPhotoId": property_data.get('kitchenPhotoId'),
            "description": property_data.get('description', ''),
            "bedrooms": property_data.get('bedrooms', 2),
            "bathrooms": property_data.get('bathrooms', 1),
            "area": property_data.get('area', ''),
            "features": property_data.get('features', [])
        }
        
        return jsonify({
            "success": True,
            "property": formatted_property
        }), 200
        
    except Exception as e:
        print(f"❌ Error in getProperty: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/askIt", methods=["GET"])
def ask_question():
    """Simple Q&A about properties from database"""
    question = request.args.get("question", "")
    
    if not question:
        return jsonify({"answer": "Please provide a question."}), 400
    
    try:
        properties = db.get_all_properties()
        
        if not properties:
            answer = "No property listings found in the database. Please add properties first."
        else:
            latest_property = properties[-1]  # Get most recent property
            
            if "cost" in question.lower() or "price" in question.lower():
                answer = f"The latest property '{latest_property['propertyName']}' is priced at ₹{latest_property['propertyCostRange']}."
            elif "address" in question.lower() or "location" in question.lower():
                answer = f"The property is located at {latest_property['propertyAddress']}."
            elif "photo" in question.lower() or "image" in question.lower():
                photo_count = sum(1 for photo_id in [
                    latest_property.get('roomPhotoId'),
                    latest_property.get('bathroomPhotoId'), 
                    latest_property.get('drawingRoomPhotoId'),
                    latest_property.get('kitchenPhotoId')
                ] if photo_id)
                answer = f"The property '{latest_property['propertyName']}' has {photo_count} uploaded photos available for VR tour viewing."
            elif "count" in question.lower() or "how many" in question.lower():
                answer = f"We currently have {len(properties)} properties in our database."
            else:
                answer = f"**{latest_property['propertyName']}**\\n\\nLocation: {latest_property['propertyAddress']}\\nPrice: ₹{latest_property['propertyCostRange']}\\n\\n{latest_property.get('description', 'Contact us for more details!')}"
        
        print(f"🤖 Question: {question}")
        print(f"🤖 Answer: {answer}")
        
        return jsonify({"answer": answer}), 200
        
    except Exception as e:
        print(f"❌ Error in askIt: {str(e)}")
        return jsonify({"answer": "Sorry, I encountered an error processing your question."}), 500

@app.route("/getImage/<image_id>", methods=["GET"])
def get_image(image_id):
    """Proxy endpoint to retrieve images from the Node.js image service"""
    try:
        response = requests.get(f"http://localhost:3000/images/{image_id}")
        
        if response.status_code == 200:
            return response.content, 200, {'Content-Type': response.headers.get('Content-Type', 'image/jpeg')}
        else:
            return jsonify({"error": "Image not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve image: {str(e)}"}), 500

if __name__ == "__main__":
    print("🚀 Starting Property Database API Server...")
    print("📊 MongoDB Connection: mongodb://localhost:27017/imageupload")
    print("📁 Collection: properties")
    print("🌐 Server: http://localhost:5090")
    app.run(port=5090, debug=True)
