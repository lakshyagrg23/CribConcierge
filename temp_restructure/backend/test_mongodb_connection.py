"""
Quick MongoDB connection test using your original configuration
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
import sys

# Load environment variables
load_dotenv()

def test_mongodb_connection():
    try:
        print("🔍 Testing MongoDB connection with your original settings...")
        
        # Use the exact same connection as your original app
        mongodb_uri = "mongodb://localhost:27017"
        db_name = "imageupload"
        
        print(f"📡 Connecting to: {mongodb_uri}")
        print(f"🗄️  Database: {db_name}")
        
        # Create client with a short timeout
        client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        
        # Test the connection
        print("⏳ Testing connection...")
        client.admin.command('ping')
        print("✅ MongoDB ping successful!")
        
        # Access the database
        db = client[db_name]
        print(f"✅ Connected to database: {db_name}")
        
        # List collections
        collections = db.list_collection_names()
        print(f"📚 Collections found: {collections}")
        
        # Test properties collection
        properties = db.properties
        count = properties.count_documents({})
        print(f"🏠 Properties in database: {count}")
        
        if count > 0:
            # Show a sample property
            sample = properties.find_one()
            print(f"📋 Sample property keys: {list(sample.keys()) if sample else 'None'}")
        
        client.close()
        print("🎉 MongoDB connection test successful!")
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("💡 Suggestions:")
        print("   - Make sure MongoDB service is running: net start MongoDB")
        print("   - Check if port 27017 is available")
        print("   - Try restarting MongoDB service")
        return False

if __name__ == "__main__":
    test_mongodb_connection()
