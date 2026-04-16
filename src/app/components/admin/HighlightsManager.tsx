import React, { useState } from 'react';
import { HighlightForm, Highlight as AppHighlight } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Switch } from '@/app/components/ui/switch';
import { Plus, Trash2, Edit, CheckCircle, X, Sparkles, Star, Lightbulb, Calendar } from 'lucide-react';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { MultiImageDropzone } from '@/app/components/MultiImageDropzone';
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { useConfirm } from '@/shared/hooks';
import { invalidateHighlightsCache } from '@/utils/cacheInvalidation';
import { useServerPagination } from '@/hooks/useServerPagination';
import { getImageUrl } from '@/utils/r2Upload';
import { EntityValidator, hasChanges } from '@/app/components/admin/utils/adminHelpers';
import { RichTextContent } from '@/app/components/RichTextContent';
import {
  createHighlight,
  updateHighlight as updateHighlightInDb,
  deleteHighlight as deleteHighlightFromDb,
  getHighlightsPaginated,
  getAllHighlights,
} from '@/services/supabaseService';
import { VisualRichEditor } from './VisualRichEditor';
import { SharedToolbar } from './SharedToolbar';
import { uploadImage, uploadImages, deleteStorageFile } from '@/utils/storageUpload';
import { PaginationControls } from '@/app/components/admin/PaginationControls';
import { AdminPageSkeleton } from '@/app/components/admin/SkeletonLoaders';

interface HighlightsManagerProps {
  highlights: AppHighlight[];
  onUpdate: (highlights: AppHighlight[]) => void;
  refreshContent?: () => Promise<void>;
}

