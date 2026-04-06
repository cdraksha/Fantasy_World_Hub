import { useRef, useState, useCallback } from 'react';
import { ImagePlus, X, AlertCircle, Loader2 } from 'lucide-react';
import { Dialog } from '../ui/dialog';

// Utility function for className merging
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const ImageUpload = ({ 
  className = "",
  onImageUpload, 
  onImageRemove,
  preview,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8,
  minWidth = 100,
  minHeight = 100,
  placeholderText = "Drop an image here, or click to select",
  disabled = false,
  showPreview = true,
  maxSizeInMB = 5
}) => {
  // Refs
  const fileInputRef = useRef(null);
  
  // State
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  
  // Constants
  const ACCEPTED_FILE_TYPES = {
    'image/png': true,
    'image/jpeg': true,
    'image/jpg': true,
    'image/gif': true
  };

  const FILE_TYPE_NAMES = '.png, .jpg, .jpeg, .gif';
  const MAX_FILE_SIZE = maxSizeInMB * 1024 * 1024; // Convert MB to bytes

  // Validation
  const validateFile = useCallback((file) => {
    setError(null);
    
    if (!file) {
      setError('No file selected');
      return false;
    }

    if (!ACCEPTED_FILE_TYPES[file.type]) {
      setError(`Invalid file type. Please upload ${FILE_TYPE_NAMES}`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size should be less than ${maxSizeInMB}MB`);
      return false;
    }

    return true;
  }, [maxSizeInMB]);

  // Image Processing Functions
  const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({ width: img.width, height: img.height });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
    });
  };

  const resizeImage = useCallback(async (file) => {
    try {
      // Get original dimensions
      const { width: originalWidth, height: originalHeight } = await getImageDimensions(file);
      
      // Validate minimum dimensions
      if (originalWidth < minWidth || originalHeight < minHeight) {
        throw new Error(`Image must be at least ${minWidth}x${minHeight} pixels`);
      }

      return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        img.onload = () => {
          // Calculate new dimensions
          let newWidth = originalWidth;
          let newHeight = originalHeight;

          // Scale down if larger than max dimensions
          if (newWidth > maxWidth) {
            newHeight = Math.round((maxWidth * newHeight) / newWidth);
            newWidth = maxWidth;
          }

          if (newHeight > maxHeight) {
            newWidth = Math.round((maxHeight * newWidth) / newHeight);
            newHeight = maxHeight;
          }

          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = newWidth;
          canvas.height = newHeight;

          const ctx = canvas.getContext('2d');
          
          // Enable high-quality resizing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          try {
            // Draw resized image
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            
            // Convert to desired format
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Failed to process image'));
                return;
              }

              // Convert Blob to base64
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64String = reader.result;
                
                // Validate final size
                if (base64String.length > MAX_FILE_SIZE) {
                  reject(new Error(`Processed image is too large. Please try a smaller image or reduce quality.`));
                  return;
                }
                
                resolve(base64String);
              };
              reader.onerror = () => reject(new Error('Failed to process image'));
              reader.readAsDataURL(blob);
            }, file.type, quality);

          } catch (err) {
            reject(new Error('Failed to process image'));
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Failed to load image'));
        };

        img.src = objectUrl;
      });
    } catch (err) {
      throw new Error(err.message || 'Failed to process image');
    }
  }, [maxWidth, maxHeight, minWidth, minHeight, quality, MAX_FILE_SIZE]);

  // Event Handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [disabled]);

  const handleFile = async (file) => {
    if (!validateFile(file)) return;

    setIsProcessing(true);
    setError(null);

    try {
      const resizedImage = await resizeImage(file);
      onImageUpload?.(resizedImage);
    } catch (err) {
      console.error('Image processing error:', err);
      setError(err.message || 'Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    setError(null);
    onImageRemove?.();
  }, [onImageRemove]);

  const handleClick = useCallback(() => {
    if (!disabled && !isProcessing) {
      fileInputRef.current?.click();
    }
  }, [disabled, isProcessing]);

  // Preview Dialog Component
  const PreviewDialog = () => (
    <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] overflow-auto">
          <img
            src={preview}
            alt="Full size preview"
            className="max-w-full h-auto"
          />
          <button
            onClick={() => setPreviewDialog(false)}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );

  return (
    <div className={cn("w-full space-y-2", className)}>
      {!preview ? (
        <>
          <div
            onClick={handleClick}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "relative group border-2 border-dashed rounded-lg transition-colors duration-200",
              dragActive 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400",
              "min-h-[150px] flex items-center justify-center",
              error ? "border-red-500 bg-red-50" : "",
              (disabled || isProcessing) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleChange}
              accept={FILE_TYPE_NAMES}
              className="hidden"
              disabled={disabled || isProcessing}
            />
            
            <div className="flex flex-col items-center gap-2 text-gray-500">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="text-sm">Processing image...</span>
                </div>
              ) : (
                <>
                  <ImagePlus 
                    className={cn(
                      "w-8 h-8 transition-colors group-hover:text-gray-600",
                      error ? "text-red-500" : ""
                    )}
                  />
                  <span className={cn(
                    "text-sm font-medium transition-colors group-hover:text-gray-600 text-center",
                    error ? "text-red-500" : ""
                  )}>
                    {placeholderText}
                  </span>
                  <span className="text-xs text-center">
                    Supported formats: PNG, JPG, JPEG, GIF (Max: {maxSizeInMB}MB)
                    <br />
                    Minimum size: {minWidth}x{minHeight}px
                    <br />
                    Maximum size: {maxWidth}x{maxHeight}px
                  </span>
                </>
              )}
            </div>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm p-2 bg-red-50 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <p>{error}</p>
            </div>
          )}
        </>
      ) : (
        <div className="w-fit">
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-32 rounded-lg object-cover"
              onClick={() => showPreview && setPreviewDialog(true)}
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm"
              type="button"
              aria-label="Remove image"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {showPreview && <PreviewDialog />}
    </div>
  );
};

export default ImageUpload;