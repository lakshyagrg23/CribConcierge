import os
import json
import re
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

# RAG and LangChain imports
from langchain.text_splitter import CharacterTextSplitter
from langchain.memory import ConversationBufferMemory
from langchain_core.documents import Document
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.embeddings import HuggingFaceEmbeddings
from SYSTEM_PROMPT import PROMPT
import nltk

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
except:
    pass

# Load environment variables
load_dotenv()

# Set Google API key for Gemini
os.environ["GOOGLE_API_KEY"] = os.environ.get("GEMINI_API_KEY", "")

# Initialize RAG components globally
text_splitter = CharacterTextSplitter(
    separator='\n',
    chunk_size=1000,
    chunk_overlap=100
)
embedder = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
geminiLlm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.4, system_prompt=PROMPT)

# Global RAG components
global_vector_store = None
global_chain = None
global_memory = None

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
    
    def get_properties_as_documents(self):
        """Convert MongoDB properties to LangChain Documents for RAG"""
        properties = self.get_all_properties()
        documents = []
        
        for prop in properties:
            # Build comprehensive content for each property
            content = f"""
Property Name: {prop.get('propertyName', 'N/A')}
Property Address: {prop.get('propertyAddress', 'N/A')}
Property Cost: ₹{prop.get('propertyCostRange', 'N/A')}
Bedrooms: {prop.get('bedrooms', 'N/A')}
Bathrooms: {prop.get('bathrooms', 'N/A')}
Area: {prop.get('area', 'N/A')}
Description: {prop.get('description', 'N/A')}
Features: {', '.join(prop.get('features', []))}
Status: {prop.get('status', 'N/A')}

Available Images for VR Tour:
{f"Room Photo ID: {prop.get('roomPhotoId')}" if prop.get('roomPhotoId') else "Room Photo: Not available"}
{f"Bathroom Photo ID: {prop.get('bathroomPhotoId')}" if prop.get('bathroomPhotoId') else "Bathroom Photo: Not available"}
{f"Drawing Room Photo ID: {prop.get('drawingRoomPhotoId')}" if prop.get('drawingRoomPhotoId') else "Drawing Room Photo: Not available"}
{f"Kitchen Photo ID: {prop.get('kitchenPhotoId')}" if prop.get('kitchenPhotoId') else "Kitchen Photo: Not available"}

Property ID: {prop.get('_id')}
Created: {prop.get('created_at', 'N/A')}
Updated: {prop.get('updated_at', 'N/A')}
            """.strip()
            
            # Create LangChain Document
            doc = Document(
                page_content=content,
                metadata={
                    "property_id": prop.get('_id'),
                    "property_name": prop.get('propertyName', ''),
                    "address": prop.get('propertyAddress', ''),
                    "price": prop.get('propertyCostRange', ''),
                    "type": "property_listing"
                }
            )
            documents.append(doc)
        
        return documents
    
    def build_rag_knowledge_base(self):
        """Build FAISS vector store from all properties in database"""
        global global_vector_store, global_chain, global_memory
        
        try:
            print("🔄 Building RAG knowledge base from database...")
            
            # Get all properties as documents
            documents = self.get_properties_as_documents()
            
            if not documents:
                print("⚠️ No properties found in database for RAG")
                return False
            
            # Split documents into chunks
            text_chunks = text_splitter.split_documents(documents)
            print(f"📄 Created {len(text_chunks)} text chunks from {len(documents)} properties")
            
            # Create vector store
            global_vector_store = FAISS.from_documents(text_chunks, embedder)
            print("✅ FAISS vector store created successfully")
            
            # Initialize conversation memory
            global_memory = ConversationBufferMemory(
                memory_key="chat_history", 
                return_messages=True
            )
            
            # Create conversational retrieval chain
            global_chain = ConversationalRetrievalChain.from_llm(
                llm=geminiLlm,
                memory=global_memory,
                retriever=global_vector_store.as_retriever(
                    search_kwargs={"k": 5}  # Retrieve top 5 most relevant chunks
                )
            )
            print("✅ RAG conversational chain initialized")
            
            return True
            
        except Exception as e:
            print(f"❌ Error building RAG knowledge base: {str(e)}")
            return False
    
    def update_rag_with_property(self, property_data):
        """Add single property to existing RAG knowledge base"""
        global global_vector_store
        
        try:
            if not global_vector_store:
                print("⚠️ No existing vector store, rebuilding entire knowledge base...")
                return self.build_rag_knowledge_base()
            
            # Convert single property to document
            content = f"""
Property Name: {property_data.get('propertyName', 'N/A')}
Property Address: {property_data.get('propertyAddress', 'N/A')}
Property Cost: ₹{property_data.get('propertyCostRange', 'N/A')}
Bedrooms: {property_data.get('bedrooms', 'N/A')}
Bathrooms: {property_data.get('bathrooms', 'N/A')}
Area: {property_data.get('area', 'N/A')}
Description: {property_data.get('description', 'N/A')}
Features: {', '.join(property_data.get('features', []))}

Available Images for VR Tour:
{f"Room Photo ID: {property_data.get('roomPhotoId')}" if property_data.get('roomPhotoId') else "Room Photo: Not available"}
{f"Bathroom Photo ID: {property_data.get('bathroomPhotoId')}" if property_data.get('bathroomPhotoId') else "Bathroom Photo: Not available"}
{f"Drawing Room Photo ID: {property_data.get('drawingRoomPhotoId')}" if property_data.get('drawingRoomPhotoId') else "Drawing Room Photo: Not available"}
{f"Kitchen Photo ID: {property_data.get('kitchenPhotoId')}" if property_data.get('kitchenPhotoId') else "Kitchen Photo: Not available"}
            """.strip()
            
            doc = Document(
                page_content=content,
                metadata={
                    "property_name": property_data.get('propertyName', ''),
                    "address": property_data.get('propertyAddress', ''),
                    "price": property_data.get('propertyCostRange', ''),
                    "type": "property_listing"
                }
            )
            
            # Split and add to existing vector store
            chunks = text_splitter.split_documents([doc])
            global_vector_store.add_documents(chunks)
            
            print(f"✅ Added property '{property_data.get('propertyName', 'Unknown')}' to RAG knowledge base")
            return True
            
        except Exception as e:
            print(f"❌ Error updating RAG with new property: {str(e)}")
            return False

