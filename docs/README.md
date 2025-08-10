# Image Upload Component

A reusable React component for uploading JPEG images to MongoDB with a Node.js backend.

## 🚀 Features

- **React Frontend Component**: Drop-in React component with drag & drop support
- **Node.js Backend**: Express.js server with MongoDB GridFS storage
- **JPEG Validation**: Client-side and server-side JPEG validation
- **File Size Limits**: Configurable file size restrictions
- **Image Processing**: Automatic image compression using Sharp
- **Progress Tracking**: Real-time upload progress indicators
- **Multiple Upload Support**: Single or multiple file uploads
- **Preview Support**: Image preview before upload
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive Design**: Mobile-friendly interface
- **Easy Integration**: Designed for easy integration into existing projects

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or remote instance)
- React 18+ (for frontend integration)

### Backend Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Environment Variables**

   ```bash
   # Create .env file
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/imageupload
   ```

3. **Start MongoDB**

   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Start the Backend Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Frontend Setup

1. **Install React Dependencies**

   ```bash
   # Install React peer dependencies if not already installed
   npm install react react-dom
   ```

2. **Build React Components**

   ```bash
   npm run build:react
   ```

3. **Start React Development Server**
   ```bash
   npm run dev:react
   ```

## 🎯 Quick Start

### Basic Usage

```jsx
import React from "react";
import ImageUpload from "./components/ImageUpload";

function MyApp() {
  const handleUploadSuccess = (result) => {
    console.log("Upload successful:", result);
    // Handle successful upload
  };

  const handleUploadError = (error) => {
    console.error("Upload failed:", error);
    // Handle upload error
  };

  return (
    <div>
      <h1>My App</h1>
      <ImageUpload
        apiEndpoint="/upload"
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />
    </div>
  );
}

export default MyApp;
```

### Advanced Configuration

```jsx
<ImageUpload
  // API Configuration
  apiEndpoint="/upload"
  // Upload Settings
  multiple={true}
  maxFiles={5}
  maxFileSize={5 * 1024 * 1024} // 5MB
  // UI Configuration
  showPreview={true}
  className="my-custom-class"
  // Callbacks
  onUploadSuccess={(result) => console.log("Success:", result)}
  onUploadError={(error) => console.error("Error:", error)}

  // Custom Upload Area Content
>
  <div className="custom-upload-area">
    <h3>Drop your images here</h3>
    <p>JPEG files only, max 5MB each</p>
  </div>
</ImageUpload>
```

## 🔧 Component Props

| Prop              | Type      | Default     | Description                                  |
| ----------------- | --------- | ----------- | -------------------------------------------- |
| `apiEndpoint`     | string    | `'/upload'` | Backend API endpoint for uploads             |
| `multiple`        | boolean   | `false`     | Allow multiple file selection                |
| `maxFiles`        | number    | `5`         | Maximum number of files (when multiple=true) |
| `maxFileSize`     | number    | `5242880`   | Maximum file size in bytes (5MB)             |
| `showPreview`     | boolean   | `true`      | Show image preview before upload             |
| `className`       | string    | `''`        | Custom CSS class for styling                 |
| `onUploadSuccess` | function  | `undefined` | Callback when upload succeeds                |
| `onUploadError`   | function  | `undefined` | Callback when upload fails                   |
| `children`        | ReactNode | `undefined` | Custom upload area content                   |

## 🛠 Backend API

### Endpoints

#### Upload Single Image

```http
POST /upload
Content-Type: multipart/form-data
Field: image (file)
```

#### Upload Multiple Images

```http
POST /upload/multiple
Content-Type: multipart/form-data
Field: images (multiple files)
```

#### Get Image

```http
GET /images/:id
```

#### Delete Image

```http
DELETE /images/:id
```

#### List Images

```http
GET /images?page=1&limit=10
```

#### Health Check

```http
GET /health
```

### Response Format

#### Success Response

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "fileId": "507f1f77bcf86cd799439011",
    "filename": "1629123456789_image.jpg",
    "size": 1048576,
    "uploadDate": "2023-08-15T10:30:00.000Z"
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Only JPEG images are allowed"
}
```

## 🔧 Backend Integration

### Express.js Integration

```javascript
const express = require("express");
const ImageUploadComponent = require("./ImageUploadComponent");

