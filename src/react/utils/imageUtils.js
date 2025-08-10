/**
 * Utility functions for image upload component
 */

/**
 * Validate if a file is a valid JPEG image
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} Validation result
 */
export const validateJpegFile = (file, maxSize = 50 * 1024 * 1024) => {
  const errors = [];

  // Check if file exists
  if (!file) {
    errors.push("No file provided");
    return { isValid: false, errors };
  }

  // Check file type
  const validTypes = ["image/jpeg", "image/jpg"];
  if (!validTypes.includes(file.type)) {
    errors.push("Only JPEG images are allowed");
  }

  // Check file extension
  const validExtensions = [".jpg", ".jpeg"];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    errors.push("File must have .jpg or .jpeg extension");
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  // Check if file is too small (likely corrupted)
  if (file.size < 100) {
    errors.push("File appears to be corrupted or too small");
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    },
  };
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Create a preview URL for an image file
 * @param {File} file - Image file
 * @returns {Promise<string>} Preview URL
 */
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Invalid image file"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Compress image file (client-side basic compression)
 * @param {File} file - Image file to compress
 * @param {number} quality - Compression quality (0-1)
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Promise<Blob>} Compressed image blob
 */
export const compressImage = (
  file,
  quality = 0.8,
  maxWidth = 1920,
  maxHeight = 1920
) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Compression failed"));
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate unique filename with timestamp
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");

  return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
};

/**
 * Check if browser supports drag and drop
 * @returns {boolean} Support status
 */
export const supportsDragAndDrop = () => {
  const div = document.createElement("div");
  return (
    ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
    "FormData" in window &&
    "FileReader" in window
  );
};

/**
 * Extract EXIF data from image file (basic implementation)
 * @param {File} file - Image file
 * @returns {Promise<Object>} EXIF data
 */
export const extractExifData = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const view = new DataView(arrayBuffer);

      // Basic EXIF extraction (simplified)
      const exifData = {
        fileSize: file.size,
        fileName: file.name,
        lastModified: new Date(file.lastModified),
        type: file.type,
      };

      resolve(exifData);
    };

    reader.onerror = () => {
      resolve({});
    };

    reader.readAsArrayBuffer(file.slice(0, 65536)); // Read first 64KB
  });
};

/**
 * API helper functions
 */
export const apiHelpers = {
  /**
   * Upload single image
   * @param {File} file - Image file
   * @param {string} endpoint - API endpoint
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Upload promise
   */
  uploadSingle: async (file, endpoint = "/upload", onProgress) => {
    const formData = new FormData();
    formData.append("image", file);

    return fetch(endpoint, {
      method: "POST",
      body: formData,
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      return response.json();
    });
  },

  /**
   * Upload multiple images
   * @param {File[]} files - Image files
   * @param {string} endpoint - API endpoint
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Upload promise
   */
  uploadMultiple: async (files, endpoint = "/upload/multiple", onProgress) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    return fetch(endpoint, {
      method: "POST",
      body: formData,
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      return response.json();
    });
  },

  /**
   * Get uploaded image
   * @param {string} imageId - Image ID
   * @param {string} baseUrl - Base API URL
   * @returns {string} Image URL
   */
  getImageUrl: (imageId, baseUrl = "") => {
    return `${baseUrl}/images/${imageId}`;
  },

  /**
   * Delete image
   * @param {string} imageId - Image ID
   * @param {string} baseUrl - Base API URL
   * @returns {Promise} Delete promise
   */
  deleteImage: async (imageId, baseUrl = "") => {
    return fetch(`${baseUrl}/images/${imageId}`, {
      method: "DELETE",
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
      return response.json();
    });
  },
};
