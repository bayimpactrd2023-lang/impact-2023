import React, { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { isBase64Url } from '@/utils/storageUpload';
import { getImageUrl } from '@/utils/r2Upload';

interface MultiImageDropzoneProps {
  images: (string | File)[];
  onChange: (images: (string | File)[]) => void;
  label?: string;
}

export const MultiImageDropzone: React.FC<MultiImageDropzoneProps> = ({
  images,
  onChange,
  label = 'Gallery Images'
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const getImageHash = useCallback((imageData: string | File): string => {
    if (imageData instanceof File) {
      return `file-${imageData.name}-${imageData.size}-${imageData.lastModified}`;
    }
    if (typeof imageData !== 'string') return '';
    // For storage URLs, use the full URL
    if (!isBase64Url(imageData)) {
      return imageData;
    }
    // For base64, extract the actual base64 data
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    const hashLength = Math.min(100, base64Data.length);
    return base64Data.substring(0, hashLength) + base64Data.substring(base64Data.length - hashLength);
  }, []);

  // Filter out any duplicate images before rendering (safety check)
  const uniqueImages = React.useMemo(() => {
    const seen = new Set<string>();
    const unique: (string | File)[] = [];
    
    images.forEach(img => {
      const hash = getImageHash(img);
      if (!seen.has(hash)) {
        seen.add(hash);
        unique.push(img);
      }
    });
    
    return unique;
  }, [images, getImageHash]);

  // Auto-clean duplicates from the images array
  React.useEffect(() => {
    if (images.length > 0 && uniqueImages.length < images.length) {
      const duplicatesFound = images.length - uniqueImages.length;
      if (onChange && typeof onChange === 'function') {
        onChange(uniqueImages);
      }
      toast.info(`${duplicatesFound} duplicate image${duplicatesFound > 1 ? 's' : ''} removed automatically`);
    }
  }, [images, uniqueImages, onChange]);

  // Handle multiple file selection - NO AUTOMATIC UPLOAD
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;

    // Check for duplicates
    const existingHashes = new Set(uniqueImages.map(img => getImageHash(img)));
    const uniqueNewFiles = imageFiles.filter(file => !existingHashes.has(getImageHash(file)));
    
    if (uniqueNewFiles.length > 0 && onChange && typeof onChange === 'function') {
      onChange([...images, ...uniqueNewFiles]);
    }
    
    const duplicateCount = imageFiles.length - uniqueNewFiles.length;
    if (duplicateCount > 0) {
      toast.error(`${duplicateCount} duplicate image${duplicateCount > 1 ? 's' : ''} skipped`);
    }
  }, [images, onChange, uniqueImages, getImageHash]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (onChange && typeof onChange === 'function') {
      onChange(newImages);
    }
  };

  // Count how many old Base64 images exist
  const base64Count = uniqueImages.filter(img => typeof img === 'string' && isBase64Url(img)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{uniqueImages.length} image{uniqueImages.length !== 1 ? 's' : ''}</span>
          {base64Count > 0 && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              ⚠️ {base64Count} old format
            </span>
          )}
        </div>
      </div>

      {/* Add Images Dropzone - Always visible */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging 
            ? 'border-[#1887FC] bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="multi-image-input"
        />
        <label 
          htmlFor="multi-image-input"
          className="cursor-pointer flex flex-col items-center"
        >
          {(
            <>
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                {images.length === 0 ? 'Drop images here' : 'Add more images'}
              </p>
              <p className="text-xs text-gray-500">
                or click to browse (multiple selection supported)
              </p>
            </>
          )}
        </label>
      </div>

      {/* Existing Images Grid */}
      {uniqueImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uniqueImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image instanceof File ? URL.createObjectURL(image) : getImageUrl(image as string)}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {index + 1}
              </div>
              {/* Indicator for old Base64 images */}
              {typeof image === 'string' && isBase64Url(image) && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                  ⚠️
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};