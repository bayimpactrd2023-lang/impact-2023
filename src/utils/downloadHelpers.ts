/**
 * Download Helpers
 * Utilities for handling file downloads in the browser
 */

const isSupabaseStorageUrl = (url: string): boolean => {
  // Matches both public and signed download endpoints
  return url.includes('.supabase.co/storage/v1/object');
};

const addSupabaseDownloadParam = (url: string, filename: string): string => {
  try {
    const u = new URL(url);
    // Supabase storage supports ?download or ?download=filename to force Content-Disposition: attachment
    if (!u.searchParams.has('download')) {
      u.searchParams.set('download', filename);
    }
    return u.toString();
  } catch {
    // If URL parsing fails, fall back to naive concatenation
    const separator = url.includes('?') ? '&' : '?';
    if (url.includes('download=')) return url;
    return `${url}${separator}download=${encodeURIComponent(filename)}`;
  }
};

const clickAnchor = (href: string, opts?: { download?: string; target?: string }): void => {
  const link = document.createElement('a');
  link.href = href;
  if (opts?.download) link.download = opts.download;
  link.rel = 'noopener noreferrer';
  if (opts?.target) link.target = opts.target;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Downloads a file using the browser's native download system
 * @param url - The public URL of the file to download
 * @param filename - The desired filename for the download
 */
export const downloadFile = (url: string, filename: string): void => {
  // Handle different types of URLs (R2, Supabase, base64, etc.)
  if (url.startsWith('data:')) {
    // Handle base64 encoded files
    clickAnchor(url, { download: filename });
  } else {
    if (isSupabaseStorageUrl(url)) {
      const directDownloadUrl = addSupabaseDownloadParam(url, filename);
      clickAnchor(directDownloadUrl, { download: filename });
      return;
    }

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        clickAnchor(blobUrl, { download: filename });

        setTimeout(() => URL.revokeObjectURL(blobUrl), 250);
      })
      .catch(error => {
        console.error('Download failed:', error);
        window.open(url, '_blank', 'noopener,noreferrer');
      });
  }
};

/**
 * Downloads a PDF file with proper naming
 * @param pdfUrl - The public URL of the PDF
 * @param title - The title to use in the filename
 * @param year - Optional year to include in the filename
 */
export const downloadPDF = (pdfUrl: string, title: string, year?: string | number): void => {
  // Sanitize the filename by removing special characters
  const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const yearSuffix = year ? `_${year}` : '';
  const filename = `${sanitizedTitle}${yearSuffix}.pdf`;
  
  downloadFile(pdfUrl, filename);
};