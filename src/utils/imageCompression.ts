import imageCompression from 'browser-image-compression';

// Debug flag - only log in development
const DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEBUG_COMPRESSION === 'true';

/**
 * Compresses an image file for optimal storage and bandwidth usage
 * @param imageFile - The original image file
 * @param maxSizeMB - Maximum file size in MB (default: 1MB)
 * @param maxWidthOrHeight - Maximum width or height in pixels (default: 1920px)
 * @returns Compressed image file
 */
export const compressImage = async (
  imageFile: File,
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 1920
): Promise<File> => {
  try {
    const options = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
      fileType: 'image/webp', // Better compression than JPEG
      initialQuality: 0.85, // Start with high quality
    };

    const compressedFile = await imageCompression(imageFile, options);
    
    DEBUG && console.log(`[ImageCompression] Original: ${(imageFile.size / 1024).toFixed(2)}KB → Compressed: ${(compressedFile.size / 1024).toFixed(2)}KB (${((1 - compressedFile.size / imageFile.size) * 100).toFixed(1)}% reduction)`);
    
    return compressedFile;
  } catch (error: unknown) {
    console.error('[ImageCompression] Compression failed:', error instanceof Error ? error.message : error);
    // Fallback to original file if compression fails
    return imageFile;
  }
};

/**
 * Compresses multiple images in parallel
 * @param imageFiles - Array of image files to compress
 * @param maxSizeMB - Maximum file size in MB (default: 1MB)
 * @param maxWidthOrHeight - Maximum width or height in pixels (default: 1920px)
 * @returns Array of compressed image files
 */
export const compressImages = async (
  imageFiles: File[],
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 1920
): Promise<File[]> => {
  try {
    const compressionPromises = imageFiles.map(file =>
      compressImage(file, maxSizeMB, maxWidthOrHeight)
    );
    
    const compressedFiles = await Promise.all(compressionPromises);
    
    const totalOriginalSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
    const totalCompressedSize = compressedFiles.reduce((sum, file) => sum + file.size, 0);
    
    DEBUG && console.log(`[ImageCompression] Batch: ${imageFiles.length} images, ${(totalOriginalSize / 1024).toFixed(2)}KB → ${(totalCompressedSize / 1024).toFixed(2)}KB (${((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1)}% reduction)`);
    
    return compressedFiles;
  } catch (error: unknown) {
    console.error('[ImageCompression] Batch compression failed:', error instanceof Error ? error.message : error);
    return imageFiles; // Fallback to original files
  }
};
