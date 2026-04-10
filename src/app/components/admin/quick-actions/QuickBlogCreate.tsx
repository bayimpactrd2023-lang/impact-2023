/**
 * Quick Blog Create Component
 * Modal for quickly creating a new blog post
 */

import { useState } from 'react';
import { toast } from 'sonner';
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
import { VisualRichEditor } from '@/app/components/admin/VisualRichEditor';
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Create Blog Post</DialogTitle>
          <DialogDescription>
            Quickly create and publish a new blog post
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="blog-title">Title *</Label>
            <Input
              id="blog-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Enter blog title"
            />
          </div>

          <div>
            <Label htmlFor="blog-author">Author</Label>
            <Input
              id="blog-author"
              value={draft.author}
              onChange={(e) => setDraft({ ...draft, author: e.target.value })}
              placeholder="Author name"
            />
          </div>

          <div>
            <Label htmlFor="blog-role">Author Role</Label>
            <Input
              id="blog-role"
              value={draft.authorRole}
              onChange={(e) => setDraft({ ...draft, authorRole: e.target.value })}
              placeholder="Administrator"
            />
          </div>

          <div>
            <Label htmlFor="blog-date">Date</Label>
            <Input
              id="blog-date"
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </div>

          <VisualRichEditor
            id="blog-content"
            label="Content *"
            value={draft.content}
            onChange={(value: string) => setDraft({ ...draft, content: value })}
            rows={6}
            placeholder="Write your blog content..."
            required
          />

          <div>
            <Label>Featured Image</Label>
            <ImageDropzone
              value={draft.imageUrl || ''}
              onChange={(url) => setDraft({ ...draft, imageUrl: url })}
            />
          </div>

          <div>
            <Label>Gallery Images</Label>
            <MultiImageDropzone
              images={draft.images || []}
              onChange={(images) => setDraft({ ...draft, images })}
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