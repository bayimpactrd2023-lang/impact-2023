/**
 * Hero Section Edit Modal
 * 
 * Specialized modal for editing the hero section.
 */

import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
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
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            Edit Hero Section
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Update the homepage hero section and click Save to persist changes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Title Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Title</Label>
            <Textarea
              value={heroTitle}
              onChange={e => onUpdateTitle(e.target.value)}
              rows={2}
              placeholder="Enter hero title"
            />
          </div>

          {/* Subtitle Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Subtitle</Label>
            <Textarea
              value={heroSubtitle}
              onChange={e => onUpdateSubtitle(e.target.value)}
              rows={2}
              placeholder="Enter hero subtitle"
            />
          </div>

          {/* Background Image URL */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Background Image URL</Label>
            <Input
              value={heroBackgroundUrl}
              onChange={e => onUpdateBackground(e.target.value)}
              placeholder="https://example.com/background.jpg"
            />
            {heroBackgroundUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={heroBackgroundUrl}
                  alt="Hero background preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" className="flex-1 w-full" onClick={onClose}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button
              className="flex-1 w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
              onClick={handleSave}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Save Hero Section
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
