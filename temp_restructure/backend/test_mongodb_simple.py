#!/usr/bin/env python3
"""
Simple MongoDB Connection Test
"""

import os
import pymongo
import gridfs
from dotenv import load_dotenv

# Load environment
load_dotenv()

def test_mongodb():
    print("🔍 Testing MongoDB connection...")
    
    try:
        # Get URI from environment
        mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/imageupload')
        print(f"📡 Connecting to: {mongo_uri}")
        
        # Connect with timeout
        client = pymongo.MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000
        )
        
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful")
        
        # Test database
        db_name = "imageupload"
        db = client[db_name]
        print(f"✅ Database '{db_name}' accessible")
        
        # Test GridFS
        fs = gridfs.GridFS(db, collection="images")
        print("✅ GridFS setup successful")
        
        # Count existing files
        try:
            file_count = fs.find().count()
            print(f"📁 Found {file_count} existing files in GridFS")
        except Exception as e:
            print(f"⚠️ GridFS count warning: {e}")
        
        client.close()
        print("✅ All MongoDB tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ MongoDB test failed: {e}")
        return False

if __name__ == "__main__":
    test_mongodb()
