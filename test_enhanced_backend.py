#!/usr/bin/env python3
"""
Test script to verify the enhanced RAG backend response format
"""
import requests
import json

def test_backend_response():
    """Test the /askIt endpoint to verify property card data format"""
    print("🧪 Testing Enhanced RAG Backend...")
    
    try:
        # Test the askIt endpoint
        response = requests.get("http://localhost:5090/askIt", {
            "params": {"question": "Show me available properties"}
        })
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ Backend Response Received")
            print(f"📝 Answer: {data.get('answer', 'No answer')}")
            print(f"🔧 Source: {data.get('source', 'Unknown')}")
            
            if 'properties' in data and data['properties']:
                print(f"\n🏠 Properties Count: {len(data['properties'])}")
                
                for i, prop in enumerate(data['properties'][:2]):  # Show first 2 properties
                    print(f"\n🏠 Property {i + 1}:")
                    print(f"  📄 ID: {prop.get('id', 'No ID')}")
                    print(f"  🏠 Title: {prop.get('title', 'No title')}")
                    print(f"  💰 Price: {prop.get('price', 'No price')}")
                    print(f"  📍 Location: {prop.get('location', 'No location')}")
                    print(f"  🛏️ Bedrooms: {prop.get('bedrooms', 'No bedrooms')}")
                    print(f"  🛁 Bathrooms: {prop.get('bathrooms', 'No bathrooms')}")
                    print(f"  📏 Area: {prop.get('area', 'No area')}")
                    print(f"  🎮 Has VR Tour: {prop.get('hasVRTour', False)}")
                    print(f"  🖼️ Room Photo ID: {prop.get('roomPhotoId', 'None')}")
                    print(f"  🚿 Bathroom Photo ID: {prop.get('bathroomPhotoId', 'None')}")
                    print(f"  🛋️ Drawing Room Photo ID: {prop.get('drawingRoomPhotoId', 'None')}")
                    print(f"  🍳 Kitchen Photo ID: {prop.get('kitchenPhotoId', 'None')}")
                    print(f"  🖼️ Image URL: {prop.get('image', 'No image')}")
                    
                    if prop.get('vrTourData'):
                        print(f"  📦 VR Tour Data Available: Yes")
                    else:
                        print(f"  📦 VR Tour Data Available: No")
            else:
                print("⚠️ No properties in response")
            
        else:
            print(f"❌ Backend Error: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure the server is running on port 5090")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_rag_status():
    """Test the RAG status endpoint"""
    print("\n🧠 Testing RAG Status...")
    
    try:
        response = requests.get("http://localhost:5090/ragStatus")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ RAG Status Response:")
            print(f"  🧠 RAG Initialized: {data.get('rag_initialized', False)}")
            print(f"  📊 Vector Store Ready: {data.get('vector_store_ready', False)}")
            print(f"  💭 Memory Initialized: {data.get('memory_initialized', False)}")
            print(f"  🏠 Properties in Database: {data.get('properties_in_database', 0)}")
            print(f"  🚦 System Status: {data.get('system_status', 'Unknown')}")
        else:
            print(f"❌ RAG Status Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ RAG Status Error: {str(e)}")

if __name__ == "__main__":
    test_rag_status()
    test_backend_response()
    print("\n🎯 Test complete! Check the console output for any issues.")
