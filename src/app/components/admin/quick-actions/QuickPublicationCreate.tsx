/**
 * Quick Publication Create Component
 * Modal for quickly creating a new publication
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { X, CheckCircle, BookOpen } from 'lucide-react';
import { PublicationForm } from '@/app/context/ContentContext';
import { createPublication } from '@/services/supabaseService';
import { VisualRichEditor } from '../VisualRichEditor';
import { SharedToolbar } from '../SharedToolbar';
import { uploadPDF } from '@/utils/storageUpload';

import {
  AdminValidationRules,
  mergeValidationResults,
  validateMaxChars,
  validateMaxWords,
  validateRequiredTrimmed,
  validateNoDigits,
} from '@/app/components/admin/utils/adminHelpers';
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
import { PDFDropzone } from '@/app/components/PDFDropzone';

type QuickPublicationDraft = Omit<PublicationForm, 'pdfUrl'> & {
  pdfUrl?: string | File;
};

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
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleCommand = (cmd: string, val: any = '') => {
    if (activeField) {
      const event = new CustomEvent(`editor-command-${activeField}`, { 
        detail: { command: cmd, value: val } 
      });
      window.dispatchEvent(event);
    }
  };

  const [draft, setDraft] = useState<QuickPublicationDraft>({
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

    const validation = mergeValidationResults(
      validateRequiredTrimmed(draft.title, 'Title'),
      validateMaxChars(draft.title.trim(), AdminValidationRules.shortTitleMaxChars, 'Title'),
      validateMaxWords(draft.title.trim(), AdminValidationRules.shortTitleMaxWords, 'Title'),
      validateRequiredTrimmed(draft.content || '', 'Content'),
      validateMaxChars((draft.content || '').trim(), AdminValidationRules.contentMaxChars, 'Content'),
      validateMaxChars((draft.authors || '').trim(), AdminValidationRules.authorsMaxChars, 'Authors'),
      validateMaxWords((draft.authors || '').trim(), AdminValidationRules.authorsMaxWords, 'Authors'),
      validateNoDigits(draft.authors || '', 'Authors'),
      validateMaxChars((draft.excerpt || '').trim(), AdminValidationRules.shortTextMaxChars, 'Excerpt'),
      validateMaxWords((draft.excerpt || '').trim(), AdminValidationRules.shortTextMaxWords, 'Excerpt'),
      validateMaxChars((draft.sentence || '').trim(), AdminValidationRules.shortTextMaxChars, 'Sentence'),
      validateMaxWords((draft.sentence || '').trim(), AdminValidationRules.shortTextMaxWords, 'Sentence')
    );
    if (!validation.isValid) {
      toast.error(validation.error || 'Validation failed');
      return;
    }

    setIsSaving(true);
    try {
      // Handle PDF Upload before saving to database
      let finalPdfUrl = draft.pdfUrl;
      if (finalPdfUrl instanceof File) {
        finalPdfUrl = await uploadPDF(finalPdfUrl, 'publications');
      }

      const publicationData = {
        title: draft.title,
        authors: draft.authors,
        link: draft.link,
        featured: draft.featured,
        pdf_url: (finalPdfUrl as string) || null,
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
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
        <DialogHeader className="p-5 pb-2 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Quick Create Publication</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-0.5">
                Quickly create and publish a new research publication
              </DialogDescription>
            </div>
          </div>
          <div className="pt-2">
            <SharedToolbar onCommand={handleCommand} />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="pub-title">Title *</Label>
              <Input
                id="pub-title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Enter publication title"
                className="text-base sm:text-lg font-semibold"
              />
            </div>

            <div>
              <Label htmlFor="pub-authors">Authors *</Label>
              <Input
                id="pub-authors"
                value={draft.authors}
                onChange={(e) => setDraft({ ...draft, authors: e.target.value })}
                placeholder="Author names"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pub-date">Published Date *</Label>
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

            <VisualRichEditor
              id="pub-excerpt"
              label="Excerpt"
              value={draft.excerpt || ''}
              onChange={(val: string) => setDraft({ ...draft, excerpt: val })}
              placeholder="Brief excerpt or summary"
              rows={2}
              showToolbar={false}
              onCommand={(cmd) => {
                if (cmd === 'focus') {
                  setActiveField('pub-excerpt');
                }
              }}
            />

            <VisualRichEditor
              id="pub-content"
              label="Content"
              value={draft.content || ''}
              onChange={(val: string) => setDraft({ ...draft, content: val })}
              placeholder="Full publication content..."
              rows={6}
              required
              showToolbar={false}
              onCommand={(cmd) => {
                if (cmd === 'focus') {
                  setActiveField('pub-content');
                }
              }}
            />

            <div>
              <Label>PDF Document</Label>
              <PDFDropzone
                value={draft.pdfUrl}
                onChange={(file: string | File) => setDraft({ ...draft, pdfUrl: file })}
                label="Drop PDF file here or click to browse"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-5 border-t border-gray-100 shrink-0 bg-gray-50/50 rounded-b-2xl">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isSaving}
            className="flex-1 w-full"
          >
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isSaving}
            className="flex-1 w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
          >
            <CheckCircle className="w-4 h-4 mr-2" /> {isSaving ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};