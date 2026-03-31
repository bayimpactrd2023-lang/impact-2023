/**
 * Quick Blog Create Component
 * Modal for quickly creating a new blog post
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { BlogPost } from '@/app/context/ContentContext';
import { createBlogPost } from '@/services/supabaseService';
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
import { MultiImageDropzone } from '@/app/components/MultiImageDropzone';

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
  const [draft, setDraft] = useState<BlogPost>({
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
      const blogData = {
        title: draft.title,
        content: draft.content,
        author: draft.author,
        author_role: draft.authorRole,
        date: draft.date,
        image_url: draft.imageUrl || null,
        images: draft.images || null,
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

          <div>
            <Label htmlFor="blog-content">Content *</Label>
            <Textarea
              id="blog-content"
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder="Write your blog content..."
              rows={6}
            />
          </div>

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