# Initialize Flask app and database
app = Flask(__name__)
CORS(app)
db = PropertyDatabase()

@app.route("/addListing", methods=['POST'])
def add_listing():
    """Add a property listing with image IDs to MongoDB and update RAG knowledge base"""
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
        
        # Update RAG knowledge base with new property
        rag_updated = db.update_rag_with_property(property_data)
        
        print(f"✅ Added property to MongoDB: {property_data['propertyName']}")
        print(f"📄 Property ID: {property_id}")
        print(f"🧠 RAG updated: {'✅' if rag_updated else '❌'}")
        
        return jsonify({
            "msg": "Success", 
            "propertyId": property_id,
            "data": property_data,
            "ragUpdated": rag_updated,
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
def intelligent_qa():
    """Enhanced Q&A using RAG + Database queries for intelligent property assistance"""
    global global_chain, global_vector_store
    
    question = request.args.get("question", "")
    
    if not question:
        return jsonify({"answer": "Please provide a question."}), 400
    
    try:
        # Get all properties for potential card display
        all_properties = db.get_all_properties()
        
        # If RAG chain is available, use it for intelligent responses
        if global_chain and global_vector_store:
            print(f"🤖 Processing question with RAG: {question}")
            
            # Use RAG for intelligent context-aware responses
            result = global_chain({
                "question": f"Answer in English: {question} (If showing properties, provide a brief summary and mention that detailed property cards will be displayed below. For VR tours, mention that 3D tour buttons are available.)"
            }, return_only_outputs=True)
            
            # Format the response
            answer = result.get('answer', '')
            answer = re.sub(r"\*\*(.*?)\*\*", r"**\1**", answer)
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
            
        else:
            # Fallback to database-only responses
            print(f"🤖 Processing question with database fallback: {question}")
            
            if not all_properties:
                answer = "No property listings found in the database. Please add properties first."
                return jsonify({
                    "answer": answer,
                    "source": "database_fallback",
                    "suggestion": "For more intelligent responses, please ensure the RAG system is properly initialized."
                }), 200
            else:
                latest_property = all_properties[-1]  # Get most recent property
                
                if "cost" in question.lower() or "price" in question.lower():
                    answer = f"The latest property '{latest_property['propertyName']}' is priced at ₹{latest_property['propertyCostRange']}."
                elif "address" in question.lower() or "location" in question.lower():
                    answer = f"The property is located at {latest_property['propertyAddress']}."
                elif "photo" in question.lower() or "image" in question.lower() or "vr" in question.lower() or "tour" in question.lower():
                    photo_count = sum(1 for photo_id in [
                        latest_property.get('roomPhotoId'),
                        latest_property.get('bathroomPhotoId'), 
                        latest_property.get('drawingRoomPhotoId'),
                        latest_property.get('kitchenPhotoId')
                    ] if photo_id)
                    answer = f"The property '{latest_property['propertyName']}' has {photo_count} uploaded photos available for VR tour viewing."
                elif "count" in question.lower() or "how many" in question.lower():
                    answer = f"We currently have {len(all_properties)} properties in our database."
                else:
                    answer = f"**{latest_property['propertyName']}**\n\nLocation: {latest_property['propertyAddress']}\nPrice: ₹{latest_property['propertyCostRange']}\n\n{latest_property.get('description', 'Contact us for more details!')}"
                
                # For property-related questions, also show property cards
                if any(keyword in question.lower() for keyword in ['property', 'properties', 'show', 'list', 'available']):
                    properties_to_show = []
                    for prop in all_properties[:3]:  # Show top 3 properties
                        formatted_property = {
                            "id": prop.get('_id', ''),
                            "title": prop.get('propertyName', 'Unknown Property'),
                            "price": f"₹{prop.get('propertyCostRange', 'Price not specified')}",
                            "location": prop.get('propertyAddress', 'Location not specified'),
                            "bedrooms": prop.get('bedrooms', 2),
                            "bathrooms": prop.get('bathrooms', 1),
                            "area": prop.get('area', 'Area not specified'),
                            "features": prop.get('features', []),
                            "hasVRTour": bool(prop.get('roomPhotoId') or prop.get('bathroomPhotoId') or prop.get('drawingRoomPhotoId') or prop.get('kitchenPhotoId')),
                            "roomPhotoId": prop.get('roomPhotoId'),
                            "bathroomPhotoId": prop.get('bathroomPhotoId'),
                            "drawingRoomPhotoId": prop.get('drawingRoomPhotoId'),
                            "kitchenPhotoId": prop.get('kitchenPhotoId'),
                            "image": f"/api/images/{prop.get('roomPhotoId')}" if prop.get('roomPhotoId') else "/placeholder-property.jpg"
                        }
                        properties_to_show.append(formatted_property)
                    
                    return jsonify({
                        "answer": answer,
                        "source": "database_fallback",
                        "properties": properties_to_show,
                        "showPropertyCards": True,
                        "suggestion": "For more intelligent responses, please ensure the RAG system is properly initialized."
                    }), 200
            
            print(f"🤖 Database Answer: {answer}")
            
            return jsonify({
                "answer": answer,
                "source": "database_fallback",
                "suggestion": "For more intelligent responses, please ensure the RAG system is properly initialized."
            }), 200
        
    except Exception as e:
        print(f"❌ Error in intelligent_qa: {str(e)}")
        return jsonify({
            "answer": "Sorry, I encountered an error processing your question. Please try again.",
            "error": str(e)
        }), 500

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

@app.route("/rebuildRAG", methods=["POST"])
def rebuild_rag():
    """Manually rebuild the RAG knowledge base from current database"""
    try:
        success = db.build_rag_knowledge_base()
        
        if success:
            property_count = len(db.get_all_properties())
            return jsonify({
                "success": True,
                "message": f"RAG knowledge base rebuilt successfully with {property_count} properties",
                "properties_count": property_count
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Failed to rebuild RAG knowledge base"
            }), 500
            
    except Exception as e:
        print(f"❌ Error rebuilding RAG: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/ragStatus", methods=["GET"])
def rag_status():
    """Get current status of RAG system"""
    global global_chain, global_vector_store, global_memory
    
    try:
        properties_count = len(db.get_all_properties())
        
        return jsonify({
            "rag_initialized": global_chain is not None,
            "vector_store_ready": global_vector_store is not None,
            "memory_initialized": global_memory is not None,
            "properties_in_database": properties_count,
            "system_status": "Ready" if global_chain else "Not initialized"
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "system_status": "Error"
        }), 500

if __name__ == "__main__":
    print("🚀 Starting Enhanced Property Database API Server with RAG...")
    print("📊 MongoDB Connection: mongodb://localhost:27017/imageupload")
    print("📁 Collection: properties")
    print("🧠 RAG System: LangChain + FAISS + Google Gemini")
    print("🌐 Server: http://localhost:5090")
    
    # Initialize RAG knowledge base on startup
    print("\n🔄 Initializing RAG system...")
    try:
        rag_success = db.build_rag_knowledge_base()
        if rag_success:
            print("✅ RAG system initialized successfully")
        else:
            print("⚠️ RAG system initialization failed - will use database fallback")
    except Exception as e:
        print(f"⚠️ RAG initialization error: {str(e)} - will use database fallback")
    
    print("\n📚 Available Endpoints:")
    print("  POST /addListing - Add property (with RAG update)")
    print("  GET  /getListings - Get all properties")
    print("  GET  /getProperty/<id> - Get specific property")
    print("  GET  /askIt?question=<query> - RAG-powered Q&A")
    print("  POST /rebuildRAG - Rebuild RAG knowledge base")
    print("  GET  /ragStatus - Check RAG system status")
    print("  GET  /getImage/<id> - Proxy to image service")
    
    app.run(port=5090, debug=True)
