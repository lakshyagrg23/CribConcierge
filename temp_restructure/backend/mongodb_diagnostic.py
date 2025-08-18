#!/usr/bin/env python3
"""
MongoDB Connection Diagnostic Tool for CribConcierge
"""

import os
import sys
from dotenv import load_dotenv
import pymongo
import gridfs
from datetime import datetime

def check_mongodb_service():
    """Check if MongoDB service is running"""
    print("🔍 Checking MongoDB service...")
    
    try:
        # Try to connect with a short timeout
        client = pymongo.MongoClient(
            "mongodb://localhost:27017/",
            serverSelectionTimeoutMS=3000
        )
        
        # Force connection
        client.admin.command('ping')
        print("✅ MongoDB service is running")
        return True, client
        
    except pymongo.errors.ServerSelectionTimeoutError:
        print("❌ MongoDB service is not running or not accessible")
        print("💡 Please start MongoDB service:")
        print("   - Windows: Start 'MongoDB' service in Services")
        print("   - Mac: brew services start mongodb/brew/mongodb-community")
        print("   - Linux: sudo systemctl start mongod")
        return False, None
        
    except Exception as e:
        print(f"❌ MongoDB connection error: {e}")
        return False, None

def check_database_access(client, db_name="imageupload"):
    """Check database access and GridFS setup"""
    print(f"\n🔍 Checking database access: {db_name}")
    
    try:
        db = client[db_name]
        
        # Test basic database operations
        test_collection = db.test_connection
        test_doc = {"test": "connection", "timestamp": datetime.utcnow()}
        result = test_collection.insert_one(test_doc)
        print(f"✅ Database write test successful (ID: {result.inserted_id})")
        
        # Clean up test document
        test_collection.delete_one({"_id": result.inserted_id})
        print("✅ Database cleanup successful")
        
        # Test GridFS
        fs = gridfs.GridFS(db, collection="images")
        print("✅ GridFS setup successful")
        
        # Check existing files
        file_count = fs.find().count()
        print(f"📁 GridFS contains {file_count} files")
        
        return True
        
    except Exception as e:
        print(f"❌ Database access error: {e}")
        return False

def check_environment_config():
    """Check environment configuration"""
    print("\n🔍 Checking environment configuration...")
    
    # Load environment variables
    load_dotenv()
    
    mongo_uri = os.getenv("MONGODB_URI")
    if mongo_uri:
        print(f"✅ MONGODB_URI found: {mongo_uri}")
    else:
        print("❌ MONGODB_URI not found in environment")
        print("💡 Add to .env file: MONGODB_URI=mongodb://localhost:27017/imageupload")
        return False
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        print("✅ GEMINI_API_KEY found")
    else:
        print("⚠️ GEMINI_API_KEY not found (AI features may not work)")
    
    return True

def test_image_service():
    """Test the ImageService class"""
    print("\n🔍 Testing ImageService...")
    
    try:
        from image_service import ImageService
        
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/imageupload")
        service = ImageService(mongo_uri=mongo_uri)
        
        # Test initialization
        if service.init():
            print("✅ ImageService initialization successful")
            return True
        else:
            print("❌ ImageService initialization failed")
            return False
            
    except Exception as e:
        print(f"❌ ImageService error: {e}")
        return False

def main():
    """Run comprehensive MongoDB diagnostic"""
    print("🏠 CribConcierge MongoDB Diagnostic Tool")
    print("=" * 50)
    
    # Check environment
    env_ok = check_environment_config()
    
    # Check MongoDB service
    mongo_ok, client = check_mongodb_service()
    
    if mongo_ok and client:
        # Check database access
        db_ok = check_database_access(client)
        
        # Close connection
        client.close()
    else:
        db_ok = False
    
    # Test image service
    if env_ok and mongo_ok:
        service_ok = test_image_service()
    else:
        service_ok = False
    
    print("\n" + "=" * 50)
    print("📊 Diagnostic Results:")
    print(f"✅ Environment Config: {'✅ OK' if env_ok else '❌ FAILED'}")
    print(f"✅ MongoDB Service: {'✅ OK' if mongo_ok else '❌ FAILED'}")
    print(f"✅ Database Access: {'✅ OK' if db_ok else '❌ FAILED'}")
    print(f"✅ Image Service: {'✅ OK' if service_ok else '❌ FAILED'}")
    
    if all([env_ok, mongo_ok, db_ok, service_ok]):
        print("\n🎉 All checks passed! MongoDB is ready for CribConcierge")
    else:
        print("\n⚠️ Some checks failed. Please fix the issues above.")
        
        if not mongo_ok:
            print("\n🚀 Quick MongoDB Setup:")
            print("1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community")
            print("2. Install and start the MongoDB service")
            print("3. Verify it's running on port 27017")
    
    return all([env_ok, mongo_ok, db_ok, service_ok])

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