export const HighlightsManager: React.FC<HighlightsManagerProps> = ({ highlights: _highlights, onUpdate: _onUpdate, refreshContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<HighlightForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
  const [featuredHighlights, setFeaturedHighlights] = useState<AppHighlight[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
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
  const { showConfirm, ConfirmDialog: ConfirmUnfeatureDialog } = useConfirm();

  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<AppHighlight>({
    fetchFunction: getHighlightsPaginated,
    itemsPerPage: 6,
  });

  const addHighlight = () => {
    const newHighlight: HighlightForm = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      imageUrl: '',
      iconName: 'star', // Default icon
      featured: false,
      publishedDate: new Date().toISOString().split('T')[0], // Default to today
    };
    setEditingHighlight(newHighlight);
    setIsModalOpen(true);
  };

  const handleEdit = (highlight: AppHighlight) => {
    setEditingHighlight({ ...highlight } as HighlightForm);
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

    // Validation: Ensure published date is set and valid
    const minDate = '2000-01-01';
    const maxDate = new Date().toISOString().split('T')[0];
    if (!editingHighlight.publishedDate) {
      toast.error('Please select a published date.');
      return;
    }
    if (editingHighlight.publishedDate < minDate || editingHighlight.publishedDate > maxDate) {
      toast.error(`Published date must be between ${minDate} and ${maxDate}.`);
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

      const highlightData: any = {
        title: editingHighlight.title,
        description: editingHighlight.description,
        image_url: (finalImageUrl as string) || '',
        images: (finalImages as string[]) || null,
        icon_name: editingHighlight.iconName || 'star',
        featured: editingHighlight.featured || false,
        content: editingHighlight.content || null,
      };

      // Only add published_date if it exists (for backward compatibility)
      if (editingHighlight.publishedDate) {
        highlightData.published_date = editingHighlight.publishedDate;
      }

      let result;
      if (editingHighlight.id && !editingHighlight.id.startsWith('temp-') && !editingHighlight.id.match(/^\d{13}$/)) {
        const originalHighlight = pagination.data.find(h => h.id === editingHighlight.id);
        if (originalHighlight && !hasChanges(originalHighlight, editingHighlight)) {
          toast.info('No changes detected.');
          setIsModalOpen(false);
          setEditingHighlight(null);
          return;
        }
        result = await updateHighlightInDb(editingHighlight.id, highlightData);
      } else {
        result = await createHighlight(highlightData);
      }

      if (!result) {
        // If failed and we sent published_date, try without it
        if (highlightData.published_date !== undefined) {
          delete highlightData.published_date;
          if (editingHighlight.id && !editingHighlight.id.startsWith('temp-') && !editingHighlight.id.match(/^\d{13}$/)) {
            result = await updateHighlightInDb(editingHighlight.id, highlightData);
          } else {
            result = await createHighlight(highlightData);
          }
          if (result) {
            toast.success('Highlight saved! (Run SQL migration for date support)');
          } else {
            throw new Error('Failed to save highlight');
          }
        } else {
          toast.error('Failed to save highlight. Your database has strict limits (description/words). Run the SQL migration: supabase/migrations/fix_all_highlights_constraints.sql');
          throw new Error('Failed to save highlight');
        }
      } else {
        toast.success(editingHighlight.id && !editingHighlight.id.startsWith('temp-') ? 'Highlight updated!' : 'Highlight created!');
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
    // If currently featured and trying to un-feature, show confirmation
    if (currentFeaturedStatus) {
      const confirmed = await showConfirm({
        title: 'Remove from Featured?',
        message: 'Are you sure you want to remove this highlight from the featured list? This will remove it from the home page highlights section.',
        confirmText: 'Remove',
        cancelText: 'Keep Featured',
        variant: 'danger'
      });
      
      if (!confirmed) return;
    }
    
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
            <Lightbulb className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">Manage Highlights</h3>
            <p className="text-xs text-gray-500 font-medium">Feature your best work</p>
          </div>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Button 
            onClick={handleShowFeatured} 
            variant="default" 
            size="sm" 
            className="flex-1 sm:flex-initial bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md h-10 sm:h-9 px-4 font-semibold rounded-xl"
          >
            <Star className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Show All </span>Featured
          </Button>
          <Button 
            onClick={addHighlight} 
            size="sm"
            className="flex-1 sm:flex-initial bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 h-10 sm:h-9 px-4 font-semibold rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" /> Add<span className="hidden sm:inline"> Highlight</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagination.data.map((highlight) => (
              <Card
                key={highlight.id}
                className="cursor-pointer relative group overflow-hidden border-gray-100/50 hover:border-blue-200/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 rounded-3xl"
                onClick={() => handleEdit(highlight)}
              >
                {/* Featured Badge */}
                {highlight.featured && (
                  <div className="absolute top-4 left-16 z-20">
                    <div className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-blue-500/30 border border-blue-400/30">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  </div>
                )}

                {/* Delete Button */}
                <div className="absolute top-4 right-4 z-20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 bg-white/90 backdrop-blur-md shadow-md hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all border border-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(highlight.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="p-0">
                  {/* Image Container */}
                  <div className="relative w-full h-48 mb-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                    {highlight.imageUrl ? (
                      <img
                        src={getImageUrl(highlight.imageUrl)}
                        alt={highlight.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-[#1887FC]" />
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-[#1887FC] transition-colors leading-tight">
                        {highlight.title || 'Untitled'}
                      </h4>
                      {highlight.publishedDate && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <Calendar className="w-3.5 h-3.5 text-[#1887FC]" />
                          <span className="text-xs font-bold text-[#1887FC] uppercase tracking-wider">
                            {new Date(highlight.publishedDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      <RichTextContent text={highlight.description} className="text-sm text-gray-500" />
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <Edit className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors">Click to edit</span>
                      </div>
                    </div>
                  </div>
                </div>
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
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          <DialogHeader className="p-4 sm:p-6 pb-2 border-b border-gray-100 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {editingHighlight?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Highlight
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-gray-500 mt-0.5 font-medium">
                  {editingHighlight?.id?.startsWith('temp-')
                    ? 'Create a new highlight entry'
                    : 'Update the details for this highlight'}
                </DialogDescription>
              </div>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <SharedToolbar 
                onCommand={handleCommand} 
              />
              
              {editingHighlight && (
                <button
                  type="button"
                  onClick={async () => {
                    const newStatus = !editingHighlight.featured;
                    if (newStatus) {
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
                    setEditingHighlight({ ...editingHighlight, featured: newStatus });
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 group ${
                    editingHighlight.featured 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-white border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <Star className={`w-4 h-4 transition-transform group-hover:scale-110 ${editingHighlight.featured ? 'fill-white' : 'fill-transparent'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {editingHighlight.featured ? 'Featured' : 'Feature This'}
                  </span>
                </button>
              )}
            </div>
          </DialogHeader>

          {editingHighlight && (
            <div
              className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 scrollbar-hide"
            >
              <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
                <div>
                  <Label htmlFor="highlight-title" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    Title <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="highlight-title"
                    value={editingHighlight.title}
                    onChange={(e) =>
                      setEditingHighlight({ ...editingHighlight, title: e.target.value })
                    }
                    placeholder="Enter highlight title"
                    className="text-lg font-semibold"
                  />
                </div>

                <div>
                  <VisualRichEditor
                    id="highlight-description"
                    label="Description"
                    value={editingHighlight.description}
                    onChange={(val) =>
                      setEditingHighlight({ ...editingHighlight, description: val })
                    }
                    rows={4}
                    placeholder="Enter highlight description"
                    required
                    showToolbar={false}
                    onCommand={(cmd) => {
                      if (cmd === 'focus') {
                        setActiveField('highlight-description');
                      }
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="highlight-published-date" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    Published Date <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="highlight-published-date"
                    type="date"
                    value={editingHighlight.publishedDate || ''}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      const minDate = '2000-01-01';
                      const maxDate = new Date().toISOString().split('T')[0];
                      
                      if (selectedDate && (selectedDate < minDate || selectedDate > maxDate)) {
                        toast.error(`Date must be between ${minDate} and ${maxDate}`);
                        return;
                      }
                      
                      setEditingHighlight({ ...editingHighlight, publishedDate: selectedDate });
                    }}
                    min="2000-01-01"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1">Cover Image (Drag & Drop)</Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload a high-quality cover image for this highlight
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
                  <Label className="text-sm font-semibold text-gray-700 mb-1 flex justify-between">
                    <span>Gallery Images (Drag & Drop)</span>
                    <span className="text-xs text-gray-400 font-normal">{editingHighlight.images?.length || 0} images</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-3">
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
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6 border-t border-gray-100 shrink-0 bg-gray-50/80 backdrop-blur-sm rounded-b-2xl">
            <Button
              variant="outline"
              className="flex-1 h-11 sm:h-12 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-white hover:border-gray-300 transition-all"
              onClick={() => {
                setIsModalOpen(false);
                setEditingHighlight(null);
              }}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-4 mr-2" /> Cancel
            </Button>
            <Button
              className="flex-1 h-11 sm:h-12 rounded-xl font-bold bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:shadow-lg hover:shadow-blue-500/25 text-white transition-all transform hover:-translate-y-0.5"
              disabled={isSaving}
              onClick={handleSave}
            >
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> {isSaving ? 'Saving...' : 'Save Highlight'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Featured Highlights Modal */}
      <Dialog open={isFeaturedModalOpen} onOpenChange={setIsFeaturedModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          <DialogHeader className="p-4 sm:p-6 pb-2 border-b border-gray-100 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Featured Highlights</DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-gray-500 mt-0.5 font-medium">
                  Toggle featured status for highlights. Maximum of 3 featured items allowed. Changes are saved immediately.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div
            className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 scrollbar-hide"
          >
            <div className="pt-4">
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
                      <p className="text-sm text-yellow-800 font-medium">
                        <strong>Note:</strong> You have reached the maximum of 3 featured highlights. To add a new featured item, please unselect one below.
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3 py-4">
                    {featuredHighlights.map((highlight) => (
                      <div
                        key={highlight.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-2xl hover:bg-gray-50 transition-colors"
                      >
                        {highlight.imageUrl && (
                          <img
                            src={getImageUrl(highlight.imageUrl as string)}
                            alt={highlight.title}
                            className="w-full sm:w-16 h-32 sm:h-16 object-cover rounded-xl shadow-sm"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-1">{highlight.title}</h4>
                          <div className="text-xs text-gray-500 line-clamp-2 sm:line-clamp-1">
                            <RichTextContent text={highlight.description} className="text-xs text-gray-500" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                          <div className="flex flex-col items-start sm:items-end sm:mr-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${highlight.featured ? 'text-blue-600' : 'text-gray-400'}`}>
                              {highlight.featured ? 'Featured' : 'Inactive'}
                            </span>
                          </div>
                          <Switch
                            checked={highlight.featured || false}
                            onCheckedChange={() => toggleFeatured(highlight.id, highlight.featured || false)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end p-4 sm:p-6 border-t border-gray-100 shrink-0 bg-gray-50/80 backdrop-blur-sm rounded-b-2xl">
            <Button
              variant="outline"
              className="px-6 sm:px-8 h-11 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-white transition-all w-full sm:w-auto"
              onClick={() => setIsFeaturedModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
      <ConfirmUnfeatureDialog />
    </div>
  );
};
