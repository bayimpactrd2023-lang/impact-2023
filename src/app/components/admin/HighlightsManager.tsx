import React, { useState } from 'react';
import { Highlight, HighlightForm } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Switch } from '@/app/components/ui/switch';
import { Plus, Trash2, Edit, X, CheckCircle, Star, Sparkles } from 'lucide-react';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { MultiImageDropzone } from '@/app/components/MultiImageDropzone';
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { invalidateHighlightsCache } from '@/utils/cacheInvalidation';
import { useServerPagination } from '@/hooks/useServerPagination';
import { getImageUrl } from '@/utils/r2Upload';
import { EntityValidator } from '@/app/components/admin/utils/adminHelpers';
import {
  createHighlight,
  updateHighlight as updateHighlightInDb,
  deleteHighlight as deleteHighlightFromDb,
  getHighlightsPaginated,
  getAllHighlights,
} from '@/services/supabaseService';
import { uploadImage, uploadImages, deleteStorageFile } from '@/utils/storageUpload';
import { PaginationControls } from '@/app/components/admin/PaginationControls';
import { AdminPageSkeleton } from '@/app/components/admin/SkeletonLoaders';

interface HighlightsManagerProps {
  highlights: Highlight[];
  onUpdate: (highlights: Highlight[]) => void;
  refreshContent?: () => Promise<void>;
}

