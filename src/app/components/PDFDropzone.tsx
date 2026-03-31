import React, { useState, useCallback, useEffect } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { uploadPDF, isBase64Url } from '@/utils/storageUpload';
import { toast } from 'sonner';

interface PDFDropzoneProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  bucket?: string;
  folder?: string;
}

export const PDFDropzone: React.FC<PDFDropzoneProps> = ({ 
  value, 
  onChange, 
  label = 'Drop a PDF file here',
  className = '',
  bucket = 'pdfs',
  folder
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>(value || '');
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Sync pdfDataUrl with value prop when it changes externally
  useEffect(() => {
    setPdfDataUrl(value || '');
    // Extract filename from data URL if possible
    if (value && value.startsWith('data:')) {
      setFileName('Uploaded PDF');
    } else if (value) {
      // Try to extract filename from URL
      const urlParts = value.split('/');
      setFileName(urlParts[urlParts.length - 1] || 'PDF Document');
    }
  }, [value]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processPDFFile = useCallback(async (pdfFile: File) => {
    try {
      setIsUploading(true);
      setFileName(pdfFile.name);
      
      // Upload to Supabase Storage
      const publicUrl = await uploadPDF(pdfFile, bucket, folder);
      
      // Update state and notify parent
      setPdfDataUrl(publicUrl);
      if (onChange && typeof onChange === 'function') {
        onChange(publicUrl);
      }
      
      toast.success('PDF uploaded successfully');
    } catch (error) {
      console.error('[PDFDropzone] Upload error:', error);
      toast.error('Failed to upload PDF. Please try again.');
      setFileName('');
    } finally {
      setIsUploading(false);
    }
  }, [onChange, bucket, folder]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');

    if (pdfFile) {
      processPDFFile(pdfFile);
    }
  }, [processPDFFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      processPDFFile(file);
    }
  }, [processPDFFile]);

  const handleClear = useCallback(() => {
    setPdfDataUrl('');
    setFileName('');
    if (onChange && typeof onChange === 'function') {
      onChange('');
    }
  }, [onChange]);

  const handlePreviewPDF = useCallback(() => {
    if (pdfDataUrl) {
      // Check if it's a data URL (base64) or a regular URL
      if (pdfDataUrl.startsWith('data:')) {
        // For data URLs, create a blob and open it
        try {
          const base64Data = pdfDataUrl.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
          
          // Clean up the blob URL after a delay
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } catch (error) {
          // Fallback to direct data URL (may not work for large files)
          window.open(pdfDataUrl, '_blank');
        }
      } else {
        // For regular URLs, just open them
        window.open(pdfDataUrl, '_blank');
      }
    }
  }, [pdfDataUrl]);

  return (
    <div className={className}>
      {pdfDataUrl ? (
        <div className="relative">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={handlePreviewPDF}
          >
            <div 
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{fileName || 'PDF Document'}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">Click to preview PDF</p>
                  {isBase64Url(pdfDataUrl) && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-semibold">
                      ⚠️ Old Format
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            id={`pdf-file-input-${label}`}
            disabled={isUploading}
          />
          <label 
            htmlFor={`pdf-file-input-${label}`}
            className={`${isUploading ? 'cursor-wait' : 'cursor-pointer'} flex flex-col items-center`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-[#1887FC] mb-2 animate-spin" />
                <p className="text-sm font-medium text-gray-700 mb-1">Uploading PDF...</p>
                <p className="text-xs text-gray-500">Please wait</p>
              </>
            ) : (
              <>
                <div className="p-3 bg-red-100 rounded-full mb-3">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
                <p className="text-xs text-gray-500">or click to browse</p>
                <p className="text-xs text-gray-400 mt-2">PDF files only</p>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
};