import requests
import json

def test_ask_it():
    try:
        # Test the askIt endpoint
        response = requests.get("http://localhost:5090/askIt", params={"question": "show me properties"})
        
        if response.status_code == 200:
            data = response.json()
            print("=== RESPONSE ===")
            print(json.dumps(data, indent=2))
            
            # Check if properties are included
            if 'properties' in data:
                print(f"\n=== PROPERTIES FOUND: {len(data['properties'])} ===")
                for i, prop in enumerate(data['properties']):
                    print(f"\nProperty {i+1}:")
                    print(f"  ID: {prop.get('id')}")
                    print(f"  Title: {prop.get('title')}")
                    print(f"  Has VR Tour: {prop.get('hasVRTour')}")
                    print(f"  Room Photo ID: {prop.get('roomPhotoId')}")
                    print(f"  Image URL: {prop.get('image')}")
            else:
                print("No properties in response")
        else:
            print(f"Error: Status {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ask_it()