export const HighlightsManager: React.FC<HighlightsManagerProps> = ({ highlights: _highlights, onUpdate: _onUpdate, refreshContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<HighlightForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
  const [featuredHighlights, setFeaturedHighlights] = useState<Highlight[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);

  const { confirmDelete, DeleteConfirmDialog } = useDeleteConfirmation();

  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<Highlight>({
    fetchFunction: getHighlightsPaginated,
    itemsPerPage: 6,
  });

  const addHighlight = () => {
    const newHighlight: Highlight = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      imageUrl: '',
      iconName: 'star', // Default icon
      featured: false,
    };
    setEditingHighlight(newHighlight);
    setIsModalOpen(true);
  };

  const handleEdit = (highlight: Highlight) => {
    setEditingHighlight({ ...highlight });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete({
      itemName: 'highlight',
      title: 'Delete Highlight',
      message: 'Are you sure you want to delete this highlight? This action cannot be undone.'
    });
    
    if (!confirmed) return;

    try {
      if (!id.startsWith('temp-') && !id.match(/^\d{13}$/)) {
        // Find the highlight to get its image URLs for storage cleanup
        const highlightToDelete = pagination.data.find(h => h.id === id);
        if (highlightToDelete) {
          // Delete main image
          if (highlightToDelete.imageUrl) {
            await deleteStorageFile(highlightToDelete.imageUrl, 'highlights');
          }
          // Delete gallery images
          if (highlightToDelete.images && highlightToDelete.images.length > 0) {
            for (const imgUrl of highlightToDelete.images) {
              await deleteStorageFile(imgUrl, 'highlights');
            }
          }
        }
        await deleteHighlightFromDb(id);
      }
      
      // Invalidate cache so users see fresh data
      invalidateHighlightsCache();
      
      await pagination.refresh();
      toast.success('Highlight deleted successfully!');
    } catch (error) {
      console.error('Error deleting highlight:', error);
      toast.error('Failed to delete highlight.');
    }
  };

  const handleSave = async () => {
    if (!editingHighlight || isSaving) return;

    const validation = EntityValidator.validateHighlight(editingHighlight);
    if (!validation.isValid) {
      toast.error(validation.error || 'Validation failed');
      return;
    }
    
    // Validation: Ensure required fields are filled
    if (!editingHighlight.title.trim()) {
      toast.error('Please enter a title for the highlight.');
      return;
    }

    if (!editingHighlight.description.trim()) {
      toast.error('Please enter a description for the highlight.');
      return;
    }

    // Validation: Ensure at least one image is uploaded
    const hasImage = editingHighlight.imageUrl && 
      (typeof editingHighlight.imageUrl === 'string' 
        ? editingHighlight.imageUrl.trim() !== '' 
        : editingHighlight.imageUrl instanceof File);
    if (!hasImage) {
      toast.error('Please upload at least one image for the highlight.');
      return;
    }

    // Validation: Check featured items limit (max 3)
    if (editingHighlight.featured) {
      const allHighlights = await getAllHighlights();
      const currentFeatured = allHighlights.filter((h: any) => 
        h.featured === true && h.id !== editingHighlight.id
      );
      
      if (currentFeatured.length >= 3) {
        toast.error('Maximum 3 featured highlights allowed. Please unselect an existing featured item first.');
        setFeaturedHighlights(currentFeatured);
        setIsFeaturedModalOpen(true);
        return;
      }
    }
    
    setIsSaving(true);
    try {
      // Handle Image Uploads before saving to database
      let finalImageUrl = editingHighlight.imageUrl;
      if (typeof finalImageUrl === 'object' && finalImageUrl instanceof File) {
        finalImageUrl = await uploadImage(finalImageUrl, 'highlights');
      }

      let finalImages = editingHighlight.images || [];
      if (editingHighlight.images && editingHighlight.images.some(img => typeof img === 'object')) {
        const filesToUpload = editingHighlight.images.filter(img => typeof img === 'object') as File[];
        const uploadedUrls = await uploadImages(filesToUpload, 'highlights');
        let uploadIdx = 0;
        finalImages = editingHighlight.images.map(img => {
          if (typeof img === 'object') {
            return uploadedUrls[uploadIdx++];
          }
          return img as string;
        });
      }

      const highlightData = {
        title: editingHighlight.title,
        description: editingHighlight.description,
        image_url: (finalImageUrl as string) || '',
        images: (finalImages as string[]) || null,
        icon_name: editingHighlight.iconName || 'star',
        featured: editingHighlight.featured || false,
      };

      if (editingHighlight.id && !editingHighlight.id.startsWith('temp-') && !editingHighlight.id.match(/^\\d{13}$/)) {
        await updateHighlightInDb(editingHighlight.id, highlightData);
        toast.success('Highlight updated!');
      } else {
        await createHighlight(highlightData);
        toast.success('Highlight created!');
      }

      // Invalidate cache so users see fresh data
      invalidateHighlightsCache();

      await pagination.refresh();
      setIsModalOpen(false);
      setEditingHighlight(null);
    } catch (error) {
      console.error('Error saving highlight:', error);
      toast.error('Failed to save highlight. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const loadFeaturedHighlights = async () => {
    setLoadingFeatured(true);
    try {
      const allHighlights = await getAllHighlights();
      const featured = allHighlights.filter((h: any) => h.featured === true);
      setFeaturedHighlights(featured);
    } catch (error) {
      console.error('Error loading featured highlights:', error);
      toast.error('Failed to load featured highlights.');
    } finally {
      setLoadingFeatured(false);
    }
  };

  const handleShowFeatured = async () => {
    await loadFeaturedHighlights();
    setIsFeaturedModalOpen(true);
  };

  const toggleFeatured = async (id: string, currentFeaturedStatus: boolean) => {
    try {
      await updateHighlightInDb(id, { featured: !currentFeaturedStatus });
      
      // Invalidate cache so users see fresh data
      invalidateHighlightsCache();
      
      // Update local state
      setFeaturedHighlights(prev => 
        prev.map(h => h.id === id ? { ...h, featured: !currentFeaturedStatus } : h)
          .filter(h => h.featured === true)
      );
      
      // Refresh pagination
      await pagination.refresh();
      
      // Refresh content context for home page
      if (refreshContent) {
        await refreshContent();
      }
      
      toast.success(`Highlight ${!currentFeaturedStatus ? 'featured' : 'unfeatured'}!`);
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Highlights</h3>
        <div className="flex gap-2">
          <Button onClick={handleShowFeatured} variant="outline" size="sm">
            <Star className="w-4 h-4 mr-2" /> Show All Featured
          </Button>
          <Button onClick={addHighlight} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Highlight
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {pagination.loading && pagination.data.length === 0 && (
        <AdminPageSkeleton message="Loading highlights..." />
      )}

      {/* Empty State */}
      {!pagination.loading && pagination.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <Sparkles className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No highlights yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Highlight" to create your first highlight</p>
        </div>
      )}

      {/* Highlights Grid */}
      {pagination.data.length > 0 && (
        <>
          {/* Show loading skeleton during pagination */}
          {pagination.loading ? (
            <AdminPageSkeleton message="Loading highlights..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagination.data.map((highlight) => (
              <Card
                key={highlight.id}
                className="cursor-pointer relative group"
                onClick={() => handleEdit(highlight)}
              >
                {highlight.featured && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-[#1887FC] text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  </div>
                )}

                <div className="absolute top-2 left-2 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/90 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(highlight.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                {highlight.imageUrl ? (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={getImageUrl(highlight.imageUrl)}
                      alt={highlight.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-lg flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-[#1887FC]" />
                  </div>
                )}

                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-2">
                    {highlight.title || 'Untitled'}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {highlight.description}
                  </p>
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

      {/* Highlight Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingHighlight?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Highlight
            </DialogTitle>
            <DialogDescription>
              {editingHighlight?.id?.startsWith('temp-')
                ? 'Create a new highlight entry'
                : 'Update the details for this highlight'}
            </DialogDescription>
          </DialogHeader>

          {editingHighlight && (
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-1">
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="highlight-title">Title *</Label>
                  <Input
                    id="highlight-title"
                    value={editingHighlight.title}
                    onChange={(e) =>
                      setEditingHighlight({ ...editingHighlight, title: e.target.value })
                    }
                    placeholder="Enter highlight title"
                  />
                </div>

                <div>
                  <Label htmlFor="highlight-description">Description *</Label>
                  <Textarea
                    id="highlight-description"
                    value={editingHighlight.description}
                    onChange={(e) =>
                      setEditingHighlight({ ...editingHighlight, description: e.target.value })
                    }
                    rows={4}
                    placeholder="Enter highlight description"
                  />
                </div>

                <div>
                  <Label>Cover Image (Drag & Drop)</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload a cover image for this highlight
                  </p>
                  <ImageDropzone
                    value={editingHighlight.imageUrl || ''}
                    onChange={(url) =>
                      setEditingHighlight({ ...editingHighlight, imageUrl: url })
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
                    images={editingHighlight.images || []}
                    onChange={(images) => {
                      setEditingHighlight({
                        ...editingHighlight,
                        images
                      });
                    }}
                    label="Highlight Images"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="highlight-featured"
                    checked={editingHighlight.featured || false}
                    onCheckedChange={(checked) =>
                      setEditingHighlight({ ...editingHighlight, featured: checked })
                    }
                  />
                  <Label htmlFor="highlight-featured" className="cursor-pointer">
                    Featured Highlight
                  </Label>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingHighlight(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb]"
                    disabled={isSaving}
                    onClick={handleSave}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Highlight'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Featured Highlights Modal */}
      <Dialog open={isFeaturedModalOpen} onOpenChange={setIsFeaturedModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#1887FC]" />
              Featured Highlights
            </DialogTitle>
            <DialogDescription>
              Toggle featured status for highlights. Maximum of 3 featured items allowed. Changes are saved immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-1">
            {loadingFeatured ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-[#1887FC] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading featured highlights...</p>
                </div>
              </div>
            ) : featuredHighlights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Star className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">No featured highlights yet</p>
                <p className="text-xs text-gray-400 mt-1">Toggle the featured switch when editing a highlight</p>
              </div>
            ) : (
              <>
                {/* Featured count warning */}
                {featuredHighlights.length >= 3 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> You have reached the maximum of 3 featured highlights. To add a new featured item, please unselect one below.
                    </p>
                  </div>
                )}
                
                <div className="space-y-3 py-4">
                  {featuredHighlights.map((highlight) => (
                    <div
                      key={highlight.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {highlight.imageUrl && (
                        <img
                          src={getImageUrl(highlight.imageUrl)}
                          alt={highlight.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{highlight.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1">{highlight.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Featured</span>
                        <Switch
                          checked={highlight.featured || false}
                          onCheckedChange={() => toggleFeatured(highlight.id, highlight.featured || false)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsFeaturedModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </div>
  );
};