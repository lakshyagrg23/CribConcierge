#!/usr/bin/env python3
"""
Quick test script to verify the mock API is working
"""

import requests
import json

def test_api():
    base_url = "http://localhost:5090"
    
    print("🧪 Testing CribConcierge Mock API...")
    
    # Test 1: Root endpoint
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Root endpoint: {response.status_code}")
        data = response.json()
        print(f"   Version: {data.get('version', 'Unknown')}")
        print(f"   Mode: {data.get('description', 'Unknown')}")
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
        return False
    
    # Test 2: Health check
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"✅ Health check: {response.status_code}")
        data = response.json()
        print(f"   Status: {data.get('status', 'Unknown')}")
        print(f"   MongoDB: {data.get('services', {}).get('mongodb', 'Unknown')}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test 3: AI Chat
    try:
        response = requests.get(f"{base_url}/api/askIt?question=hello")
        print(f"✅ AI Chat: {response.status_code}")
        data = response.json()
        print(f"   Response: {data.get('answer', 'No answer')[:50]}...")
    except Exception as e:
        print(f"❌ AI Chat failed: {e}")
        return False
    
    # Test 4: Image listing
    try:
        response = requests.get(f"{base_url}/api/images")
        print(f"✅ Image listing: {response.status_code}")
        data = response.json()
        print(f"   Images found: {len(data.get('data', []))}")
    except Exception as e:
        print(f"❌ Image listing failed: {e}")
        return False
    
    print("\n🎉 All API tests passed! Mock backend is working correctly.")
    print("📖 See MONGODB_SETUP.md to enable full functionality with database.")
    return True

if __name__ == "__main__":
    test_api()
