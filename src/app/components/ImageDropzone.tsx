import React, { useState, useCallback, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage, deleteStorageFile, isBase64Url } from '@/utils/storageUpload';
import { getImageUrl } from '@/utils/r2Upload';
import { toast } from 'sonner';

interface ImageDropzoneProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  bucket?: string;
  folder?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ 
  value, 
  onChange, 
  label = 'Drop an image here',
  className = '',
  bucket = 'images',
  folder
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value || '');
  const [isUploading, setIsUploading] = useState(false);

  // Sync previewUrl with value prop when it changes externally
  useEffect(() => {
    setPreviewUrl(value || '');
  }, [value]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processImageFile = useCallback(async (imageFile: File) => {
    try {
      setIsUploading(true);

      const previousUrl = previewUrl;
      
      // Upload to Supabase Storage with compression
      const publicUrl = await uploadImage(imageFile, bucket, folder);
      
      // Update preview and notify parent
      setPreviewUrl(publicUrl);
      if (onChange && typeof onChange === 'function') {
        onChange(publicUrl);
      }

      // Best-effort cleanup of previously stored image (overwrite semantics)
      // This prevents old R2 public URLs (r2.dev) from lingering after replacement.
      if (previousUrl && previousUrl !== publicUrl && !isBase64Url(previousUrl)) {
        try {
          await deleteStorageFile(previousUrl, bucket);
        } catch (cleanupError) {
          console.warn('[ImageDropzone] Failed to delete previous image:', cleanupError);
        }
      }
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('[ImageDropzone] Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onChange, bucket, folder, previewUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      processImageFile(imageFile);
    }
  }, [processImageFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  }, [processImageFile]);

  const handleClear = useCallback(() => {
    setPreviewUrl('');
    if (onChange && typeof onChange === 'function') {
      onChange('');
    }
  }, [onChange]);

  return (
    <div className={className}>
      {previewUrl ? (
        <div className="relative">
          <img 
            src={getImageUrl(previewUrl)} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </button>
          {/* Show indicator if this is old Base64 data */}
          {isBase64Url(previewUrl) && (
            <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
              ⚠️ Old Format - Re-upload to optimize
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isUploading ? 'cursor-wait opacity-75' : 'cursor-pointer'
          } ${
            isDragging 
              ? 'border-[#1887FC] bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`file-input-${label}`}
            disabled={isUploading}
          />
          <label 
            htmlFor={`file-input-${label}`}
            className={`${isUploading ? 'cursor-wait' : 'cursor-pointer'} flex flex-col items-center`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-[#1887FC] mb-2 animate-spin" />
                <p className="text-sm font-medium text-gray-700 mb-1">Uploading & compressing...</p>
                <p className="text-xs text-gray-500">Please wait</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
                <p className="text-xs text-gray-500">or click to browse</p>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
};