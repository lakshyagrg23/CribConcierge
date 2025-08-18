"""
CribConcierge Backend API
Integrated Flask application with AI Chat Assistant and Image Upload Service
"""

import sys
import json
import os
from datetime import datetime
from dotenv import load_dotenv
import re
import requests
from pymongo import MongoClient
from bson import ObjectId
from langchain.text_splitter import CharacterTextSplitter
from langchain.memory import ConversationBufferMemory
from langchain_core.documents import Document
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.embeddings import HuggingFaceEmbeddings
import nltk
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import our image service
from image_service import ImageService
from SYSTEM_PROMPT import PROMPT

# Property Database Class
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

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
except:
    pass

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=['http://localhost:8080', 'http://localhost:3000'])

# Configure Google API
os.environ["GOOGLE_API_KEY"] = os.environ.get("GEMINI_API_KEY", "")

# Initialize AI components
text_splitter = CharacterTextSplitter(
    separator='\n',
    chunk_size=1000,
    chunk_overlap=100
)

model_name = "sentence-transformers/all-MiniLM-L6-v2"
embedder = HuggingFaceEmbeddings(model_name=model_name)
geminiLlm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash", 
    temperature=0.4,
    system_prompt=PROMPT
)

# Global variables for AI chain
chain = None

# Initialize Image Service
mongo_uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/imageupload")
image_service = ImageService(mongo_uri=mongo_uri, db_name="imageupload", bucket_name="images")

# Initialize Property Database
db = PropertyDatabase(mongodb_uri=mongo_uri, db_name="imageupload")

def init_services():
    """Initialize all services"""
    try:
        # Initialize image service
        image_service.init()
        print("✅ Image Service initialized")
        
        # Initialize AI chain with existing properties
        init_ai_chain()
        
        print("✅ CribConcierge Backend ready!")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize services: {str(e)}")
        return False

def init_ai_chain():
    """Initialize AI chain with all properties from database"""
    global chain
    try:
        print("🤖 Initializing AI system with database properties...")
        
        # Get all properties from database
        properties = db.get_all_properties()
        print(f"📊 Found {len(properties)} properties in database")
        
        if len(properties) == 0:
            print("⚠️  No properties found in database. AI will work with empty context.")
            chain = None
            return
        
        # Build comprehensive content from all properties
        all_properties_content = "Available Properties:\n\n"
        
        for i, prop in enumerate(properties, 1):
            property_content = f"""
Property {i}:
- Name: {prop.get('propertyName', 'N/A')}
- Address: {prop.get('propertyAddress', 'N/A')}
- Price: ₹{prop.get('propertyCostRange', 'N/A')}
- Bedrooms: {prop.get('bedrooms', 'N/A')}
- Bathrooms: {prop.get('bathrooms', 'N/A')}
- Area: {prop.get('area', 'N/A')}
- Description: {prop.get('description', 'N/A')}
- Property ID: {prop.get('_id', 'N/A')}
- Available Images:
  {f"Room Photo ID: {prop.get('roomPhotoId')}" if prop.get('roomPhotoId') else "No room photo"}
  {f"Bathroom Photo ID: {prop.get('bathroomPhotoId')}" if prop.get('bathroomPhotoId') else "No bathroom photo"}
  {f"Drawing Room Photo ID: {prop.get('drawingRoomPhotoId')}" if prop.get('drawingRoomPhotoId') else "No drawing room photo"}
  {f"Kitchen Photo ID: {prop.get('kitchenPhotoId')}" if prop.get('kitchenPhotoId') else "No kitchen photo"}

"""
            all_properties_content += property_content
        
        # Create documents and initialize AI chain
        docs = [Document(page_content=all_properties_content)]
        text_chunks = text_splitter.split_documents(docs)
        vector_store = FAISS.from_documents(text_chunks, embedder)
        
        memory = ConversationBufferMemory(
            memory_key="chat_history", 
            return_messages=True
        )
        
        chain = ConversationalRetrievalChain.from_llm(
            llm=geminiLlm,
            memory=memory,
            retriever=vector_store.as_retriever()
        )
        
        print("✅ AI chain initialized with all database properties")
        
    except Exception as e:
        print(f"❌ Error initializing AI chain: {str(e)}")
        chain = None