const app = express();
const imageUploader = new ImageUploadComponent({
  mongoUri: "mongodb://localhost:27017/myapp",
  maxFileSize: 10 * 1024 * 1024, // 10MB
  bucketName: "photos",
});

// Single image upload
app.post(
  "/api/upload",
  imageUploader.getSingleUploadMiddleware("photo"),
  imageUploader.handleImageUpload.bind(imageUploader)
);

// Multiple images upload
app.post(
  "/api/upload/multiple",
  imageUploader.getMultipleUploadMiddleware("photos", 3),
  imageUploader.handleMultipleImageUpload.bind(imageUploader)
);

app.listen(3000);
```

### Custom Validation

```javascript
const imageUploader = new ImageUploadComponent({
  mongoUri: "mongodb://localhost:27017/myapp",
  maxFileSize: 2 * 1024 * 1024, // 2MB
  validateFile: (file, callback) => {
    // Custom validation logic
    if (file.size > 2 * 1024 * 1024) {
      return callback(new Error("File too large"), false);
    }
    callback(null, true);
  },
});
```

## 🎨 Styling

### CSS Classes

The component uses these CSS classes that you can customize:

```css
.image-upload-component {
  /* Main container */
}
.upload-area {
  /* Drop zone area */
}
.preview-container {
  /* Preview section */
}
.preview-grid {
  /* Preview grid layout */
}
.upload-progress {
  /* Progress bar container */
}
.error-message {
  /* Error display */
}
.action-buttons {
  /* Button container */
}
```

### Custom Themes

```css
/* Dark theme example */
.image-upload-component.dark-theme .upload-area {
  background-color: #2d3748;
  border-color: #4a5568;
  color: white;
}

.image-upload-component.dark-theme .upload-area:hover {
  border-color: #63b3ed;
  background-color: #2c5282;
}
```

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Configuration Options

### Backend Configuration

```javascript
const imageUploader = new ImageUploadComponent({
  mongoUri: "mongodb://localhost:27017/imagedb",
  dbName: "imagedb",
  bucketName: "uploads",
  maxFileSize: 5 * 1024 * 1024, // 5MB
});
```

### Frontend Configuration

```jsx
// Multiple upload with custom settings
<ImageUpload
  apiEndpoint="/api/images/upload"
  multiple={true}
  maxFiles={10}
  maxFileSize={10 * 1024 * 1024}
  showPreview={true}
  onUploadSuccess={(result) => {
    // Update your app state
    setImages((prev) => [...prev, result.data]);
  }}
/>
```

## 🚀 Deployment

### Production Build

```bash
# Build React components for production
npm run build:react

# Start production server
npm start
```

### Environment Variables

```bash
# Production environment
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-mongo-host:27017/production_db
```

### Docker Support

```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:react

EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Integration Examples

### Next.js Integration

```jsx
// pages/upload.js
import dynamic from "next/dynamic";

const ImageUpload = dynamic(() => import("../components/ImageUpload"), {
  ssr: false,
});

export default function UploadPage() {
  return (
    <div>
      <h1>Upload Images</h1>
      <ImageUpload apiEndpoint="/api/upload" />
    </div>
  );
}
```

### React Context Integration

```jsx
import { createContext, useContext, useState } from "react";

const ImageContext = createContext();

export const useImages = () => useContext(ImageContext);

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]);

  const addImage = (imageData) => {
    setImages((prev) => [...prev, imageData]);
  };

  return (
    <ImageContext.Provider value={{ images, addImage }}>
      {children}
    </ImageContext.Provider>
  );
};

// Usage in component
function MyComponent() {
  const { addImage } = useImages();

  return <ImageUpload onUploadSuccess={(result) => addImage(result.data)} />;
}
```

## 📚 Additional Resources

- [MongoDB GridFS Documentation](https://docs.mongodb.com/manual/core/gridfs/)
- [React File Upload Best Practices](https://reactjs.org/docs/uncontrolled-components.html#the-file-input-tag)
- [Express.js Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For questions and support, please open an issue on the repository or contact the development team.
