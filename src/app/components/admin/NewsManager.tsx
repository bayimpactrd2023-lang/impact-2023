import React, { useState } from 'react';
import { NewsItem, NewsItemForm } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { VisualRichEditor } from './VisualRichEditor';
import { SharedToolbar } from './SharedToolbar';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Plus, Trash2, Edit, X, CheckCircle, Newspaper, Calendar } from 'lucide-react';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { MultiImageDropzone } from '@/app/components/MultiImageDropzone';
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { invalidateNewsCache } from '@/utils/cacheInvalidation';
import { useServerPagination } from '@/hooks/useServerPagination';
import { getImageUrl } from '@/utils/r2Upload';
import { EntityValidator, hasChanges } from '@/app/components/admin/utils/adminHelpers';
import { RichTextContent } from '@/app/components/RichTextContent';
import { 
  createNews, 
  updateNews as updateNewsInDb, 
  deleteNews as deleteNewsFromDb, 
  getNewsPaginated 
} from '@/services/supabaseService';
import { uploadImage, uploadImages, deleteStorageFile } from '@/utils/storageUpload';
import { PaginationControls } from '@/app/components/admin/PaginationControls';
import { AdminPageSkeleton } from '@/app/components/admin/SkeletonLoaders';

interface NewsManagerProps {
  news: NewsItem[];
  onUpdate: (news: NewsItem[]) => void;
  refreshContent?: () => Promise<void>;
}

