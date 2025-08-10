const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const mime = require("mime-types");
const sharp = require("sharp");
const path = require("path");

/**
 * Image Upload Component
 * A reusable component for handling JPEG image uploads to MongoDB
 */
class ImageUploadComponent {
  constructor(options = {}) {
    this.mongoUri = options.mongoUri || "mongodb://localhost:27017/imageupload";
    this.dbName = options.dbName || "imageupload";
    this.bucketName = options.bucketName || "images";
    this.maxFileSize = options.maxFileSize || 50 * 1024 * 1024; // 50MB default
    this.allowedMimeTypes = ["image/jpeg", "image/jpg"];

    this.bucket = null;
    this.upload = null;
    this.initialized = false;

    // Don't call init() here - let the user call it explicitly
  }

  /**
   * Initialize the component
   */
  async init() {
    try {
      // Setup Multer first (doesn't require MongoDB)
      this.setupMulter();

      // Connect to MongoDB
      await this.connectToMongoDB();

      // Setup GridFS
      this.setupGridFS();

      this.initialized = true;
      console.log("Image Upload Component initialized successfully");
      return this;
    } catch (error) {
      console.error("Failed to initialize Image Upload Component:", error);
      throw error;
    }
  }

  /**
   * Connect to MongoDB
   */
  async connectToMongoDB() {
    try {
      await mongoose.connect(this.mongoUri);
      console.log("Connected to MongoDB successfully");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  /**
   * Setup GridFS for file storage
   */
  setupGridFS() {
    const db = mongoose.connection.db;
    this.bucket = new GridFSBucket(db, { bucketName: this.bucketName });
  }

  /**
   * Setup Multer for file upload handling
   */
  setupMulter() {
    const storage = multer.memoryStorage();

    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: this.maxFileSize,
      },
      fileFilter: (req, file, cb) => {
        this.validateFile(file, cb);
      },
    });
  }

  /**
   * Validate uploaded file
   */
  validateFile(file, callback) {
    // Check mime type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      return callback(new Error("Only JPEG images are allowed"), false);
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg"].includes(ext)) {
      return callback(
        new Error("Only .jpg and .jpeg files are allowed"),
        false
      );
    }

    callback(null, true);
  }

  /**
   * Process and validate image using Sharp
   */
  async processImage(buffer) {
    try {
      const metadata = await sharp(buffer).metadata();

      // Verify it's actually a JPEG
      if (!["jpeg", "jpg"].includes(metadata.format)) {
        throw new Error("File is not a valid JPEG image");
      }

      // Optional: Resize or compress image
      const processedBuffer = await sharp(buffer)
        .jpeg({ quality: 85 }) // Compress to 85% quality
        .toBuffer();

      return {
        buffer: processedBuffer,
        metadata: metadata,
      };
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  /**
   * Save image to GridFS
   */
  async saveImageToGridFS(buffer, filename, metadata = {}) {
    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(filename, {
        contentType: "image/jpeg",
        metadata: {
          ...metadata,
          uploadDate: new Date(),
          originalSize: buffer.length,
        },
      });

      uploadStream.on("finish", (file) => {
        resolve({
          success: true,
          fileId: file._id,
          filename: file.filename,
          size: file.length,
          uploadDate: file.uploadDate,
        });
      });

      uploadStream.on("error", (error) => {
        reject(error);
      });

      uploadStream.end(buffer);
    });
  }

  /**
   * Get middleware for single image upload
   */
  getSingleUploadMiddleware(fieldName = "image") {
    return this.upload.single(fieldName);
  }

  /**
   * Get middleware for multiple image uploads
   */
  getMultipleUploadMiddleware(fieldName = "images", maxCount = 10) {
    return this.upload.array(fieldName, maxCount);
  }

  /**
   * Handle image upload (to be used after multer middleware)
   */
  async handleImageUpload(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Process the image
      const { buffer, metadata } = await this.processImage(req.file.buffer);

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}_${req.file.originalname}`;

      // Save to GridFS
      const result = await this.saveImageToGridFS(buffer, filename, {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        width: metadata.width,
        height: metadata.height,
      });

      res.json({
        success: true,
        message: "Image uploaded successfully",
        data: result,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Image upload failed",
      });
    }
  }

  /**
   * Handle multiple image uploads
   */
  async handleMultipleImageUpload(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No image files provided",
        });
      }

      const uploadResults = [];

      for (const file of req.files) {
        try {
          // Process the image
          const { buffer, metadata } = await this.processImage(file.buffer);

          // Generate unique filename
          const timestamp = Date.now();
          const filename = `${timestamp}_${file.originalname}`;

          // Save to GridFS
          const result = await this.saveImageToGridFS(buffer, filename, {
            originalName: file.originalname,
            mimetype: file.mimetype,
            width: metadata.width,
            height: metadata.height,
          });

          uploadResults.push(result);
        } catch (error) {
          uploadResults.push({
            success: false,
            filename: file.originalname,
            error: error.message,
          });
        }
      }

      res.json({
        success: true,
        message: "Image upload completed",
        data: uploadResults,
      });
    } catch (error) {
      console.error("Multiple image upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Image upload failed",
      });
    }
  }

  /**
   * Get image by ID
   */
  async getImage(req, res) {
    try {
      const { id } = req.params;

      const downloadStream = this.bucket.openDownloadStream(
        new mongoose.Types.ObjectId(id)
      );

      downloadStream.on("error", (error) => {
        res.status(404).json({
          success: false,
          message: "Image not found",
        });
      });

      // Set proper headers
      res.set("Content-Type", "image/jpeg");
      downloadStream.pipe(res);
    } catch (error) {
      console.error("Get image error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve image",
      });
    }
  }

  /**
   * Delete image by ID
   */
  async deleteImage(req, res) {
    try {
      const { id } = req.params;

      await this.bucket.delete(new mongoose.Types.ObjectId(id));

      res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } catch (error) {
      console.error("Delete image error:", error);

      if (error.code === "ENOENT") {
        return res.status(404).json({
          success: false,
          message: "Image not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to delete image",
      });
    }
  }

  /**
   * List all images with pagination
   */
  async listImages(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const files = await this.bucket
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray();

      if (!files || files.length === 0) {
        return res.json({
          success: true,
          message: "No images found",
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
          },
        });
      }

      res.json({
        success: true,
        data: files.map((file) => ({
          id: file._id,
          filename: file.filename,
          size: file.length,
          uploadDate: file.uploadDate,
          metadata: file.metadata,
        })),
        pagination: {
          page,
          limit,
          total: files.length,
        },
      });
    } catch (error) {
      console.error("List images error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve images",
      });
    }
  }
}

module.exports = ImageUploadComponent;
