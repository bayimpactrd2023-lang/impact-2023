import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { X, ChevronDown, ChevronUp, AlertCircle, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { motion } from "motion/react";
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker - use the version that matches react-pdf's internal pdfjs version
// react-pdf v10.4.1 uses pdfjs 5.4.296 internally
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/build/pdf.worker.mjs`;

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
  year?: string;
}

/**
 * PDFViewerModal Component
 *
 * Production-ready, responsive PDF viewer with zoom controls:
 * - Simplified modal with close button and zoom controls
 * - Full-screen on mobile for better readability
 * - PDF dynamically resized to fit completely within modal on all screen sizes
 * - Zoom in/out/reset controls for better readability on all devices
 * - View-only mode (no download options, disabled right-click)
 * - Scrollable content to navigate through all pages
 * - Professional dark theme UI
 * - Smart responsive sizing that ensures entire PDF page is always visible
 */
export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  title,
  year,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [basePageWidth, setBasePageWidth] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3)); // Max 3x zoom
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5)); // Min 0.5x zoom
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  // Detect mobile devices and calculate page width
  useEffect(() => {
    const calculateWidth = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Calculate base PDF page width (before zoom is applied)
      // Use more conservative scaling to ensure full page is always visible
      if (mobile) {
        // Mobile: 95vw modal width minus padding, with extra margin for safety
        const modalWidth = window.innerWidth * 0.95;
        setContainerWidth(modalWidth);
        setBasePageWidth((modalWidth - 60) * 0.92);
      } else {
        // Desktop: Modal is 90vw/85vw with max 1152px, minus padding
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        let modalWidth;
        
        if (viewportWidth >= 1024) {
          // lg breakpoint: 85vw
          modalWidth = Math.min(viewportWidth * 0.85, 1152);
        } else {
          // md breakpoint: 90vw
          modalWidth = viewportWidth * 0.90;
        }
        
        setContainerWidth(modalWidth);
        
        // Calculate width that ensures the page fits both horizontally and vertically
        // Standard PDF aspect ratio is ~1.414 (A4: 210x297mm)
        // Modal height is 90vh on desktop
        const modalHeight = viewportHeight * 0.90;
        const contentHeight = modalHeight - 64; // Subtract top/bottom padding
        
        // Calculate max width based on height constraint (assuming A4 ratio)
        const maxWidthFromHeight = contentHeight * 0.707; // 1/1.414 ratio
        
        // Calculate max width based on width constraint
        const maxWidthFromWidth = (modalWidth - 96) * 0.95; // Subtract padding + 5% margin
        
        // Use the smaller of the two to ensure it fits in both dimensions
        setBasePageWidth(Math.min(maxWidthFromHeight, maxWidthFromWidth));
      }
    };

    calculateWidth();
    window.addEventListener('resize', calculateWidth);

    return () => window.removeEventListener('resize', calculateWidth);
  }, []);

  // Update actual page width when zoom level or base width changes
  useEffect(() => {
    setPageWidth(basePageWidth * zoomLevel);
  }, [basePageWidth, zoomLevel]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: any) {
    setError(error.message);
    setLoading(false);
  }

  // Convert base64 to blob URL if needed
  const getPdfUrl = () => {
    if (pdfUrl.startsWith('data:')) {
      try {
        const base64Data = pdfUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error('Error converting base64 to blob:', error);
        return pdfUrl;
      }
    }
    return pdfUrl;
  };

  const displayUrl = getPdfUrl();

  // Prevent context menu (right-click) on the viewer
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[95vw] h-[95vh] md:w-[90vw] md:h-[90vh] lg:w-[85vw] max-w-6xl p-0 overflow-hidden bg-gray-900 border border-gray-700 shadow-2xl [&>button]:hidden rounded-xl md:rounded-2xl"
        onContextMenu={handleContextMenu}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            PDF Viewer for {title} {year ? `- ${year}` : ''}
          </DialogDescription>
        </DialogHeader>

        {/* Close Button - Fixed at Top Right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-20"
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-9 w-9 md:h-10 md:w-10 p-0 text-white bg-gray-800/80 hover:bg-red-600/90 hover:text-white transition-all flex-shrink-0 rounded-full shadow-lg backdrop-blur-sm"
            title="Close Viewer"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </motion.div>

        {/* Zoom Controls - Fixed at Top Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 left-3 md:top-4 md:left-4 z-20 flex flex-col gap-2"
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="h-9 w-9 md:h-10 md:w-10 p-0 text-white bg-gray-800/80 hover:bg-blue-600/90 hover:text-white transition-all flex-shrink-0 rounded-full shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomReset}
            className="h-9 w-9 md:h-10 md:w-10 p-0 text-white bg-gray-800/80 hover:bg-blue-600/90 hover:text-white transition-all flex-shrink-0 rounded-full shadow-lg backdrop-blur-sm text-[10px] md:text-xs font-semibold"
            title="Reset Zoom (100%)"
          >
            {Math.round(zoomLevel * 100)}%
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            className="h-9 w-9 md:h-10 md:w-10 p-0 text-white bg-gray-800/80 hover:bg-blue-600/90 hover:text-white transition-all flex-shrink-0 rounded-full shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </motion.div>

        {/* PDF Viewer Container - Scrollable with Full Pages */}
        <div 
          className="absolute inset-0 overflow-auto bg-gradient-to-b from-gray-800 to-gray-900"
          onContextMenu={handleContextMenu}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#4B5563 #1F2937'
          }}
        >
          <div className="flex flex-col items-center justify-start py-6 md:py-8 w-full min-h-full">
            {pageWidth > 0 && (
              <Document
                file={displayUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center py-20">
                    <div className="text-white text-sm">Loading PDF...</div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center py-20">
                    <div className="text-red-400 text-sm">Failed to load PDF</div>
                  </div>
                }
                className="w-full flex flex-col items-center"
              >
                {numPages && Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className="mb-4 shadow-2xl w-full flex flex-col items-center">
                    <div className="w-full flex justify-center px-2 md:px-4">
                      <Page
                        pageNumber={index + 1}
                        width={pageWidth}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="bg-white shadow-2xl"
                        scale={1}
                      />
                    </div>
                    {numPages > 1 && (
                      <div className="bg-gray-800/80 text-white text-xs py-2 px-4 mt-2 rounded-full">{index + 1} / {numPages}
                      </div>
                    )}
                  </div>
                ))}
              </Document>
            )}
          </div>
        </div>

        {/* View-Only Watermark Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none select-none z-10"
          onContextMenu={handleContextMenu}
        />

        {/* Mobile Helper Text - Fades Out */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="bg-gray-900/95 backdrop-blur-sm text-white text-xs px-5 py-2.5 rounded-full shadow-lg border border-gray-700/50 flex items-center gap-2"
            >
              <ChevronDown className="h-3 w-3" />
              📄 View-Only Mode · Scroll to navigate
              <ChevronUp className="h-3 w-3" />
            </motion.div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};