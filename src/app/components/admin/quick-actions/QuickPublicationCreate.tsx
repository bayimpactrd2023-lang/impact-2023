/**
 * Quick Publication Create Component
 * Modal for quickly creating a new publication
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Publication } from '@/app/context/ContentContext';
import { createPublication } from '@/services/supabaseService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { ImageDropzone } from '@/app/components/ImageDropzone';

interface QuickPublicationCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export const QuickPublicationCreate: React.FC<QuickPublicationCreateProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<Publication>({
    id: '',
    title: '',
    authors: '',
    link: '#',
    featured: false,
    pdfUrl: '',
    content: '',
    publishedDate: new Date().toISOString().split('T')[0],
    excerpt: '',
    sentence: '',
    optionalLinks: '',
    contactInfo: '',
    reference: '',
  });

  const handlePublish = async () => {
    if (isSaving) return;

    if (!draft.title.trim()) {
      toast.error('Please enter a title.');
      return;
    }
    if (!draft.content.trim()) {
      toast.error('Please enter some content.');
      return;
    }

    setIsSaving(true);
    try {
      const publicationData = {
        title: draft.title,
        authors: draft.authors,
        link: draft.link,
        featured: draft.featured,
        pdf_url: draft.pdfUrl || null,
        content: draft.content || null,
        published_date: draft.publishedDate || null,
        excerpt: draft.excerpt || null,
        sentence: draft.sentence || null,
        optional_links: draft.optionalLinks || null,
        contact_info: draft.contactInfo || null,
        reference: draft.reference || null,
      };

      const created = await createPublication(publicationData);

      if (created) {
        // IMMEDIATE DATABASE REFRESH
        await onSuccess();
        onClose();
        toast.success('Publication created!', {
          description: `"${draft.title}" was successfully created.`,
        });
        // Reset form
        setDraft({
          id: '',
          title: '',
          authors: '',
          link: '#',
          featured: false,
          pdfUrl: '',
          content: '',
          publishedDate: new Date().toISOString().split('T')[0],
          excerpt: '',
          sentence: '',
          optionalLinks: '',
          contactInfo: '',
          reference: '',
        });
      } else {
        toast.error('Failed to create publication.');
      }
    } catch (error) {
      console.error('Error creating publication:', error);
      toast.error('Failed to create publication. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Create Publication</DialogTitle>
          <DialogDescription>
            Quickly create and publish a new research publication
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="pub-title">Title *</Label>
            <Input
              id="pub-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Enter publication title"
            />
          </div>

          <div>
            <Label htmlFor="pub-authors">Authors</Label>
            <Input
              id="pub-authors"
              value={draft.authors}
              onChange={(e) => setDraft({ ...draft, authors: e.target.value })}
              placeholder="Author names"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pub-date">Published Date</Label>
              <Input
                id="pub-date"
                type="date"
                value={draft.publishedDate}
                onChange={(e) => setDraft({ ...draft, publishedDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="pub-link">Link</Label>
              <Input
                id="pub-link"
                value={draft.link}
                onChange={(e) => setDraft({ ...draft, link: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pub-excerpt">Excerpt</Label>
            <Textarea
              id="pub-excerpt"
              value={draft.excerpt}
              onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
              placeholder="Brief excerpt or summary"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="pub-content">Content *</Label>
            <Textarea
              id="pub-content"
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder="Full publication content..."
              rows={6}
            />
          </div>

          <div>
            <Label>PDF Document</Label>
            <ImageDropzone
              value={draft.pdfUrl || ''}
              onChange={(url) => setDraft({ ...draft, pdfUrl: url })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handlePublish}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? 'Publishing...' : 'Publish'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};