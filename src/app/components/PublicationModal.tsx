import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { ExternalLink, FileText } from 'lucide-react';
import { Publication } from '@/app/context/ContentContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  publication: Publication | null;
}

export const PublicationModal: React.FC<PublicationModalProps> = ({ isOpen, onClose, publication }) => {
  if (!publication) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl lg:max-w-6xl max-h-[95vh] overflow-y-auto scrollbar-hide bg-white border-none shadow-2xl">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-[#1887FC] to-[#4da3fd] rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
          </div>
          <DialogTitle className="text-3xl md:text-4xl font-bold text-gray-900">{publication.title}</DialogTitle>
        </DialogHeader>
        {publication.imageUrl && (
          <div className="my-6 rounded-2xl overflow-hidden bg-gray-100">
            <ImageWithFallback 
              src={publication.imageUrl} 
              alt={publication.title}
              className="w-full h-80 object-cover"
            />
          </div>
        )}
        <DialogDescription className="text-base md:text-lg text-gray-700 space-y-6">
          <div className="pb-6 border-b border-gray-100">
            <p className="font-semibold text-gray-900 mb-3 text-lg">Authors:</p>
            <p className="text-gray-700">{publication.authors}</p>
          </div>
          {publication.link && publication.link !== '#' && (
            <div>
              <a
                href={publication.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1887FC] text-white rounded-xl font-medium hover:bg-[#0b5ab8] transition-colors shadow-lg"
              >
                View Full Publication <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          )}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};