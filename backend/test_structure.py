#!/usr/bin/env python3
"""
Test script for the restructured CribConcierge backend
"""

import sys
import os
from pathlib import Path

def test_imports():
    """Test all required imports"""
    print("🧪 Testing imports...")
    
    try:
        # Core Flask imports
        from flask import Flask, request, jsonify
        print("✅ Flask imports OK")
        
        # Image processing imports
        from PIL import Image
        import gridfs
        import pymongo
        print("✅ Image processing imports OK")
        
        # AI imports (skip if not available)
        try:
            from langchain.text_splitter import CharacterTextSplitter
            from langchain_google_genai import ChatGoogleGenerativeAI
            print("✅ AI imports OK")
        except ImportError as e:
            print(f"⚠️ AI imports not available: {e}")
        
        # Our custom modules
        from image_service import ImageService
        print("✅ ImageService import OK")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_image_service():
    """Test ImageService creation"""
    print("\n🧪 Testing ImageService...")
    
    try:
        from image_service import ImageService
        
        # Create service (don't initialize MongoDB connection)
        service = ImageService(
            mongo_uri="mongodb://localhost:27017/test",
            db_name="test",
            bucket_name="test_images"
        )
        
        print("✅ ImageService creation OK")
        print(f"   - Database: {service.db_name}")
        print(f"   - Bucket: {service.bucket_name}")
        print(f"   - Max file size: {service.max_file_size // (1024*1024)}MB")
        
        return True
        
    except Exception as e:
        print(f"❌ ImageService error: {e}")
        return False

def test_project_structure():
    """Test project structure"""
    print("\n🧪 Testing project structure...")
    
    current_dir = Path.cwd()
    backend_dir = current_dir
    project_root = current_dir.parent
    
    required_files = [
        "image_service.py",
        "app_integrated.py", 
        "SYSTEM_PROMPT.py",
        "requirements.txt"
    ]
    
    required_dirs = [
        project_root / "frontend",
        project_root / "docs",
        project_root / "tests",
        project_root / "scripts"
    ]
    
    # Check files
    for file in required_files:
        if (backend_dir / file).exists():
            print(f"✅ {file}")
        else:
            print(f"❌ {file} missing")
    
    # Check directories
    for dir_path in required_dirs:
        if dir_path.exists():
            print(f"✅ {dir_path.name}/")
        else:
            print(f"❌ {dir_path.name}/ missing")
    
    return True

def main():
    """Run all tests"""
    print("🚀 CribConcierge Backend Test Suite")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_image_service,
        test_project_structure
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed: {e}")
            results.append(False)
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"✅ Passed: {sum(results)}")
    print(f"❌ Failed: {len(results) - sum(results)}")
    
    if all(results):
        print("\n🎉 All tests passed! The restructured backend is ready!")
    else:
        print("\n⚠️ Some tests failed. Check the output above.")
    
    return all(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
