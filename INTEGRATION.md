# Quick Integration Guide

This document provides a step-by-step guide for integrating the Image Upload Component into your existing project.

## 🎯 For Your Team

### 1. Copy Required Files

Copy these files from this component to your project:

#### Backend Files (Node.js/Express)

```
src/ImageUploadComponent.js  → Copy to your backend
```

#### React Frontend Files

```
src/react/components/ImageUpload.jsx     → Copy to your components folder
src/react/components/ImageUpload.css     → Copy to your components folder
src/react/hooks/useImageUpload.js        → Copy to your hooks folder
src/react/utils/imageUtils.js            → Copy to your utils folder
```

### 2. Install Dependencies

#### Backend Dependencies

```bash
npm install express multer mongoose gridfs-stream mime-types sharp cors
```

#### Frontend Dependencies (if not already installed)

```bash
npm install react react-dom
```

### 3. Backend Integration

Add this to your Express server:

```javascript
// server.js or app.js
const express = require("express");
const cors = require("cors");
const ImageUploadComponent = require("./path/to/ImageUploadComponent");

const app = express();

// Initialize image uploader
const imageUploader = new ImageUploadComponent({
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/yourapp",
  dbName: "yourapp",
  bucketName: "images",
  maxFileSize: 5 * 1024 * 1024, // 5MB
});

// Middleware
app.use(cors());
app.use(express.json());

// Image upload routes
app.post(
  "/api/upload",
  imageUploader.getSingleUploadMiddleware("image"),
  imageUploader.handleImageUpload.bind(imageUploader)
);

app.post(
  "/api/upload/multiple",
  imageUploader.getMultipleUploadMiddleware("images", 5),
  imageUploader.handleMultipleImageUpload.bind(imageUploader)
);

app.get("/api/images/:id", imageUploader.getImage.bind(imageUploader));
app.delete("/api/images/:id", imageUploader.deleteImage.bind(imageUploader));
app.get("/api/images", imageUploader.listImages.bind(imageUploader));
```

### 4. Frontend Integration

#### Basic Usage in Your React Component

```jsx
import React from "react";
import ImageUpload from "./components/ImageUpload";

function YourComponent() {
  const handleUploadSuccess = (result) => {
    console.log("Upload successful:", result);
    // Add your logic here (e.g., update state, show notification)
  };

  const handleUploadError = (error) => {
    console.error("Upload failed:", error);
    // Add your error handling here
  };

  return (
    <div>
      <h2>Upload Property Images</h2>
      <ImageUpload
        apiEndpoint="/api/upload"
        multiple={true}
        maxFiles={5}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        showPreview={true}
      />
    </div>
  );
}

export default YourComponent;
```

#### Integration with Your Form

```jsx
import React, { useState } from "react";
import ImageUpload from "./components/ImageUpload";

function PropertyForm() {
  const [formData, setFormData] = useState({
    propertyName: "",
    address: "",
    uploadedImages: [],
  });

  const handleImageUpload = (result) => {
    setFormData((prev) => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, result.data],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit form with image IDs
    console.log("Form data with images:", formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Property Name"
        value={formData.propertyName}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, propertyName: e.target.value }))
        }
      />

      <input
        type="text"
        placeholder="Address"
        value={formData.address}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, address: e.target.value }))
        }
      />

      <h3>Property Images</h3>
      <ImageUpload
        apiEndpoint="/api/upload"
        multiple={true}
        maxFiles={10}
        onUploadSuccess={handleImageUpload}
        onUploadError={(error) => alert("Upload failed: " + error.message)}
      />

      <button type="submit">Save Property</button>
    </form>
  );
}
```

### 5. Environment Setup

Create a `.env` file in your project root:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/yourapp
DB_NAME=yourapp

# Server Configuration
PORT=3000
NODE_ENV=development

# Upload Configuration
MAX_FILE_SIZE=5242880
MAX_FILES_PER_UPLOAD=5
```

### 6. Database Schema (Optional)

If you want to reference uploaded images in your existing MongoDB collections:

```javascript
// Property schema example
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  name: String,
  address: String,
  description: String,
  images: [
    {
      fileId: { type: mongoose.Schema.Types.ObjectId, ref: "fs.files" },
      filename: String,
      uploadDate: Date,
      isPrimary: { type: Boolean, default: false },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Property", propertySchema);
```

### 7. API Usage Examples

#### Get Uploaded Image URL

```javascript
// In your frontend component
const getImageUrl = (fileId) => {
  return `/api/images/${fileId}`;
};

// Display uploaded images
{
  formData.uploadedImages.map((image) => (
    <img
      key={image.fileId}
      src={getImageUrl(image.fileId)}
      alt={image.filename}
      style={{ width: "200px", height: "150px", objectFit: "cover" }}
    />
  ));
}
```

#### Delete Uploaded Image

```javascript
const deleteImage = async (fileId) => {
  try {
    const response = await fetch(`/api/images/${fileId}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (result.success) {
      // Remove from state
      setFormData((prev) => ({
        ...prev,
        uploadedImages: prev.uploadedImages.filter(
          (img) => img.fileId !== fileId
        ),
      }));
    }
  } catch (error) {
    console.error("Delete failed:", error);
  }
};
```

### 8. Styling Customization

Add custom styles to match your project's design:

```css
/* Add to your global CSS or component CSS */
.image-upload-component {
  /* Override default styles */
  max-width: 100%;
  margin-bottom: 2rem;
}

.image-upload-component .upload-area {
  border-color: #your-brand-color;
  background-color: #your-background-color;
}

.image-upload-component .upload-button {
  background: linear-gradient(
    135deg,
    #your-primary-color,
    #your-secondary-color
  );
}
```

### 9. Error Handling

Add proper error handling for your application:

```javascript
const handleUploadError = (error) => {
  // Log error for debugging
  console.error("Image upload error:", error);

  // Show user-friendly message
  switch (error.message) {
    case "Only JPEG images are allowed":
      showNotification("Please select only JPEG images", "error");
      break;
    case "File too large":
      showNotification("File size must be less than 5MB", "error");
      break;
    default:
      showNotification("Upload failed. Please try again.", "error");
  }
};
```

### 10. Testing

Test the integration:

1. **Start your MongoDB instance**
2. **Start your backend server**
3. **Test the upload endpoints** using Postman or your frontend
4. **Verify images are stored** in MongoDB GridFS
5. **Test image retrieval** by accessing `/api/images/:id`

## 🚨 Important Notes

1. **MongoDB Connection**: Ensure MongoDB is running and accessible
2. **File Size Limits**: Adjust `maxFileSize` based on your requirements
3. **CORS**: Make sure CORS is properly configured for your frontend domain
4. **Error Handling**: Implement proper error handling for production
5. **Security**: Add authentication and authorization as needed
6. **Performance**: Consider adding caching for frequently accessed images

## 🛠 Troubleshooting

### Common Issues

1. **"Cannot connect to MongoDB"**

   - Check MongoDB connection string
   - Ensure MongoDB service is running

2. **"CORS error"**

   - Add your frontend domain to CORS configuration
   - Check if CORS middleware is properly configured

3. **"File upload fails"**

   - Check file size limits
   - Verify file type validation
   - Check server disk space

4. **"Images not displaying"**
   - Verify image ID in database
   - Check image retrieval endpoint
   - Ensure proper MIME types are set

## 📞 Need Help?

If you encounter any issues during integration:

1. Check the main README.md for detailed documentation
2. Review the example code in `src/react/App.jsx`
3. Test the demo application first to ensure everything works
4. Contact the component author for specific integration questions

Good luck with your integration! 🚀