export const NewsManager: React.FC<NewsManagerProps> = ({ news: _news, onUpdate: _onUpdate, refreshContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItemForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleCommand = (cmd: string, val?: string) => {
    if (activeField) {
      const event = new CustomEvent(`editor-command-${activeField}`, { 
        detail: { command: cmd, value: val } 
      });
      window.dispatchEvent(event);
    }
  };

  const { confirmDelete, DeleteConfirmDialog } = useDeleteConfirmation();

  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<NewsItem>({
    fetchFunction: getNewsPaginated,
    itemsPerPage: 6,
  });

  const addNews = () => {
    const newItem: NewsItemForm = {
      id: `temp-${Date.now()}`,
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      imageUrl: '',
      images: [],
    };
    setEditingNews(newItem);
    setIsModalOpen(true);
  };

  const handleEdit = (item: NewsItem) => {
    setEditingNews({ ...item } as NewsItemForm);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete({
      itemName: 'news item',
      title: 'Delete News',
      message: 'Are you sure you want to delete this news item? This action cannot be undone.'
    });
    
    if (!confirmed) return;

    try {
      if (!id.startsWith('temp-') && !id.match(/^\d{13}$/)) {
        // Find the news item to get its image URLs for storage cleanup
        const newsToDelete = pagination.data.find(n => n.id === id);
        if (newsToDelete) {
          // Delete main image
          if (newsToDelete.imageUrl) {
            await deleteStorageFile(newsToDelete.imageUrl, 'news');
          }
          // Delete gallery images
          if (newsToDelete.images && newsToDelete.images.length > 0) {
            for (const imgUrl of newsToDelete.images) {
              await deleteStorageFile(imgUrl, 'news');
            }
          }
        }
        await deleteNewsFromDb(id);
      }
      
      // Invalidate cache so users see fresh data
      invalidateNewsCache();

      // Refresh pagination data
      await pagination.refresh();

      // Also refresh global content context
      if (refreshContent) {
        await refreshContent();
      }

      toast.success('News deleted successfully!');
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Failed to delete news.');
    }
  };

  const handleSave = async () => {
    if (!editingNews || isSaving) return;

    const validation = EntityValidator.validateNewsItem(editingNews);
    if (!validation.isValid) {
      toast.error(validation.error || 'Validation failed');
      return;
    }
    
    setIsSaving(true);
    try {
      // Handle Image Uploads before saving to database
      let finalImageUrl = editingNews.imageUrl;
      if (typeof finalImageUrl === 'object' && finalImageUrl instanceof File) {
        finalImageUrl = await uploadImage(finalImageUrl, 'news');
      }

      let finalImages = editingNews.images || [];
      if (editingNews.images && editingNews.images.some(img => typeof img === 'object')) {
        const filesToUpload = editingNews.images.filter(img => typeof img === 'object') as File[];
        const uploadedUrls = await uploadImages(filesToUpload, 'news');
        
        let uploadIdx = 0;
        finalImages = editingNews.images.map(img => {
          if (typeof img === 'object') {
            return uploadedUrls[uploadIdx++];
          }
          return img as string;
        });
      }

      const newsData = {
        title: editingNews.title,
        content: editingNews.content,
        date: editingNews.date,
        image_url: (finalImageUrl as string) || null,
        images: (finalImages as string[]) || null,
      };

      if (editingNews.id && !editingNews.id.startsWith('temp-') && !editingNews.id.match(/^\d{13}$/)) {
        const originalNews = pagination.data.find(n => n.id === editingNews.id);
        if (originalNews && !hasChanges(originalNews, editingNews)) {
          toast.info('No changes detected.');
          setIsModalOpen(false);
          setEditingNews(null);
          return;
        }
        await updateNewsInDb(editingNews.id, newsData);
        toast.success('News updated!');
      } else {
        await createNews(newsData);
        toast.success('News created!');
      }

      // Invalidate cache so users see fresh data
      invalidateNewsCache();

      // Refresh pagination data
      await pagination.refresh();
      
      // Also refresh global content context
      if (refreshContent) {
        await refreshContent();
      }
      
      setIsModalOpen(false);
      setEditingNews(null);
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error('Failed to save news. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage News & Updates</h3>
        <Button onClick={addNews} size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add News
        </Button>
      </div>

      {/* Loading State */}
      {pagination.loading && pagination.data.length === 0 && (
        <AdminPageSkeleton message="Loading news items..." />
      )}

      {/* Empty State */}
      {!pagination.loading && pagination.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <Newspaper className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No news items yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add News" to create your first news item</p>
        </div>
      )}

      {/* News Grid */}
      {pagination.data.length > 0 && (
        <>
          {/* Show loading skeleton during pagination */}
          {pagination.loading ? (
            <AdminPageSkeleton message="Loading news items..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagination.data.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer relative group"
                onClick={() => handleEdit(item)}
              >
                <div className="absolute top-2 left-2 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/90 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                {item.imageUrl || (item.images && item.images.length > 0) ? (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={getImageUrl(item.imageUrl || item.images?.[0] || '')}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-lg flex items-center justify-center">
                    <Newspaper className="w-16 h-16 text-[#1887FC]" />
                  </div>
                )}

                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-2">
                    {item.title || 'Untitled'}
                  </h4>
                  <div className="text-xs text-gray-600 line-clamp-2">
                    <RichTextContent text={item.content} className="text-xs text-gray-600" />
                  </div>
                  {item.date && (
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-600">
                        {new Date(item.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Edit className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Click to edit</span>
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

      {/* News Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
                <Newspaper className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                  {editingNews?.id?.startsWith('temp-') ? 'Create' : 'Edit'} News Item
                </DialogTitle>
                <DialogDescription className="text-base text-gray-500 mt-0.5 font-medium">
                  {editingNews?.id?.startsWith('temp-')
                    ? 'Create a new news item'
                    : 'Update the details for this news item'}
                </DialogDescription>
              </div>
            </div>
            <div className="pt-2">
              <SharedToolbar 
                onCommand={handleCommand} 
              />
            </div>
          </DialogHeader>

          {editingNews && (
            <div
              className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide"
            >
              <div className="space-y-8 py-6">
                <div>
                  <Label htmlFor="news-title" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    Title <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="news-title"
                    value={editingNews.title}
                    onChange={(e) =>
                      setEditingNews({ ...editingNews, title: e.target.value })
                    }
                    placeholder="Enter news title"
                    className="text-lg font-semibold"
                  />
                </div>

                <div>
                  <Label htmlFor="news-date" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    Date <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="news-date"
                    type="date"
                    value={editingNews.date}
                    onChange={(e) =>
                      setEditingNews({ ...editingNews, date: e.target.value })
                    }
                  />
                </div>

                <VisualRichEditor
                  id="news-content"
                  label="Content"
                  value={editingNews.content}
                  onChange={(value: string) =>
                    setEditingNews({ ...editingNews, content: value })
                  }
                  rows={10}
                  placeholder="Enter news content"
                  required
                  showToolbar={false}
                  onCommand={(cmd) => {
                    if (cmd === 'focus') {
                      setActiveField('news-content');
                    }
                  }}
                />

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1">Cover Image (Drag & Drop)</Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload a high-quality cover image for this news article
                  </p>
                  <ImageDropzone
                    value={editingNews.imageUrl || ''}
                    onChange={(url) =>
                      setEditingNews({ ...editingNews, imageUrl: url })
                    }
                    label="Cover Image"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1">Gallery Images (Drag & Drop)</Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload additional images for the gallery
                  </p>
                  <MultiImageDropzone
                    images={editingNews.images || []}
                    onChange={(images) => {
                      setEditingNews({
                        ...editingNews,
                        images
                      });
                    }}
                    label="News Article Images"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 p-6 border-t border-gray-100 shrink-0 bg-gray-50/80 backdrop-blur-sm rounded-b-2xl">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-white hover:border-gray-300 transition-all"
              onClick={() => {
                setIsModalOpen(false);
                setEditingNews(null);
              }}
            >
              <X className="w-5 h-4 mr-2" /> Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:shadow-lg hover:shadow-blue-500/25 text-white transition-all transform hover:-translate-y-0.5"
              disabled={isSaving}
              onClick={handleSave}
            >
              <CheckCircle className="w-5 h-5 mr-2" /> {isSaving ? 'Saving...' : 'Save News'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </div>
  );
};
