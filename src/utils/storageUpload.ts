import { supabase } from '@/lib/supabase';
import { compressImage, compressImages } from './imageCompression';
import { uploadImageToR2, deleteImageFromR2, isR2Configured } from './r2Upload';

/**
 * Generates a unique filename with timestamp and random string
 */
const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split('.').pop() || 'webp';
  return `${timestamp}_${randomString}.${extension}`;
};

/**
 * Uploads an image to Supabase Storage with compression
 * NOW USES R2 IF CONFIGURED (cost optimization)
 * @param file - Image file to upload
 * @param bucket - Storage bucket name (default: 'images')
 * @param folder - Optional folder path within bucket
 * @returns Public URL of uploaded image
 */
export const uploadImage = async (
  file: File,
  bucket: string = 'images',
  folder?: string
): Promise<string> => {
  try {
    // Step 1: Compress the image
    const compressedFile = await compressImage(file);
    
    // Step 2: Try R2 if configured, otherwise Supabase Storage
    if (isR2Configured()) {
      console.log('[StorageUpload] Attempting R2 upload...');
      try {
        const url = await uploadImageToR2(compressedFile, folder || bucket);
        console.log(`[StorageUpload] Image uploaded to R2: ${url}`);
        return url;
      } catch (r2Error) {
        console.warn('[StorageUpload] R2 upload failed, falling back to Supabase:', r2Error);
        // Continue to Supabase fallback below
      }
    }
    
    // Fallback to Supabase Storage
    console.log('[StorageUpload] R2 not configured, using Supabase Storage');
    
    // Step 3: Generate unique filename
    const fileName = generateUniqueFileName(file.name);
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    // Step 4: Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedFile, {
        cacheControl: '31536000', // 1 year cache
        upsert: false,
        contentType: compressedFile.type,
      });
    
    if (error) {
      console.error('[StorageUpload] Upload failed:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    // Step 5: Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    console.log(`[StorageUpload] Image uploaded successfully: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error('[StorageUpload] Error:', error);
    throw error;
  }
};

/**
 * Uploads multiple images to Supabase Storage with compression
 * @param files - Array of image files to upload
 * @param bucket - Storage bucket name (default: 'images')
 * @param folder - Optional folder path within bucket
 * @returns Array of public URLs
 */
export const uploadImages = async (
  files: File[],
  bucket: string = 'images',
  folder?: string
): Promise<string[]> => {
  try {
    // Step 1: Compress all images in parallel
    const compressedFiles = await compressImages(files);
    
    // Step 2: Upload all images in parallel
    const uploadPromises = compressedFiles.map(async (file, index) => {
      const fileName = generateUniqueFileName(files[index].name);
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '31536000', // 1 year cache
          upsert: false,
          contentType: file.type,
        });
      
      if (error) {
        throw new Error(`Failed to upload ${files[index].name}: ${error.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      
      return publicUrl;
    });
    
    const publicUrls = await Promise.all(uploadPromises);
    
    console.log(`[StorageUpload] ${publicUrls.length} images uploaded successfully`);
    
    return publicUrls;
  } catch (error) {
    console.error('[StorageUpload] Batch upload error:', error);
    throw error;
  }
};

/**
 * Uploads a PDF file to Supabase Storage
 * @param file - PDF file to upload
 * @param bucket - Storage bucket name (default: 'pdfs')
 * @param folder - Optional folder path within bucket
 * @returns Public URL of uploaded PDF
 */
export const uploadPDF = async (
  file: File,
  bucket: string = 'pdfs',
  folder?: string
): Promise<string> => {
  try {
    // Generate unique filename
    const fileName = generateUniqueFileName(file.name);
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false,
        contentType: 'application/pdf',
      });
    
    if (error) {
      console.error('[StorageUpload] PDF upload failed:', error);
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    console.log(`[StorageUpload] PDF uploaded successfully: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error('[StorageUpload] PDF upload error:', error);
    throw error;
  }
};

/**
 * Deletes a file from Supabase Storage or R2
 * @param url - Public URL of the file to delete
 * @param bucket - Storage bucket name
 */
export const deleteStorageFile = async (url: string, bucket: string = 'images'): Promise<void> => {
  try {
    if (!url) return;
    
    // Check if it's an R2 URL
    if (url.includes('.r2.dev') || url.includes('r2.cloudflarestorage.com')) {
      console.log('[StorageUpload] Deleting from R2');
      await deleteImageFromR2(url);
      return;
    }
    
    // Otherwise, delete from Supabase Storage
    console.log('[StorageUpload] Deleting from Supabase Storage');
    
    // Extract file path from public URL
    // Format: https://{projectId}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
    if (urlParts.length < 2) {
      console.warn('[StorageUpload] Invalid URL format, cannot delete:', url);
      return;
    }
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) {
      console.error('[StorageUpload] Delete failed:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
    
    console.log(`[StorageUpload] File deleted successfully: ${filePath}`);
  } catch (error) {
    console.error('[StorageUpload] Delete error:', error);
    // Don't throw - deletion failures shouldn't block other operations
  }
};

/**
 * Checks if a URL is a Supabase Storage URL (not Base64)
 */
export const isStorageUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Checks if a URL is a Base64 data URL
 */
export const isBase64Url = (url: string): boolean => {
  return url.startsWith('data:');
};