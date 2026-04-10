import React, { useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { VisualRichEditor } from '@/app/components/admin/VisualRichEditor';
import { Plus, Trash2, FileText, Edit, CheckCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { BlogPost, BlogPostForm } from '@/app/context/ContentContext';
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostsPaginated,
} from '@/services/supabaseService';
import { useServerPagination } from '@/hooks/useServerPagination';
import { PaginationControls } from '@/app/components/admin/PaginationControls';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { AdminPageSkeleton } from '@/app/components/admin/SkeletonLoaders';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { MultiImageDropzone } from '@/app/components/MultiImageDropzone';
import { toast } from 'sonner';
import { invalidateBlogCache } from '@/utils/cacheInvalidation';
import { AdminValidationRules, mergeValidationResults, validateMaxChars, validateMaxWords, validateNoDigits, validateRequiredTrimmed } from '@/app/components/admin/utils/adminHelpers';
import { uploadImage, uploadImages, deleteStorageFile } from '@/utils/storageUpload';

interface BlogManagerProps {
  refreshContent?: () => Promise<void>;
}

export const BlogManager: React.FC<BlogManagerProps> = ({
  refreshContent,
}) => {
  const [editingPost, setEditingPost] = useState<BlogPostForm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize delete confirmation hook
  const { confirmDelete, DeleteConfirmDialog } = useDeleteConfirmation();

  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<BlogPost>({
    fetchFunction: getBlogPostsPaginated,
    itemsPerPage: 6,
  });

  const addPost = () => {
    const newPost: BlogPost = {
      id: `temp-${Date.now()}`,
      title: "",
      content: "",
      author: "Admin",
      authorRole: "Administrator",
      date: new Date().toISOString().split("T")[0],
      imageUrl: "",
      images: [],
      likes: 0,
    };
    setEditingPost(newPost);
    setIsModalOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost({ ...post });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete({
      itemName: 'blog post',
      title: 'Delete Blog Post',
      message: 'Are you sure you want to delete this blog post? This action cannot be undone.'
    });
    
    if (!confirmed) return;

    try {
      // Only delete from database and storage if it's not a temp ID
      if (!id.startsWith('temp-') && !id.match(/^\\d{13}$/)) {
        // Find the post to get its image URLs for storage cleanup
        const postToDelete = pagination.data.find(p => p.id === id);
        if (postToDelete) {
          // Delete main image
          if (postToDelete.imageUrl) {
            await deleteStorageFile(postToDelete.imageUrl, 'blog');
          }
          // Delete gallery images
          if (postToDelete.images && postToDelete.images.length > 0) {
            for (const imgUrl of postToDelete.images) {
              await deleteStorageFile(imgUrl, 'blog');
            }
          }
        }
        await deleteBlogPost(id);
      }
      
      // Invalidate cache
      invalidateBlogCache();
      
      // Refresh data from database
      await pagination.refresh();
      
      // Also refresh global content context
      if (refreshContent) {
        await refreshContent();
      }
      
      toast.success('Blog post deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Failed to delete blog post.');
    }
  };

  const handleSavePost = async () => {
    if (!editingPost) return;

    const validation = mergeValidationResults(
      validateRequiredTrimmed(editingPost.title, 'Title'),
      validateMaxChars(editingPost.title.trim(), AdminValidationRules.shortTitleMaxChars, 'Title'),
      validateMaxWords(editingPost.title.trim(), AdminValidationRules.shortTitleMaxWords, 'Title'),
      validateRequiredTrimmed(editingPost.content, 'Content'),
      validateMaxChars(editingPost.content.trim(), AdminValidationRules.contentMaxChars, 'Content'),
      validateRequiredTrimmed(editingPost.author, 'Author'),
      validateNoDigits(editingPost.author, 'Author'),
      validateMaxChars(editingPost.author.trim(), AdminValidationRules.nameMaxChars, 'Author'),
      validateMaxWords(editingPost.author.trim(), AdminValidationRules.nameMaxWords, 'Author'),
      validateMaxChars((editingPost.authorRole || '').trim(), AdminValidationRules.roleMaxChars, 'Author role'),
      validateMaxWords((editingPost.authorRole || '').trim(), AdminValidationRules.roleMaxWords, 'Author role'),
      validateNoDigits(editingPost.authorRole || '', 'Author role')
    );
    if (!validation.isValid) {
      toast.error(validation.error || 'Validation failed');
      return;
    }
    
    setIsSaving(true);
    try {
      // Handle Image Uploads before saving to database
      let finalImageUrl = editingPost.imageUrl;
      if (typeof finalImageUrl === 'object' && finalImageUrl instanceof File) {
        finalImageUrl = await uploadImage(finalImageUrl, 'blog');
      }

      let finalImages = editingPost.images || [];
      if (editingPost.images && editingPost.images.some(img => typeof img === 'object')) {
        const filesToUpload = editingPost.images.filter(img => typeof img === 'object') as File[];
        const uploadedUrls = await uploadImages(filesToUpload, 'blog');
        let uploadIdx = 0;
        finalImages = editingPost.images.map(img => {
          if (typeof img === 'object') {
            return uploadedUrls[uploadIdx++];
          }
          return img as string;
        });
      }

      const postData = {
        title: editingPost.title,
        content: editingPost.content,
        author: editingPost.author,
        author_role: editingPost.authorRole,
        date: editingPost.date,
        image_url: (finalImageUrl as string) || null,
        images: (finalImages as string[]) || null,
        likes: editingPost.likes || 0
      };
      
      // Check if updating existing or creating new
      if (editingPost.id && !editingPost.id.startsWith('temp-') && !editingPost.id.match(/^\\d{13}$/)) {
        // Update existing
        await updateBlogPost(editingPost.id, postData);
        toast.success('Blog post updated!');
      } else {
        // Create new
        await createBlogPost(postData);
        toast.success('Blog post created!');
      }
      
      // Refresh data from database
      await pagination.refresh();
      
      // Also refresh global content context
      if (refreshContent) {
        await refreshContent();
      }
      
      // Invalidate cache
      invalidateBlogCache();
      
      setIsModalOpen(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error('Failed to save blog post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Manage Blog Posts
        </h3>
        <Button onClick={addPost} size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Blog Post
        </Button>
      </div>

      {/* Loading State */}
      {pagination.loading && pagination.data.length === 0 && (
        <AdminPageSkeleton message="Loading blog posts..." />
      )}

      {/* Empty State */}
      {!pagination.loading && pagination.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <FileText className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">
            No blog posts yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Click "Add Blog Post" to create your first post
          </p>
        </div>
      )}

      {/* Blog Posts Grid */}
      {pagination.data.length > 0 && (
        <>
          {/* Show loading skeleton during pagination */}
          {pagination.loading ? (
            <AdminPageSkeleton message="Loading blog posts..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagination.data.map((post) => (
              <Card
                key={post.id}
                className="cursor-pointer relative group"
                onClick={() => handleEdit(post)}
              >
                <div className="absolute top-2 left-2 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/90 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                {post.imageUrl || (post.images && post.images.length > 0) ? (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={post.imageUrl || post.images?.[0] || ""}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-2">
                    {post.title || "Untitled Post"}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2 whitespace-pre-wrap">
                    {post.content}
                  </p>
                  {post.date && (
                    <p className="text-xs text-gray-500">
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Edit className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Click to edit
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}

          {/* Server-side Pagination Controls */}
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            loading={pagination.loading}
            onPageChange={pagination.goToPage}
            onPrevious={pagination.prevPage}
            onNext={pagination.nextPage}
            itemCount={pagination.data.length}
            totalItems={pagination.totalItems}
          />
        </>
      )}

      {/* Blog Post Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl">
          <DialogHeader className="p-5 pb-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              {editingPost?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Blog Post
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {editingPost?.id?.startsWith('temp-') 
                ? 'Create a new blog post' 
                : 'Update the details for this blog post'}
            </DialogDescription>
          </DialogHeader>

          {editingPost && (
            <div
              className="overflow-y-auto max-h-[calc(90vh-140px)] px-5 pb-5"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="modal-blog-title" className="text-sm font-semibold">
                    Title
                  </Label>
                  <Input
                    id="modal-blog-title"
                    value={editingPost.title || ""}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, title: e.target.value })
                    }
                    placeholder="Enter a compelling title for your story..."
                    className="text-lg font-semibold"
                  />
                </div>

                <VisualRichEditor
                  id="modal-blog-content"
                  label="Content"
                  value={editingPost.content}
                  onChange={(value: string) =>
                    setEditingPost({ ...editingPost, content: value })
                  }
                  rows={12}
                  placeholder="Write your blog post content here..."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="modal-blog-author">Author</Label>
                    <Input
                      id="modal-blog-author"
                      value={editingPost.author}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, author: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="modal-blog-role">Author Role</Label>
                    <Input
                      id="modal-blog-role"
                      value={editingPost.authorRole}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, authorRole: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="modal-blog-date">Date</Label>
                  <Input
                    id="modal-blog-date"
                    type="date"
                    value={editingPost.date}
                    min="2000-01-01"
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Cover Image (Drag & Drop)</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload a cover image for this blog post
                  </p>
                  <ImageDropzone
                    value={editingPost.imageUrl || ''}
                    onChange={(url) =>
                      setEditingPost({ ...editingPost, imageUrl: url })
                    }
                    label="Cover Image"
                  />
                </div>

                <div>
                  <Label>Gallery Images (Drag & Drop)</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload additional images for the gallery
                  </p>
                  <MultiImageDropzone
                    images={editingPost.images || []}
                    onChange={(images) => {
                      setEditingPost({
                        ...editingPost,
                        images
                      });
                    }}
                    label="Blog Post Images"
                  />
                </div>

                {/* Save Button */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    className="flex-1 w-full" 
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingPost(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  <Button 
                    className="flex-1 w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
                    disabled={isSaving}
                    onClick={handleSavePost}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Blog Post'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog />
    </div>
  );
};