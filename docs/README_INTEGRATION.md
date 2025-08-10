# Image Upload Component Integration

## Overview

This project integrates a sophisticated image upload component into the real estate platform, enabling JPEG image uploads to MongoDB with a hybrid microservices architecture.

## Architecture

### Hybrid Approach

- **Node.js Service** (Port 3000): Handles image uploads, storage, and retrieval using MongoDB GridFS
- **Flask Backend** (Port 5090): Manages property listings, AI processing, and serves as a proxy for images
- **React Frontend** (Port 8080): User interface with advanced drag-drop image upload components

### Data Flow

1. User uploads images through React frontend
2. Images are sent to Node.js service via Vite proxy (`/api/images/*`)
3. Node.js service stores images in MongoDB GridFS and returns file IDs
4. Property form submission sends image IDs to Flask backend
5. Flask backend processes property data and includes image references
6. Chat queries can reference uploaded images through the AI system

## Quick Start

### 1. Start All Services

**Terminal 1 - Node.js Image Service:**

```bash
cd "d:\Code\Projects\AgenticAIHackathon"
node src/ImageUploadComponent.js
```

**Terminal 2 - Flask Backend:**

```bash
cd "d:\Code\Projects\AgenticAIHackathon\kuldeep\backend"
python app.py
```

**Terminal 3 - React Frontend:**

```bash
cd "d:\Code\Projects\AgenticAIHackathon\kuldeep\frontend"
npm run dev
```

### 2. Access the Application

- Frontend: http://localhost:8080
- Add Listing Page: http://localhost:8080/add-listing

### 3. Test the Integration

```bash
cd "d:\Code\Projects\AgenticAIHackathon"
node test-integration.js
```

## Features

### Enhanced Image Upload Component

- **Drag & Drop**: Intuitive file dropping interface
- **Live Preview**: Instant image preview after selection
- **Progress Tracking**: Real-time upload progress indicator
- **Validation**: JPEG format and file size validation
- **Error Handling**: Comprehensive error messages and retry options
- **Success Feedback**: Visual confirmation with file ID display

### Integration Benefits

- **File ID Management**: Images are stored with unique IDs for easy reference
- **AI Integration**: Property descriptions can reference uploaded images
- **Scalable Storage**: MongoDB GridFS handles large image files efficiently
- **Proxy Configuration**: Seamless communication between services via Vite proxy

## API Endpoints

### Node.js Image Service (Port 3000)

- `POST /upload` - Upload JPEG images
- `GET /image/:id` - Retrieve images by ID
- `DELETE /image/:id` - Delete images
- `GET /images` - List all uploaded images

### Flask Backend (Port 5090)

- `POST /addListing` - Create property listing with image IDs
- `GET /askIt?question=...` - Query AI about properties
- `GET /getImage/:id` - Proxy for image retrieval

### Frontend Proxy Routes (Port 8080)

- `/api/images/*` → Node.js service (Port 3000)
- `/api/*` → Flask backend (Port 5090)

## Component Usage

### In React Components

```tsx
import ImageUpload from "@/components/upload/ImageUpload";

<ImageUpload
  id="roomPhoto"
  label="Upload Room Photo"
  onUploadSuccess={(result) => {
    setRoomPhotoId(result.data?.fileId);
  }}
  onUploadError={(error) => {
    console.error("Upload failed:", error);
  }}
/>;
```

### Custom Hook

```tsx
import { useImageUpload } from "@/hooks/useImageUpload";

const { upload, isUploading, uploadProgress, error } = useImageUpload({
  apiEndpoint: "/api/images/upload",
  onSuccess: (result) => console.log("Success:", result),
  onError: (error) => console.error("Error:", error),
});
```

## File Structure

```
d:\Code\Projects\AgenticAIHackathon\
├── src/
│   ├── ImageUploadComponent.js          # Node.js backend service
│   └── react/                           # Original React components
├── kuldeep/
│   ├── backend/
│   │   └── app.py                       # Flask backend with image ID support
│   └── frontend/
│       └── src/
│           ├── components/upload/
│           │   └── ImageUpload.tsx      # Enhanced upload component
│           ├── hooks/
│           │   └── useImageUpload.ts    # Custom upload hook
│           └── pages/
│               └── AddlistingPage.tsx   # Updated with image uploads
├── test-integration.js                  # Comprehensive integration tests
└── README.md                           # This file
```

## Configuration

### Environment Variables

Make sure your `.env` file includes:

```
MONGODB_URI=mongodb://localhost:27017/image_upload_db
GEMINI_API_KEY=your_gemini_api_key_here
```

### MongoDB Setup

The Node.js service will automatically create the necessary database and collections on first run.

## Testing

### Manual Testing

1. Navigate to http://localhost:8080/add-listing
2. Fill in property details
3. Upload JPEG images using the drag-drop interface
4. Submit the form
5. Use the chat feature to ask about the property

### Automated Testing

Run the comprehensive integration test:

```bash
node test-integration.js
```

This will test:

- ✅ Service availability
- ✅ Image upload functionality
- ✅ Image retrieval
- ✅ Property listing with image IDs
- ✅ AI chat queries
- ✅ Image proxy functionality

## Troubleshooting

### Common Issues

**Upload fails with CORS error:**

- Ensure all services are running on correct ports
- Check Vite proxy configuration in `vite.config.ts`

**Images not storing in MongoDB:**

- Verify MongoDB is running
- Check Node.js service logs for connection errors

**Frontend can't reach backends:**

- Confirm proxy routes in `vite.config.ts`
- Ensure all services are accessible

### Debug Commands

```bash
# Check MongoDB connection
node check_mongodb.js

# Test Node.js service directly
curl -X POST http://localhost:3000/upload -F "image=@test.jpg"

# Test Flask backend
curl http://localhost:5090/askIt?question="test"
```

## Next Steps

1. **Enhanced UI**: Add image galleries and advanced editing features
2. **Image Processing**: Implement thumbnail generation and format conversion
3. **Cloud Storage**: Integrate with AWS S3 or Google Cloud Storage
4. **Performance**: Add caching and CDN integration
5. **Security**: Implement authentication and file scanning

## Dependencies

### Node.js Service

- express, mongoose, mongodb, multer, sharp, cors

### React Frontend

- lucide-react, @types/react

### Flask Backend

- flask, flask-cors, requests, langchain, google-generative-ai

## Support

For issues or questions about the image upload integration, check the logs in each service and run the integration tests to identify specific problems.