# ==================== IMAGE UPLOAD ROUTES ====================

@app.route("/api/upload", methods=['POST'])
def upload_image():
    """Upload single image"""
    return image_service.upload_image()

@app.route("/api/images/upload", methods=['POST'])
def upload_image_alt():
    """Upload single image (alternative route for frontend compatibility)"""
    return image_service.upload_image()

@app.route("/api/images/<image_id>", methods=['GET'])
def get_image(image_id):
    """Get image by ID"""
    return image_service.get_image(image_id)

@app.route("/api/images/<image_id>", methods=['DELETE'])
def delete_image(image_id):
    """Delete image by ID"""
    return image_service.delete_image(image_id)

@app.route("/api/images", methods=['GET'])
def list_images():
    """List all images with pagination"""
    return image_service.list_images()

# Legacy route for backward compatibility
@app.route("/image/<image_id>", methods=['GET'])
def get_image_legacy(image_id):
    """Legacy route for image retrieval"""
    return image_service.get_image(image_id)

# ==================== AI CHAT ROUTES ====================

@app.route("/api/addListing", methods=['POST'])
def add_listing():
    """Add property listing with AI processing"""
    global chain
    data = request.get_json()
    try:
        # Extract property data and image IDs
        property_name = data.get('propertyName', '')
        property_address = data.get('propertyAddress', '')
        property_cost = data.get('propertyCostRange', '')
        description = data.get('description', '')
        
        # Image IDs from the image upload service
        room_photo_id = data.get('roomPhotoId')
        bathroom_photo_id = data.get('bathroomPhotoId')
        drawing_room_photo_id = data.get('drawingRoomPhotoId')
        kitchen_photo_id = data.get('kitchenPhotoId')
        
        # Build comprehensive content including image references
        page_content = f"""
        Property Name: {property_name}
        Property Address: {property_address}
        Property Cost: ₹{property_cost}
        Description: {description}
        
        Available Images:
        {f"Room Photo ID: {room_photo_id}" if room_photo_id else ""}
        {f"Bathroom Photo ID: {bathroom_photo_id}" if bathroom_photo_id else ""}
        {f"Drawing Room Photo ID: {drawing_room_photo_id}" if drawing_room_photo_id else ""}
        {f"Kitchen Photo ID: {kitchen_photo_id}" if kitchen_photo_id else ""}
        """
        
        docs = [Document(page_content=page_content)]
        
        text_chunks = text_splitter.split_documents(docs)
        vector_store = FAISS.from_documents(text_chunks, embedder)
        
        memory = ConversationBufferMemory(
            memory_key="chat_history", 
            return_messages=True
        )
        
        chain = ConversationalRetrievalChain.from_llm(
            llm=geminiLlm,
            memory=memory,
            retriever=vector_store.as_retriever()
        )
        
        # Save property to database
        property_data = {
            'propertyName': property_name,
            'propertyAddress': property_address,
            'propertyCostRange': property_cost,
            'description': description,
            'roomPhotoId': room_photo_id,
            'bathroomPhotoId': bathroom_photo_id,
            'drawingRoomPhotoId': drawing_room_photo_id,
            'kitchenPhotoId': kitchen_photo_id,
            'bedrooms': data.get('bedrooms', 2),
            'bathrooms': data.get('bathrooms', 1),
            'area': data.get('area', ''),
            'features': data.get('features', [])
        }
        
        property_id = db.add_property(property_data)
        print(f"✅ Property saved to database with ID: {property_id}")
        
        # Refresh AI chain with updated database
        print("🔄 Refreshing AI system with new property...")
        init_ai_chain()
        
        # Return success with image IDs for reference
        return jsonify({
            "msg": "Success", 
            "propertyId": property_id,
            "imageIds": {
                "room": room_photo_id,
                "bathroom": bathroom_photo_id,
                "drawingRoom": drawing_room_photo_id,
                "kitchen": kitchen_photo_id
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Add listing error: {str(e)}")
        return jsonify({"error": str(e)}), 400

@app.route("/api/askIt", methods=["GET"])
def ask_question():
    """Process AI chat questions with enhanced property card responses"""
    global chain
    question = request.args.get("question")
    
    if not question:
        return jsonify({"error": "No question provided"}), 400
        
    try:
        # Get all properties for potential card display
        all_properties = db.get_all_properties()
        
        # Check if chain is initialized, if not, initialize it
        if chain is None:
            print("🔄 AI chain not initialized, initializing with current database...")
            init_ai_chain()
            
            # If still no chain after initialization, return helpful message
            if chain is None:
                properties_count = len(all_properties)
                if properties_count == 0:
                    return jsonify({
                        "answer": "I don't have any property listings in the database yet. Please add some properties first, then I'll be able to help you find the perfect home! 🏠"
                    }), 200
                else:
                    return jsonify({
                        "answer": "I'm having trouble accessing the property database. Please try again in a moment."
                    }), 200
            
        # Process question with AI
        result = chain({
            "question": f"Answer in English: {question} (If showing properties, provide a brief summary and mention that detailed property cards will be displayed below. For VR tours, mention that 3D tour buttons are available.)"
        }, return_only_outputs=True)
        
        print(f"AI Response: {result}")
        
        # Format output: bold **...** and newlines
        answer = re.sub(r"\*\*(.*?)\*\*", r"**\1**", result['answer'])
        answer = answer.replace("\\n", "\n")
        answer = answer.replace("\\*", "*")
        
        # Determine if we should include property cards based on the question/answer
        properties_to_show = []
        show_properties = False
        
        # Check if the question or answer indicates property listings should be shown
        property_keywords = ['property', 'properties', 'listing', 'listings', 'show', 'recommend', 'available', 'vr', 'tour', 'photos']
        question_lower = question.lower()
        answer_lower = answer.lower()
        
        if any(keyword in question_lower for keyword in property_keywords) or any(keyword in answer_lower for keyword in property_keywords):
            show_properties = True
        
        # If we should show properties, format them for the frontend
        if show_properties and all_properties:
            for prop in all_properties:
                # Format property for frontend PropertyCard component
                formatted_property = {
                    "id": prop.get('_id', ''),
                    "title": prop.get('propertyName', 'Unknown Property'),
                    "price": f"₹{prop.get('propertyCostRange', 'Price not specified')}",
                    "location": prop.get('propertyAddress', 'Location not specified'),
                    "bedrooms": prop.get('bedrooms', 2),
                    "bathrooms": prop.get('bathrooms', 1),
                    "area": prop.get('area', 'Area not specified'),
                    "features": prop.get('features', []),
                    "description": prop.get('description', ''),
                    # VR Tour data - include both individual props and nested object
                    "hasVRTour": bool(prop.get('roomPhotoId') or prop.get('bathroomPhotoId') or prop.get('drawingRoomPhotoId') or prop.get('kitchenPhotoId')),
                    "roomPhotoId": prop.get('roomPhotoId'),
                    "bathroomPhotoId": prop.get('bathroomPhotoId'),
                    "drawingRoomPhotoId": prop.get('drawingRoomPhotoId'),
                    "kitchenPhotoId": prop.get('kitchenPhotoId'),
                    "vrTourData": {
                        "roomPhotoId": prop.get('roomPhotoId'),
                        "bathroomPhotoId": prop.get('bathroomPhotoId'),
                        "drawingRoomPhotoId": prop.get('drawingRoomPhotoId'),
                        "kitchenPhotoId": prop.get('kitchenPhotoId')
                    },
                    # Use a placeholder image or the first available room image
                    "image": f"/api/images/{prop.get('roomPhotoId')}" if prop.get('roomPhotoId') else "/placeholder-property.jpg"
                }
                properties_to_show.append(formatted_property)
            
            # Limit to 6 properties to avoid overwhelming the chat
            properties_to_show = properties_to_show[:6]
        
        print(f"🤖 RAG Answer: {answer}")
        print(f"📊 Properties to show: {len(properties_to_show)}")
        
        response_data = {
            "answer": answer,
            "source": "rag_enhanced",
            "properties_in_knowledge_base": len(all_properties)
        }
        
        # Add properties if we found relevant ones
        if properties_to_show:
            response_data["properties"] = properties_to_show
            response_data["showPropertyCards"] = True
        
        return jsonify(response_data), 200
        
    except Exception as err:
        print(f"❌ Ask question error: {str(err)}")
        return jsonify({
            "answer": "Sorry, I couldn't process your question. Please try again."
        }), 500

# ==================== PROPERTY LISTING ROUTES ====================

@app.route("/api/getListings", methods=['GET'])
def get_listings_api():
    """Get all property listings from MongoDB (API route)"""
    return get_listings()

@app.route("/getListings", methods=['GET'])
def get_listings():
    """Get all property listings from MongoDB"""
    try:
        properties = db.get_all_properties()
        
        # Transform data for frontend compatibility
        formatted_properties = []
        for prop in properties:
            # Handle description JSON formatting
            description_data = prop.get('description', '')
            if isinstance(description_data, dict):
                # For frontend display, use the text content
                description_for_frontend = description_data.get('text', '')
            else:
                # Fallback for string descriptions
                description_for_frontend = str(description_data)
                
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
                "description": description_for_frontend,
                "descriptionJson": prop.get('description'),  # Include full JSON for advanced features
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

# ==================== LEGACY ROUTES ====================

# Legacy routes for backward compatibility
@app.route("/addListing", methods=['POST'])
def add_listing_legacy():
    """Legacy route for adding listings"""
    return add_listing()

@app.route("/askIt", methods=["GET"])
def ask_question_legacy():
    """Legacy route for asking questions - redirect to enhanced API"""
    return ask_question()

@app.route("/getImage/<image_id>", methods=["GET"])
def get_image_proxy_legacy(image_id):
    """Legacy proxy endpoint - now handled directly by image service"""
    return image_service.get_image(image_id)

# ==================== HEALTH CHECK ROUTES ====================

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "services": {
            "image_service": image_service.initialized,
            "ai_service": chain is not None
        }
    }), 200

@app.route("/", methods=["GET"])
def root():
    """Root endpoint with API information"""
    return jsonify({
        "name": "CribConcierge Backend API",
        "version": "2.0.0",
        "description": "Integrated Flask backend with AI Chat Assistant and Image Upload Service",
        "endpoints": {
            "images": {
                "upload": "POST /api/upload",
                "get": "GET /api/images/{id}",
                "list": "GET /api/images",
                "delete": "DELETE /api/images/{id}"
            },
            "ai": {
                "add_listing": "POST /api/addListing",
                "ask_question": "GET /api/askIt?question={query}"
            },
            "health": "GET /api/health"
        },
        "frontend_url": "http://localhost:8080"
    }), 200

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(413)
def too_large(error):
    return jsonify({"error": "File too large"}), 413

# ==================== MAIN APPLICATION ====================

if __name__ == "__main__":
    print("🚀 Starting CribConcierge Backend...")
    
    # Initialize services
    if init_services():
        print("✅ All services initialized successfully")
        print("🌐 Backend API running on http://localhost:5090")
        print("📖 API documentation available at http://localhost:5090")
        
        # Configure Flask for file uploads
        app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
        
        # Run the application
        app.run(
            host='0.0.0.0',
            port=5090,
            debug=True,
            threaded=True
        )
    else:
        print("❌ Failed to start services")
        sys.exit(1)
