const express = require('express');
const cors = require('cors');
const ImageUploadComponent = require('./ImageUploadComponent');

console.log('🔄 Loading Image Upload Server...');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the Image Upload Component
console.log('🔄 Creating ImageUploadComponent instance...');
const imageUploader = new ImageUploadComponent({
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/imageupload',
  dbName: 'imageupload',
  bucketName: 'images',
  maxFileSize: 5 * 1024 * 1024 // 5MB
});

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.static('public')); // Serve static files from public directory

// Initialize the component and start server
async function startServer() {
  try {
    console.log('🔄 Starting server initialization...');
    
    // Initialize the image upload component
    console.log('🔄 Initializing image upload component...');
    await imageUploader.init();
    console.log('✅ Image upload component initialized');
    
    // Routes (only define after initialization)
    console.log('🔄 Setting up routes...');
    setupRoutes();
    console.log('✅ Routes set up');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Image Upload Service running on port ${PORT}`);
      console.log(`📖 API Documentation available at http://localhost:${PORT}`);
      console.log(`🚀 Server ready for requests!`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

function setupRoutes() {
  /**
   * Upload single image
   * POST /upload
   * Content-Type: multipart/form-data
   * Field: image (file)
   */
  app.post('/upload', 
    imageUploader.getSingleUploadMiddleware('image'),
    imageUploader.handleImageUpload.bind(imageUploader)
  );

  /**
   * Upload multiple images
   * POST /upload/multiple
   * Content-Type: multipart/form-data
   * Field: images (multiple files)
   */
  app.post('/upload/multiple',
    imageUploader.getMultipleUploadMiddleware('images', 5),
    imageUploader.handleMultipleImageUpload.bind(imageUploader)
  );

  /**
   * Get image by ID
   * GET /images/:id
   */
  app.get('/images/:id', imageUploader.getImage.bind(imageUploader));

  /**
   * Delete image by ID
   * DELETE /images/:id
   */
  app.delete('/images/:id', imageUploader.deleteImage.bind(imageUploader));

  /**
   * List all images with pagination
   * GET /images?page=1&limit=10
   */
  app.get('/images', imageUploader.listImages.bind(imageUploader));

  /**
   * Health check endpoint
   */
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Image Upload Service is running',
      timestamp: new Date().toISOString(),
      mongodb: imageUploader.initialized ? 'Connected' : 'Disconnected'
    });
  });

  /**
   * Root endpoint with usage instructions
   */
  app.get('/', (req, res) => {
    res.json({
      service: 'Image Upload Component',
      version: '1.0.0',
      status: 'Running',
      mongodb: imageUploader.initialized ? 'Connected' : 'Disconnected',
      endpoints: {
        'POST /upload': 'Upload single JPEG image',
        'POST /upload/multiple': 'Upload multiple JPEG images',
        'GET /images/:id': 'Get image by ID',
        'DELETE /images/:id': 'Delete image by ID',
        'GET /images': 'List all images (with pagination)',
        'GET /health': 'Health check'
      },
      usage: {
        singleUpload: {
          method: 'POST',
          url: '/upload',
          contentType: 'multipart/form-data',
          field: 'image',
          description: 'Upload a single JPEG image file'
        },
        multipleUpload: {
          method: 'POST',
          url: '/upload/multiple',
          contentType: 'multipart/form-data',
          field: 'images',
          description: 'Upload multiple JPEG image files (max 5)'
        }
      }
    });
  });

  // Error handling middleware
  app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found'
    });
  });
}

// Start the server
console.log('🚀 Starting server...');
startServer();

module.exports = app;
