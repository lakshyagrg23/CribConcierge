import { useState, useCallback } from 'react';

interface UseImageUploadOptions {
  apiEndpoint: string;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

interface UploadResult {
  success: boolean;
  data?: any;
  message?: string;
}

export const useImageUpload = (options: UseImageUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (formData: FormData): Promise<UploadResult | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch(options.apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error.message);
      
      if (options.onError) {
        options.onError(error);
      }
      
      return null;
    } finally {
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [options]);

  const reset = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  return {
    upload,
    isUploading,
    uploadProgress,
    error,
    reset
  };
};
