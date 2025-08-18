import sys
import json
import os
from dotenv import load_dotenv
import re
import requests
from langchain.text_splitter import CharacterTextSplitter
from langchain.memory import ConversationBufferMemory
from langchain_core.documents import Document
# from langchain.embeddings 
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.embeddings import HuggingFaceEmbeddings
import nltk
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
from flask import Flask, request, jsonify
from flask_cors import CORS
from SYSTEM_PROMPT import PROMPT

load_dotenv()

os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]
app=Flask(__name__)
CORS(app)
text_splitter=CharacterTextSplitter(
    separator='\n',
    chunk_size=1000,
    chunk_overlap=100
)
model_name = "sentence-transformers/all-MiniLM-L6-v2"
embedder = HuggingFaceEmbeddings(model_name=model_name)
geminiLlm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.4,system_prompt=PROMPT)

@app.route("/addListing",methods=['POST'])
def prepare():
    global chain
    data = request.get_json()
    try:
        # Extract property data and image IDs
        property_name = data.get('propertyName', '')
        property_address = data.get('propertyAddress', '')
        property_cost = data.get('propertyCostRange', '')
        description = data.get('description', '')
        
        # Image IDs from the Node.js upload service
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
        
        text_chunks=text_splitter.split_documents(docs)

        vector_store=FAISS.from_documents(text_chunks,embedder)
        
        memory = ConversationBufferMemory(
            memory_key="chat_history", return_messages=True
        )
        
        chain=ConversationalRetrievalChain.from_llm(llm=geminiLlm,memory=memory,retriever=vector_store.as_retriever())
        
        # Return success with image IDs for reference
        return jsonify({
            "msg": "Success", 
            "propertyId": property_name.lower().replace(" ", "_"),
            "imageIds": {
                "room": room_photo_id,
                "bathroom": bathroom_photo_id,
                "drawingRoom": drawing_room_photo_id,
                "kitchen": kitchen_photo_id
            }
        }), 200
    except Exception as e:
        return jsonify({"error":str(e)}),400
        

@app.route("/askIt", methods=["GET"])
def scrape():
    global chain
    data = request.args.get("question")
    print(data)
    try:
        que=data
        result=chain({"question":f"Answer in English:{que} (If the query is about images or photos, mention that the property has uploaded photos which can be viewed through the image service.)"},return_only_outputs=True)
        print(result)
        # Format output: bold **...** and newlines
        ans = re.sub(r"\*\*(.*?)\*\*", r"\n<b>\1</b>", result['answer'])
        ans = ans.replace("\\n", "\n")
        ans = ans.replace("\\*", "/")

        print(ans)
        return jsonify({"answer": ans}) 
    except Exception as err:
        print(err)
        return jsonify({"answer":"Not able to extract data from the page"})

@app.route("/getImage/<image_id>", methods=["GET"])
def get_image(image_id):
    """Proxy endpoint to retrieve images from the Node.js image service"""
    try:
        # Forward the request to the Node.js image service
        response = requests.get(f"http://localhost:3000/image/{image_id}")
        
        if response.status_code == 200:
            return response.content, 200, {'Content-Type': response.headers.get('Content-Type', 'image/jpeg')}
        else:
            return jsonify({"error": "Image not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve image: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(port=5090)