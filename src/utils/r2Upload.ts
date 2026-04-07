import { supabase } from '@/lib/supabase';

// R2 Configuration
const R2_CONFIG = {
  publicUrl: import.meta.env.VITE_R2_PUBLIC_URL,
  workerUrl: import.meta.env.VITE_R2_WORKER_URL,
};

// Validate configuration
function validateR2Config() {
  const missing = [];
  if (!R2_CONFIG.publicUrl) missing.push('VITE_R2_PUBLIC_URL');
  if (!R2_CONFIG.workerUrl) missing.push('VITE_R2_WORKER_URL');

  if (missing.length > 0) {
    throw new Error(`Missing R2 configuration: ${missing.join(', ')}`);
  }
}

async function getSupabaseAuthHeaders(): Promise<Record<string, string>> {
  // Get current session
  const { data: sessionData, error } = await supabase.auth.getSession();
  let currentData = sessionData;
  
  // If session is missing or potentially expired, try to refresh it
  if (!sessionData.session || error) {
    console.log('[R2] Session missing or error, attempting refresh...');
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.error('[R2] Session refresh failed:', refreshError);
      throw new Error(`Authentication error: ${refreshError.message}`);
    }
    currentData = refreshData;
  }
  
  const token = currentData.session?.access_token;
  if (!token) {
    console.error('[R2] No active session or access token found after refresh attempt');
    throw new Error('Not authenticated: No active session');
  }

  // Debug JWT payload (non-sensitive parts)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    console.log('[R2] JWT Debug:', {
      exp: payload.exp,
      now: now,
      expired: payload.exp < now,
      sub: payload.sub
    });
  } catch (e: unknown) {
    console.error('[R2] Failed to parse JWT payload for debugging');
  }
  
  console.log('[R2] Auth token found, length:', token.length);
  return {
    Authorization: `Bearer ${token}`,
  };
}

function getEdgeFunctionBaseUrl(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Missing VITE_SUPABASE_URL');
  }
  
  // Ensure the function slug is 'server' as deployed
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/server/r2`;
}

/**
 * Upload image to Cloudflare R2
 * @param file - File to upload
 * @param folder - Folder in bucket (e.g., 'blog', 'highlights', 'projects')
 * @returns Public URL of uploaded image
 */
export async function uploadImageToR2(
  file: File,
  folder: string = 'images'
): Promise<string> {
  try {
    console.log(`[R2] Uploading ${file.name} to ${folder}/...`);

    validateR2Config();

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${folder}/${timestamp}-${randomStr}.${ext}`;

    const edgeBaseUrl = getEdgeFunctionBaseUrl();
    const response = await fetch(`${edgeBaseUrl}/${fileName}`, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'image/jpeg',
        ...(await getSupabaseAuthHeaders()),
      },
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => 'No response body');
      console.error('[R2] Upload failed with status:', response.status, 'Response:', responseText);
      throw new Error(`Upload failed: ${response.status} - ${responseText}`);
    }

    const result = (await response.json().catch(() => null)) as null | { url?: string };

    // Return public URL
    const publicUrl = result?.url || `${R2_CONFIG.publicUrl}/${fileName}`;
    const normalizedUrl = getImageUrl(publicUrl) || publicUrl;
    console.log(`[R2] Upload successful:`, normalizedUrl);

    return normalizedUrl;
  } catch (error: unknown) {
    console.error('[R2] Upload error:', error instanceof Error ? error.message : error);
    throw new Error(`Failed to upload image to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete image from R2
 * @param url - Full URL of image to delete
 */
export async function deleteImageFromR2(url: string): Promise<void> {
  try {
    validateR2Config();

    // Extract key from URL
    const key = url.replace(`${R2_CONFIG.publicUrl}/`, '');
    
    if (!key || key === url) {
      console.warn('[R2] Invalid URL format, skipping delete:', url);
      return;
    }

    console.log(`[R2] Deleting ${key}...`);

    const edgeBaseUrl = getEdgeFunctionBaseUrl();
    const response = await fetch(`${edgeBaseUrl}/${key}`, {
      method: 'DELETE',
      headers: {
        ...(await getSupabaseAuthHeaders()),
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Delete failed: ${response.status}${text ? ` - ${text}` : ''}`);
    }

    console.log(`[R2] Delete successful:`, key);
  } catch (error: unknown) {
    console.error('[R2] Delete error:', error instanceof Error ? error.message : error);
    // Don't throw - deletion failures shouldn't block operations
  }
}

/**
 * Delete multiple images from R2
 * @param urls - Array of image URLs to delete
 */
export async function deleteMultipleImagesFromR2(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) return;
  
  console.log(`[R2] Deleting ${urls.length} images...`);
  
  const promises = urls.map(url => deleteImageFromR2(url));
  await Promise.allSettled(promises); // Don't fail if some deletions fail
  
  console.log(`[R2] Batch delete complete`);
}

/**
 * Check if R2 is configured
 */
export function isR2Configured(): boolean {
  try {
    validateR2Config();
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert R2 public URL to Worker URL for serving images
 * This bypasses DNS issues with the public R2 URL
 * @param publicUrl - The R2 public URL (e.g., https://pub-...r2.dev/images/123.jpg)
 * @returns Worker URL (e.g., https://r2-upload-proxy.impactrd2023.workers.dev/images/123.jpg)
 */
export function getImageUrl(publicUrl: string | undefined): string | undefined {
  if (!publicUrl) return undefined;
  
  // If it's already a worker URL, return as-is
  if (publicUrl.includes('workers.dev')) {
    return publicUrl;
  }
  
  // If it's a Supabase URL, return as-is
  if (publicUrl.includes('supabase.co')) {
    return publicUrl;
  }

  const workerUrlBase = R2_CONFIG.workerUrl?.replace(/\/$/, '');
  if (!workerUrlBase) return publicUrl;

  // Convert any R2 public URLs (r2.dev) to Worker URL.
  // This is intentionally more permissive than a strict base-url match because
  // stored URLs can vary (with/without trailing slashes, different pub subdomain, etc.).
  try {
    const parsed = new URL(publicUrl);
    const isR2Dev = parsed.hostname.endsWith('.r2.dev');
    const isR2S3 = parsed.hostname.endsWith('.r2.cloudflarestorage.com');

    if (isR2Dev || isR2S3) {
      const workerBase = new URL(workerUrlBase);
      parsed.protocol = workerBase.protocol;
      parsed.host = workerBase.host;
      return parsed.toString();
    }
  } catch {
    // Ignore URL parsing errors and fall through
  }

  // Fallback: if it matches configured publicUrl exactly, replace base
  const publicUrlBase = R2_CONFIG.publicUrl?.replace(/\/$/, '');
  if (publicUrlBase && publicUrl.startsWith(publicUrlBase)) {
    return publicUrl.replace(publicUrlBase, workerUrlBase);
  }

  return publicUrl;
}
