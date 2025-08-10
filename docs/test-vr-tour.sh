#!/bin/bash

echo "🧪 Testing VR Tour Integration"
echo "================================"

# Test URLs
FRONTEND_URL="http://localhost:8080"
IMAGE_SERVICE_URL="http://localhost:3000"

echo ""
echo "1. Testing Frontend (React App)..."
curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL
if [ $? -eq 0 ]; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

echo ""
echo "2. Testing Image Service..."
curl -s -o /dev/null -w "%{http_code}" $IMAGE_SERVICE_URL
if [ $? -eq 0 ]; then
    echo "✅ Image service is accessible"
else
    echo "❌ Image service is not accessible"
fi

echo ""
echo "3. Testing VR Tour Route..."
curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/tour/1"
if [ $? -eq 0 ]; then
    echo "✅ VR Tour route is accessible"
else
    echo "❌ VR Tour route is not accessible"
fi

echo ""
echo "4. Testing Image API..."
IMAGE_ID="689779a64956505c47af77fc"
curl -s -o /dev/null -w "%{http_code}" "$IMAGE_SERVICE_URL/images/$IMAGE_ID"
if [ $? -eq 0 ]; then
    echo "✅ Image API is working"
else
    echo "❌ Image API is not working"
fi

echo ""
echo "🎯 VR Tour Test URLs:"
echo "Dashboard: $FRONTEND_URL/dashboard"
echo "VR Tour 1: $FRONTEND_URL/tour/1"
echo "VR Tour 2: $FRONTEND_URL/tour/2"
echo "Image Example: $IMAGE_SERVICE_URL/images/$IMAGE_ID"

echo ""
echo "🔧 Next Steps:"
echo "1. Open dashboard and click '3D Tour' button on property cards"
echo "2. Verify that panoramic images load correctly"
echo "3. Test room navigation using the floating menu"
echo "4. Check that disabled rooms show properly"
