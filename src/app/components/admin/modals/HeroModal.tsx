/**
 * Hero Section Edit Modal
 * 
 * Specialized modal for editing the hero section.
 */

import { X, CheckCircle, Layout } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { VisualRichEditor } from '@/app/components/admin/VisualRichEditor';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { toast } from 'sonner';

interface HeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundUrl: string;
  onUpdateTitle: (title: string) => void;
  onUpdateSubtitle: (subtitle: string) => void;
  onUpdateBackground: (url: string) => void;
  onSave: () => void;
}

/**
 * Modal for editing hero section
 */
export function HeroModal({
  isOpen,
  onClose,
  heroTitle,
  heroSubtitle,
  heroBackgroundUrl,
  onUpdateTitle,
  onUpdateSubtitle,
  onUpdateBackground,
  onSave,
}: HeroModalProps) {
  const handleSave = () => {
    onSave();
    onClose();
    toast.success('Hero section saved!', {
      description: 'Your homepage hero has been updated successfully.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
              <Layout className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">Edit Hero Section</DialogTitle>
              <DialogDescription className="text-base text-gray-500 mt-0.5 font-medium">
                Update the homepage hero section and click Save to persist changes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
          <div className="space-y-8 py-6">
            {/* Title Field */}
            <div className="space-y-3">
              <Label htmlFor="hero-title" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                Title <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <VisualRichEditor
                id="hero-title"
                label="Title"
                value={heroTitle}
                onChange={onUpdateTitle}
                rows={2}
                placeholder="Enter hero title"
              />
            </div>

            {/* Subtitle Field */}
            <div className="space-y-3">
              <Label htmlFor="hero-subtitle" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                Subtitle <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <VisualRichEditor
                id="hero-subtitle"
                label="Subtitle"
                value={heroSubtitle}
                onChange={onUpdateSubtitle}
                rows={2}
                placeholder="Enter hero subtitle"
              />
            </div>

            {/* Background Image URL */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                Background Image URL <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <Input
                value={heroBackgroundUrl}
                onChange={e => onUpdateBackground(e.target.value)}
                placeholder="https://example.com/background.jpg"
              />
              {heroBackgroundUrl && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={heroBackgroundUrl}
                    alt="Hero background preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 p-6 border-t border-gray-100 shrink-0 bg-gray-50/80 backdrop-blur-sm rounded-b-2xl">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-white hover:border-gray-300 transition-all"
            onClick={onClose}
          >
            <X className="w-5 h-4 mr-2" /> Cancel
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:shadow-lg hover:shadow-blue-500/25 text-white transition-all transform hover:-translate-y-0.5"
            onClick={handleSave}
          >
            <CheckCircle className="w-5 h-5 mr-2" /> Save Hero Section
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
