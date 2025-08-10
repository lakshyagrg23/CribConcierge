import React, { useState, useRef } from 'react';
import { useImageUpload } from '../hooks/useImageUpload';
import './ImageUpload.css';

/**
 * ImageUpload Component
 * A reusable React component for uploading JPEG images
 * 
 * Props:
 * - apiEndpoint: string - Backend API endpoint (default: '/upload')
 * - multiple: boolean - Allow multiple file selection (default: false)
 * - maxFiles: number - Maximum number of files when multiple is true (default: 5)
 * - maxFileSize: number - Maximum file size in bytes (default: 5MB)
 * - onUploadSuccess: function - Callback when upload succeeds
 * - onUploadError: function - Callback when upload fails
 * - showPreview: boolean - Show image preview (default: true)
 * - className: string - Custom CSS class
 */
const ImageUpload = ({
  apiEndpoint = '/upload',
  multiple = false,
  maxFiles = 5,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  onUploadSuccess,
  onUploadError,
  showPreview = true,
  className = '',
  children
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const {
    upload,
    isUploading,
    uploadProgress,
    error: uploadError
  } = useImageUpload({
    apiEndpoint: multiple ? '/upload/multiple' : apiEndpoint,
    onSuccess: onUploadSuccess,
    onError: onUploadError
  });

  // Validate file
  const validateFile = (file) => {
    // Check file type
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      return 'Only JPEG images are allowed';
    }

    // Check file size
    if (file.size > maxFileSize) {
      return `File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file count for multiple uploads
    if (multiple && files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = [];
    const validPreviews = [];
    let hasErrors = false;

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        alert(`${file.name}: ${error}`);
        hasErrors = true;
      } else {
        validFiles.push(file);
        
        // Create preview if enabled
        if (showPreview) {
          const reader = new FileReader();
          reader.onload = (e) => {
            validPreviews.push({
              file: file,
              url: e.target.result,
              id: Date.now() + Math.random()
            });
            
            if (validPreviews.length === validFiles.length) {
              setPreviews(validPreviews);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    });

    if (!hasErrors && validFiles.length > 0) {
      setSelectedFiles(validFiles);
      if (!showPreview) {
        setPreviews([]);
      }
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file');
      return;
    }

    const formData = new FormData();
    
    if (multiple) {
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });
    } else {
      formData.append('image', selectedFiles[0]);
    }

    await upload(formData);
  };

  // Remove selected file
  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  // Clear all files
  const clearFiles = () => {
    setSelectedFiles([]);
    setPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const fileList = new DataTransfer();
    files.forEach(file => fileList.items.add(file));
    
    const event = { target: { files: fileList.files } };
    handleFileSelect(event);
  };

  return (
    <div className={`image-upload-component ${className}`}>
      {/* Upload Area */}
      <div 
        className="upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,image/jpeg"
          multiple={multiple}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {children || (
          <div className="upload-content">
            <div className="upload-icon">📷</div>
            <p className="upload-text">
              {multiple 
                ? `Drop up to ${maxFiles} JPEG images here or click to browse`
                : 'Drop a JPEG image here or click to browse'
              }
            </p>
            <p className="upload-subtext">
              Maximum file size: {Math.round(maxFileSize / (1024 * 1024))}MB
            </p>
          </div>
        )}
      </div>

      {/* File Previews */}
      {showPreview && previews.length > 0 && (
        <div className="preview-container">
          <h4>Selected Images:</h4>
          <div className="preview-grid">
            {previews.map((preview, index) => (
              <div key={preview.id} className="preview-item">
                <img 
                  src={preview.url} 
                  alt={`Preview ${index + 1}`}
                  className="preview-image"
                />
                <div className="preview-info">
                  <span className="preview-name">{preview.file.name}</span>
                  <span className="preview-size">
                    {(preview.file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button 
                  className="remove-button"
                  onClick={() => removeFile(index)}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File List (when preview is disabled) */}
      {!showPreview && selectedFiles.length > 0 && (
        <div className="file-list">
          <h4>Selected Files:</h4>
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <button 
                className="remove-button"
                onClick={() => removeFile(index)}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="progress-text">
            Uploading... {uploadProgress}%
          </span>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="error-message">
          <span>❌ {uploadError}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          type="button"
        >
          {isUploading ? 'Uploading...' : 'Upload Images'}
        </button>
        
        {selectedFiles.length > 0 && (
          <button
            className="clear-button"
            onClick={clearFiles}
            disabled={isUploading}
            type="button"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
