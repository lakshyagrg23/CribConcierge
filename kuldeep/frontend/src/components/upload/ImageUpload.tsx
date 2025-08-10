import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useImageUpload } from '@/hooks/useImageUpload';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  label: string;
  id: string;
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
  maxFileSize?: number;
  showPreview?: boolean;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  id,
  onUploadSuccess,
  onUploadError,
  className,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  showPreview = true,
  disabled = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    upload,
    isUploading,
    uploadProgress,
    error: uploadError
  } = useImageUpload({
    apiEndpoint: '/api/images/upload',
    onSuccess: (result) => {
      setUploadSuccess(result);
      onUploadSuccess?.(result);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      onUploadError?.(error);
    }
  });

  // Validate file
  const validateFile = (file: File): string | null => {
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
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    setSelectedFile(file);
    setUploadSuccess(null);

    // Create preview
    if (showPreview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    await upload(formData);
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const event = { target: { files: [file] } } as any;
      handleFileSelect(event);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div 
            className="flex flex-col items-center justify-center space-y-4 cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,image/jpeg"
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />
            
            {uploadSuccess ? (
              <div className="flex flex-col items-center space-y-2 text-green-600">
                <CheckCircle className="h-8 w-8" />
                <p className="text-sm font-medium">Upload Successful!</p>
                <p className="text-xs text-muted-foreground">
                  File ID: {uploadSuccess.data?.fileId?.slice(-8)}
                </p>
              </div>
            ) : selectedFile ? (
              <div className="flex flex-col items-center space-y-2">
                <ImageIcon className="h-8 w-8 text-primary" />
                <p className="text-sm font-medium">Ready to upload</p>
                <p className="text-xs text-muted-foreground">{selectedFile.name}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <p className="text-sm font-medium">
                  Drop JPEG image here or click to browse
                </p>
                <p className="text-xs">
                  Maximum file size: {Math.round(maxFileSize / (1024 * 1024))}MB
                </p>
              </div>
            )}
          </div>

          {/* Preview */}
          {showPreview && preview && (
            <div className="mt-4 relative">
              <img 
                src={preview} 
                alt="Preview"
                className="w-full h-32 object-cover rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Progress */}
          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Error */}
          {uploadError && (
            <div className="mt-4 flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{uploadError}</p>
            </div>
          )}

          {/* Actions */}
          {selectedFile && !uploadSuccess && !isUploading && (
            <div className="mt-4 flex space-x-2">
              <Button 
                onClick={handleUpload}
                disabled={disabled}
                className="flex-1"
              >
                Upload Image
              </Button>
              <Button 
                onClick={removeFile}
                variant="outline"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUpload;
