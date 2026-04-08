import { supabase } from '@/lib/supabase';
import { compressImage, compressImages } from './imageCompression';
import { uploadImageToR2, deleteImageFromR2, isR2Configured } from './r2Upload';

// Debug flag - only log in development
const DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEBUG_STORAGE === 'true';

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
 * Configuration: Set to true to use only Cloudflare R2 (skip Supabase)
 * Set to false to try R2 first, then fall back to Supabase
 */
const FORCE_R2_ONLY = true; // <-- CHANGE THIS: true = only R2 (Cloudflare), false = R2 + Supabase fallback

/**
 * Uploads an image to Cloudflare R2 with compression
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
    
    // Step 2: If forcing R2 only, upload to R2
    if (FORCE_R2_ONLY) {
      DEBUG && console.log('[StorageUpload] Uploading to Cloudflare R2 only...');
      try {
        const url = await uploadImageToR2(compressedFile, folder || bucket);
        DEBUG && console.log(`[StorageUpload] Image uploaded to R2: ${url}`);
        return url;
      } catch (r2Error: unknown) {
        console.error('[StorageUpload] R2 upload failed:', r2Error);
        throw new Error(`R2 upload failed: ${r2Error instanceof Error ? r2Error.message : String(r2Error)}`);
      }
    }
    
    // Step 3: Try R2 if configured AND not forcing R2 only
    if (isR2Configured()) {
      DEBUG && console.log('[StorageUpload] Attempting R2 upload...');
      try {
        const url = await uploadImageToR2(compressedFile, folder || bucket);
        DEBUG && console.log(`[StorageUpload] Image uploaded to R2: ${url}`);
        return url;
      } catch (r2Error: unknown) {
        console.warn('[StorageUpload] R2 upload failed, falling back to Supabase:', r2Error);
        // Continue to Supabase fallback below
      }
    }
    
    // Fallback to Supabase Storage
    DEBUG && console.log('[StorageUpload] R2 not configured, using Supabase Storage');
    
    // Step 3: Generate unique filename
    const fileName = generateUniqueFileName(file.name);
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    // Step 4: Upload to Supabase Storage with bucket fallback
    let uploadResult = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedFile, {
        cacheControl: '31536000', // 1 year cache
        upsert: false,
        contentType: compressedFile.type,
      });
    
    // If bucket not found or other 400 errors, fall back to 'images' bucket with folder prefix
    const isBucketNotFound = uploadResult.error?.message?.includes('Bucket not found') || 
                              uploadResult.error?.message?.includes('bucket not found') ||
                              uploadResult.error?.message?.includes('does not exist') ||
                              uploadResult.error?.message?.includes('400') ||
                              uploadResult.error?.status === 400;
    
    if (isBucketNotFound) {
      DEBUG && console.warn(`[StorageUpload] Bucket '${bucket}' error: ${uploadResult.error?.message}, falling back to 'images' bucket`);
      const fallbackPath = folder ? `${bucket}/${folder}/${fileName}` : `${bucket}/${fileName}`;
      DEBUG && console.log(`[StorageUpload] Fallback path: ${fallbackPath}`);
      uploadResult = await supabase.storage
        .from('images')
        .upload(fallbackPath, compressedFile, {
          cacheControl: '31536000',
          upsert: false,
          contentType: compressedFile.type,
        });
    }
    
    const { data, error } = uploadResult;
    
    if (error) {
      console.error('[StorageUpload] Upload failed:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    // Step 5: Get public URL (use fallback bucket if needed)
    const targetBucket = data.path.startsWith(`${bucket}/`) ? 'images' : bucket;
    const { data: { publicUrl } } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(data.path);
    
    DEBUG && console.log(`[StorageUpload] Image uploaded successfully: ${publicUrl}`);
    
    return publicUrl;
  } catch (error: unknown) {
    console.error('[StorageUpload] Error:', error instanceof Error ? error.message : error);
    throw error;
  }
};

/**
 * Uploads multiple images to Cloudflare R2 with compression
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
    
    // If forcing R2 only, use R2 for all uploads
    if (FORCE_R2_ONLY) {
      DEBUG && console.log('[StorageUpload] Uploading multiple images to Cloudflare R2 only...');
      const uploadPromises = compressedFiles.map(async (file) => {
        try {
          const url = await uploadImageToR2(file, folder || bucket);
          DEBUG && console.log(`[StorageUpload] Image uploaded to R2: ${url}`);
          return url;
        } catch (r2Error: unknown) {
          console.error('[StorageUpload] R2 upload failed:', r2Error);
          throw new Error(`R2 upload failed: ${r2Error instanceof Error ? r2Error.message : String(r2Error)}`);
        }
      });
      
      const publicUrls = await Promise.all(uploadPromises);
      DEBUG && console.log(`[StorageUpload] ${publicUrls.length} images uploaded to R2 successfully`);
      return publicUrls;
    }
    
    // Step 2: Upload all images in parallel to Supabase
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
      
      // If bucket not found or other 400 errors, fall back to 'images' bucket
      const isBucketNotFound = error?.message?.includes('Bucket not found') || 
                                error?.message?.includes('bucket not found') ||
                                error?.message?.includes('does not exist') ||
                                error?.message?.includes('400') ||
                                error?.status === 400;
      
      if (isBucketNotFound) {
        DEBUG && console.warn(`[StorageUpload] Bucket '${bucket}' not found or error (message: ${error?.message}), falling back to 'images' bucket`);
        const fallbackPath = folder ? `${bucket}/${folder}/${fileName}` : `${bucket}/${fileName}`;
        DEBUG && console.log(`[StorageUpload] Attempting fallback upload to 'images' bucket at path: ${fallbackPath}`);
        const fallbackResult = await supabase.storage
          .from('images')
          .upload(fallbackPath, file, {
            cacheControl: '31536000',
            upsert: false,
            contentType: file.type,
          });
        
        if (fallbackResult.error) {
          console.error(`[StorageUpload] Fallback upload failed:`, fallbackResult.error);
          throw new Error(`Failed to upload ${files[index].name}: ${fallbackResult.error.message}`);
        }
        
        DEBUG && console.log(`[StorageUpload] Fallback upload successful: ${fallbackResult.data.path}`);
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(fallbackResult.data.path);
        
        return publicUrl;
      }
      
      if (error) {
        console.error(`[StorageUpload] Upload error for ${files[index].name}:`, error);
        throw new Error(`Failed to upload ${files[index].name}: ${error.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      
      return publicUrl;
    });
    
    const publicUrls = await Promise.all(uploadPromises);
    
    DEBUG && console.log(`[StorageUpload] ${publicUrls.length} images uploaded successfully`);
    
    return publicUrls;
  } catch (error: unknown) {
    console.error('[StorageUpload] Batch upload error:', error instanceof Error ? error.message : error);
    throw error;
  }
};

/**
 * Uploads a PDF file to Cloudflare R2
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
    // If forcing R2 only, upload to R2
    if (FORCE_R2_ONLY) {
      DEBUG && console.log('[StorageUpload] Uploading PDF to Cloudflare R2 only...');
      try {
        const url = await uploadImageToR2(file, folder || bucket);
        DEBUG && console.log(`[StorageUpload] PDF uploaded to R2: ${url}`);
        return url;
      } catch (r2Error: unknown) {
        console.error('[StorageUpload] R2 PDF upload failed:', r2Error);
        throw new Error(`R2 PDF upload failed: ${r2Error instanceof Error ? r2Error.message : String(r2Error)}`);
      }
    }
    
    // Generate unique filename
    const fileName = generateUniqueFileName(file.name);
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    // Upload to Supabase Storage with bucket fallback
    let uploadResult = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false,
        contentType: 'application/pdf',
      });
    
    // If bucket not found or other 400 errors, fall back to 'images' bucket with folder prefix
    const isBucketNotFound = uploadResult.error?.message?.includes('Bucket not found') || 
                              uploadResult.error?.message?.includes('bucket not found') ||
                              uploadResult.error?.message?.includes('does not exist') ||
                              uploadResult.error?.message?.includes('400') ||
                              uploadResult.error?.status === 400;
    
    if (isBucketNotFound) {
      DEBUG && console.warn(`[StorageUpload] Bucket '${bucket}' error for PDF: ${uploadResult.error?.message}, falling back to 'images' bucket`);
      const fallbackPath = folder ? `${bucket}/${folder}/${fileName}` : `${bucket}/${fileName}`;
      DEBUG && console.log(`[StorageUpload] PDF fallback path: ${fallbackPath}`);
      uploadResult = await supabase.storage
        .from('images')
        .upload(fallbackPath, file, {
          cacheControl: '31536000',
          upsert: false,
          contentType: 'application/pdf',
        });
    }
    
    const { data, error } = uploadResult;
    
    if (error) {
      console.error('[StorageUpload] PDF upload failed:', error);
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
    
    // Get public URL (use fallback bucket if needed)
    const targetBucket = data.path.startsWith(`${bucket}/`) ? 'images' : bucket;
    const { data: { publicUrl } } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(data.path);
    
    DEBUG && console.log(`[StorageUpload] PDF uploaded successfully: ${publicUrl}`);
    
    return publicUrl;
  } catch (error: unknown) {
    console.error('[StorageUpload] PDF upload error:', error instanceof Error ? error.message : error);
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
    if (!url || typeof url !== 'string') return;
    
    // Skip if not a remote URL (e.g., local blob or base64)
    if (!url.startsWith('http')) return;

    // Check if it's an R2 URL
    if (url.includes('.r2.dev') || url.includes('r2.cloudflarestorage.com')) {
      DEBUG && console.log('[StorageUpload] Deleting from R2');
      await deleteImageFromR2(url);
      return;
    }
    
    // Extract file path from public URL
    // Format: https://{projectId}.supabase.co/storage/v1/object/public/{bucket}/{path}
    let filePath = '';
    let targetBucket = bucket;
    const bucketSearchStr = `/storage/v1/object/public/${bucket}/`;
    const imagesBucketStr = `/storage/v1/object/public/images/`;
    
    if (url.includes(bucketSearchStr)) {
      // File is in the expected bucket
      filePath = url.split(bucketSearchStr)[1];
    } else if (url.includes(imagesBucketStr) && bucket !== 'images') {
      // File was uploaded to 'images' bucket with folder prefix (fallback case)
      // URL format: .../public/images/blog/filename.png
      const afterImages = url.split(imagesBucketStr)[1];
      if (afterImages && afterImages.startsWith(`${bucket}/`)) {
        filePath = afterImages; // Keep the folder prefix like 'blog/filename.png'
        targetBucket = 'images';
        DEBUG && console.log(`[StorageUpload] File found in fallback location: images/${filePath}`);
      } else {
        // Just a file in images bucket without the folder prefix
        filePath = afterImages;
        targetBucket = 'images';
      }
    } else {
      // Fallback: try to find the last part of the URL
      const parts = url.split('/');
      filePath = parts[parts.length - 1];
      DEBUG && console.warn(`[StorageUpload] Could not find bucket path in URL, using filename fallback: ${filePath}`);
    }

    if (!filePath) {
      DEBUG && console.warn('[StorageUpload] Could not determine file path from URL:', url);
      return;
    }

    // Remove any query parameters if present
    filePath = filePath.split('?')[0];
    
    DEBUG && console.log(`[StorageUpload] Deleting from bucket '${targetBucket}': ${filePath}`);
    
    const { error } = await supabase.storage
      .from(targetBucket)
      .remove([filePath]);
    
    if (error) {
      console.error('[StorageUpload] Delete failed:', error);
      // Try alternative bucket if first attempt failed
      if (targetBucket !== bucket) {
        DEBUG && console.log(`[StorageUpload] Retrying delete from original bucket '${bucket}'`);
        const { error: retryError } = await supabase.storage
          .from(bucket)
          .remove([filePath]);
        if (retryError) {
          console.error('[StorageUpload] Retry delete also failed:', retryError);
        } else {
          DEBUG && console.log(`[StorageUpload] File deleted successfully from ${bucket}: ${filePath}`);
        }
      }
    } else {
      DEBUG && console.log(`[StorageUpload] File deleted successfully from storage: ${filePath}`);
    }
  } catch (error: unknown) {
    console.error('[StorageUpload] Delete error:', error instanceof Error ? error.message : error);
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