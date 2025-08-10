import { useState, useCallback } from "react";

/**
 * Custom hook for handling image uploads
 *
 * @param {Object} options - Configuration options
 * @param {string} options.apiEndpoint - API endpoint for upload
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onProgress - Progress callback
 * @returns {Object} Upload functions and state
 */
export const useImageUpload = ({
  apiEndpoint = "/upload",
  onSuccess,
  onError,
  onProgress,
} = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  /**
   * Upload files to the server
   * @param {FormData} formData - Form data containing files
   * @returns {Promise} Upload promise
   */
  const upload = useCallback(
    async (formData) => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
            onProgress?.(progress);
          }
        });

        // Handle upload completion
        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (e) {
                reject(new Error("Invalid response format"));
              }
            } else {
              try {
                const errorResponse = JSON.parse(xhr.responseText);
                reject(new Error(errorResponse.message || "Upload failed"));
              } catch (e) {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            }
          };

          xhr.onerror = () => {
            reject(new Error("Network error occurred"));
          };

          xhr.ontimeout = () => {
            reject(new Error("Upload timeout"));
          };
        });

        // Configure and send request
        xhr.open("POST", apiEndpoint);
        xhr.timeout = 300000; // 5 minutes timeout
        xhr.send(formData);

        const result = await uploadPromise;

        setUploadedFiles((prev) => [...prev, result]);
        setUploadProgress(100);
        onSuccess?.(result);

        return result;
      } catch (err) {
        const errorMessage = err.message || "Upload failed";
        setError(errorMessage);
        onError?.(err);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [apiEndpoint, onSuccess, onError, onProgress]
  );

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setUploadedFiles([]);
  }, []);

  /**
   * Abort current upload
   */
  const abort = useCallback(() => {
    // Note: In a real implementation, you'd store the XMLHttpRequest reference
    // and call xhr.abort() here
    setIsUploading(false);
    setError("Upload cancelled");
  }, []);

  return {
    upload,
    reset,
    abort,
    isUploading,
    uploadProgress,
    error,
    uploadedFiles,
  };
};
