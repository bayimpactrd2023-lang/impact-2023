/**
 * Quick Blog Create Component
 * Modal for quickly creating a new blog post
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { X, CheckCircle, Newspaper } from 'lucide-react';
import { BlogPostForm } from '@/app/context/ContentContext';
import { createBlogPost } from '@/services/supabaseService';
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
import { VisualRichEditor } from '../VisualRichEditor';
import { SharedToolbar } from '../SharedToolbar';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { MultiImageDropzone } from '@/app/components/MultiImageDropzone';

import { uploadImage, uploadImages } from '@/utils/storageUpload';

interface QuickBlogCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export const QuickBlogCreate: React.FC<QuickBlogCreateProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleCommand = (cmd: string, val: any = '') => {
    // If we're interacting with a standard input, don't broadcast editor commands
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }

    if (activeField) {
      const event = new CustomEvent(`editor-command-${activeField}`, { 
        detail: { command: cmd, value: val } 
      });
      window.dispatchEvent(event);
    }
  };

  const [draft, setDraft] = useState<BlogPostForm>({
    id: '',
    title: '',
    content: '',
    author: 'Admin',
    authorRole: 'Administrator',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    images: [],
    likes: 0,
  });

  const handlePublish = async () => {
    if (isSaving) return;

    const validation = mergeValidationResults(
      validateRequiredTrimmed(draft.title, 'Title'),
      validateMaxChars(draft.title.trim(), AdminValidationRules.shortTitleMaxChars, 'Title'),
      validateMaxWords(draft.title.trim(), AdminValidationRules.shortTitleMaxWords, 'Title'),
      validateRequiredTrimmed(draft.content, 'Content'),
      validateMaxChars(draft.content.trim(), AdminValidationRules.contentMaxChars, 'Content'),
      validateRequiredTrimmed(draft.author, 'Author'),
      validateNoDigits(draft.author, 'Author'),
      validateMaxChars(draft.author.trim(), AdminValidationRules.nameMaxChars, 'Author'),
      validateMaxWords(draft.author.trim(), AdminValidationRules.nameMaxWords, 'Author'),
      validateMaxChars((draft.authorRole || '').trim(), AdminValidationRules.roleMaxChars, 'Author role'),
      validateMaxWords((draft.authorRole || '').trim(), AdminValidationRules.roleMaxWords, 'Author role'),
      validateNoDigits(draft.authorRole || '', 'Author role')
    );
    if (!validation.isValid) {
      toast.error(validation.error || 'Validation failed');
      return;
    }

    setIsSaving(true);
    try {
      // Handle Image Uploads before saving to database
      let finalImageUrl = draft.imageUrl;
      if (typeof finalImageUrl === 'object' && (finalImageUrl as any) instanceof File) {
        finalImageUrl = await uploadImage(finalImageUrl as any, 'blog');
      }

      let finalImages = draft.images || [];
      if (draft.images && draft.images.some(img => typeof img === 'object')) {
        const filesToUpload = draft.images.filter(img => typeof img === 'object') as File[];
        const uploadedUrls = await uploadImages(filesToUpload, 'blog');
        let uploadIdx = 0;
        finalImages = draft.images.map(img => {
          if (typeof img === 'object') {
            return uploadedUrls[uploadIdx++];
          }
          return img as string;
        });
      }

      const blogData = {
        title: draft.title,
        content: draft.content,
        author: draft.author,
        author_role: draft.authorRole,
        date: draft.date,
        image_url: (finalImageUrl as string) || null,
        images: (finalImages as string[]) || null,
        likes: draft.likes || 0,
      };

      const created = await createBlogPost(blogData);

      if (created) {
        // IMMEDIATE DATABASE REFRESH
        await onSuccess();
        onClose();
        toast.success('Blog post created!', {
          description: `"${draft.title}" was successfully created.`,
        });
        // Reset form
        setDraft({
          id: '',
          title: '',
          content: '',
          author: 'Admin',
          authorRole: 'Administrator',
          date: new Date().toISOString().split('T')[0],
          imageUrl: '',
          images: [],
          likes: 0,
        });
      } else {
        toast.error('Failed to create blog post.');
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error('Failed to create blog post. Please try again.');
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
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Quick Create Blog Post</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-0.5">
                Quickly create and publish a new blog post
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
              <Label htmlFor="blog-title">Title *</Label>
              <Input
                id="blog-title"
                value={draft.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setDraft(prev => ({ ...prev, title: newTitle }));
                }}
                placeholder="Enter blog title"
              />
            </div>

            <div>
              <Label htmlFor="blog-author">Author</Label>
              <Input
                id="blog-author"
                value={draft.author}
                onChange={(e) => {
                  const newAuthor = e.target.value;
                  setDraft(prev => ({ ...prev, author: newAuthor }));
                }}
                placeholder="Author name"
              />
            </div>

            <div>
              <Label htmlFor="blog-role">Author Role</Label>
              <Input
                id="blog-role"
                value={draft.authorRole}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setDraft(prev => ({ ...prev, authorRole: newRole }));
                }}
                placeholder="Administrator"
              />
            </div>

            <div>
              <Label htmlFor="blog-date">Published Date *</Label>
              <Input
                id="blog-date"
                type="date"
                value={draft.date}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setDraft(prev => ({ ...prev, date: newDate }));
                }}
              />
            </div>

            <VisualRichEditor
              id="blog-content"
              label="Content *"
              value={draft.content}
              onChange={(value: string) => setDraft(prev => ({ ...prev, content: value }))}
              rows={6}
              placeholder="Write your blog content..."
              required
              showToolbar={false}
              onCommand={(cmd) => {
                if (cmd === 'focus') {
                  setActiveField('blog-content');
                }
              }}
            />

            <div>
              <Label>Featured Image</Label>
              <ImageDropzone
                value={draft.imageUrl || ''}
                onChange={(url) => setDraft(prev => ({ ...prev, imageUrl: url }))}
              />
            </div>

            <div>
              <Label>Gallery Images</Label>
              <MultiImageDropzone
                images={draft.images || []}
                onChange={(images) => setDraft(prev => ({ ...prev, images }))}
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