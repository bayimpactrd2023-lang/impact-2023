import React, { useState } from 'react';
import { InternshipTestimonial, InternshipTestimonialForm } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { VisualRichEditor } from '@/app/components/admin/VisualRichEditor';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Plus, Trash2, Edit, X, CheckCircle, MessageSquare, User } from 'lucide-react';
import { MultiImageDropzone } from '@/app/components/MultiImageDropzone';
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { useServerPagination } from '@/hooks/useServerPagination';
import {
  createInternshipTestimonial,
  updateInternshipTestimonial as updateTestimonialInDb,
  deleteInternshipTestimonial as deleteTestimonialFromDb,
  getInternshipTestimonialsPaginated,
} from '@/services/supabaseService';

import { PaginationControls } from '@/app/components/admin/PaginationControls';
import { AdminPageSkeleton } from '@/app/components/admin/SkeletonLoaders';
import { invalidateTestimonialsCache } from '@/utils/cacheInvalidation';
import { uploadImages, deleteStorageFile } from '@/utils/storageUpload';

import {
  AdminValidationRules,
  mergeValidationResults,
  validateMaxChars,
  validateMaxWords,
  validateNoDigits,
  validateRequiredTrimmed,
} from '@/app/components/admin/utils/adminHelpers';

interface InternshipTestimonialManagerProps {
  testimonials: InternshipTestimonial[];
  onUpdate: (testimonials: InternshipTestimonial[]) => void;
  refreshContent?: () => Promise<void>;
}

export const InternshipTestimonialManager: React.FC<InternshipTestimonialManagerProps> = ({ testimonials: _testimonials, onUpdate: _onUpdate, refreshContent: _refreshContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<InternshipTestimonialForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { confirmDelete, DeleteConfirmDialog } = useDeleteConfirmation();

  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<InternshipTestimonial>({
    fetchFunction: getInternshipTestimonialsPaginated,
    itemsPerPage: 6,
  });

  const addTestimonial = () => {
    const newTestimonial: InternshipTestimonialForm = {
      id: `temp-${Date.now()}`,
      name: '',
      degree: '',
      institution: '',
      quote: '',
      fullText: '',
      publishedDate: new Date().toISOString().split('T')[0],
      year: new Date().getFullYear().toString(),
      images: [],
    };
    setEditingTestimonial(newTestimonial);
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial: InternshipTestimonial) => {
    setEditingTestimonial({ ...testimonial });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete({
      itemName: 'testimonial',
      title: 'Delete Testimonial',
      message: 'Are you sure you want to delete this testimonial? This action cannot be undone.'
    });
    
    if (!confirmed) return;

    try {
      if (!id.startsWith('temp-') && !id.match(/^\\d{13}$/)) {
        // Find the testimonial to get its image URLs for storage cleanup
        const testimonialToDelete = pagination.data.find(t => t.id === id);
        if (testimonialToDelete && testimonialToDelete.images && testimonialToDelete.images.length > 0) {
          for (const imgUrl of testimonialToDelete.images) {
            await deleteStorageFile(imgUrl, 'testimonials');
          }
        }
        await deleteTestimonialFromDb(id);
      }
      
      // Invalidate cache
      invalidateTestimonialsCache();
      
      await pagination.refresh();
      toast.success('Testimonial deleted successfully!');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial.');
    }
  };

  const handleSave = async () => {
    if (!editingTestimonial || isSaving) return;

     const validation = mergeValidationResults(
       validateRequiredTrimmed(editingTestimonial.name, 'Name'),
       validateNoDigits(editingTestimonial.name, 'Name'),
       validateMaxChars(
         editingTestimonial.name.trim(),
         AdminValidationRules.nameMaxChars,
         'Name'
       ),
       validateMaxWords(
         editingTestimonial.name.trim(),
         AdminValidationRules.nameMaxWords,
         'Name'
       ),
       validateRequiredTrimmed(editingTestimonial.degree, 'Degree'),
       validateMaxChars(
         editingTestimonial.degree.trim(),
         AdminValidationRules.shortTitleMaxChars,
         'Degree'
       ),
       validateMaxWords(
         editingTestimonial.degree.trim(),
         AdminValidationRules.shortTitleMaxWords,
         'Degree'
       ),
       validateRequiredTrimmed(editingTestimonial.institution, 'Institution'),
       validateMaxChars(
         editingTestimonial.institution.trim(),
         AdminValidationRules.shortTitleMaxChars,
         'Institution'
       ),
       validateMaxWords(
         editingTestimonial.institution.trim(),
         AdminValidationRules.shortTitleMaxWords,
         'Institution'
       ),
       validateRequiredTrimmed(editingTestimonial.quote, 'Quote/Short testimonial'),
       validateMaxChars(
         editingTestimonial.quote.trim(),
         AdminValidationRules.shortTextMaxChars,
         'Quote/Short testimonial'
       ),
       validateMaxWords(
         editingTestimonial.quote.trim(),
         AdminValidationRules.shortTextMaxWords,
         'Quote/Short testimonial'
       ),
       validateMaxChars(
         (editingTestimonial.fullText || '').trim(),
         AdminValidationRules.contentMaxChars,
         'Full testimonial'
       ),
       validateRequiredTrimmed(editingTestimonial.year, 'Year'),
       validateMaxChars(editingTestimonial.year.trim(), 4, 'Year')
     );
     if (!validation.isValid) {
       toast.error(validation.error || 'Validation failed');
       return;
     }
    
    setIsSaving(true);
    try {
      // Handle image uploads before saving to database
      let finalImages = editingTestimonial.images || [];
      if (editingTestimonial.images && editingTestimonial.images.some(img => typeof img === 'object')) {
        const filesToUpload = editingTestimonial.images.filter(img => typeof img === 'object') as File[];
        const uploadedUrls = await uploadImages(filesToUpload, 'testimonials');
        let uploadIdx = 0;
        finalImages = editingTestimonial.images.map(img => {
          if (typeof img === 'object') {
            return uploadedUrls[uploadIdx++];
          }
          return img as string;
        });
      }

      const testimonialData = {
        name: editingTestimonial.name,
        degree: editingTestimonial.degree,
        institution: editingTestimonial.institution,
        quote: editingTestimonial.quote,
        full_text: editingTestimonial.fullText,
        published_date: editingTestimonial.publishedDate,
        year: editingTestimonial.year,
        images: (finalImages as string[]) || null,
      };

      if (editingTestimonial.id && !editingTestimonial.id.startsWith('temp-') && !editingTestimonial.id.match(/^\\d{13}$/)) {
        await updateTestimonialInDb(editingTestimonial.id, testimonialData);
        toast.success('Testimonial updated!');
      } else {
        await createInternshipTestimonial(testimonialData);
        toast.success('Testimonial created!');
      }

      // Invalidate cache
      invalidateTestimonialsCache();

      await pagination.refresh();
      setIsModalOpen(false);
      setEditingTestimonial(null);
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Failed to save testimonial. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Internship Testimonials</h3>
        <Button onClick={addTestimonial} size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Testimonial
        </Button>
      </div>

      {/* Loading State */}
      {pagination.loading && pagination.data.length === 0 && (
        <AdminPageSkeleton message="Loading internship testimonials..." />
      )}

      {/* Empty State */}
      {!pagination.loading && pagination.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No testimonials yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Testimonial" to create your first testimonial</p>
        </div>
      )}

      {/* Testimonials Grid */}
      {pagination.data.length > 0 && (
        <>
          {/* Show loading skeleton during pagination */}
          {pagination.loading ? (
            <AdminPageSkeleton message="Loading internship testimonials..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagination.data.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="cursor-pointer relative group"
                onClick={() => handleEdit(testimonial)}
              >
                <div className="absolute top-2 left-2 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/90 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(testimonial.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                {testimonial.images && testimonial.images.length > 0 ? (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={testimonial.images[0]}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-purple-50 to-purple-100 rounded-t-lg flex items-center justify-center">
                    <User className="w-16 h-16 text-purple-400" />
                  </div>
                )}

                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-1">
                    {testimonial.name || 'Unnamed'}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">
                    {testimonial.degree || 'No degree'} - {testimonial.institution || 'No institution'}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-3 italic">
                    "{testimonial.quote}"
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

      {/* Testimonial Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Testimonial
            </DialogTitle>
            <DialogDescription>
              {editingTestimonial?.id?.startsWith('temp-')
                ? 'Create a new internship testimonial'
                : 'Update the details for this testimonial'}
            </DialogDescription>
          </DialogHeader>
          
          {editingTestimonial && (
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-1">
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="testimonial-name">Name *</Label>
                  <Input
                    id="testimonial-name"
                    value={editingTestimonial.name}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, name: e.target.value })
                    }
                    placeholder="Enter intern's name"
                  />
                </div>

                <div>
                  <Label htmlFor="testimonial-degree">Degree *</Label>
                  <Input
                    id="testimonial-degree"
                    value={editingTestimonial.degree}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, degree: e.target.value })
                    }
                    placeholder="e.g., Bachelor of Science in Agriculture"
                  />
                </div>

                <div>
                  <Label htmlFor="testimonial-institution">Institution *</Label>
                  <Input
                    id="testimonial-institution"
                    value={editingTestimonial.institution}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, institution: e.target.value })
                    }
                    placeholder="e.g., University of the Philippines"
                  />
                </div>

                <VisualRichEditor
                  id="testimonial-quote"
                  label="Quote/Short Testimonial *"
                  value={editingTestimonial.quote}
                  onChange={(value: string) =>
                    setEditingTestimonial({ ...editingTestimonial, quote: value })
                  }
                  rows={3}
                  placeholder="Enter a short quote or testimonial..."
                  required
                />

                <VisualRichEditor
                  id="testimonial-fulltext"
                  label="Full Testimonial"
                  value={editingTestimonial.fullText || ''}
                  onChange={(value: string) =>
                    setEditingTestimonial({ ...editingTestimonial, fullText: value })
                  }
                  rows={6}
                  placeholder="Enter the full testimonial text..."
                />

                <div>
                  <Label htmlFor="testimonial-year">Year *</Label>
                  <Input
                    id="testimonial-year"
                    value={editingTestimonial.year}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, year: e.target.value })
                    }
                    placeholder="e.g., 2024"
                  />
                </div>

                <div>
                  <Label htmlFor="testimonial-date">Published Date</Label>
                  <Input
                    id="testimonial-date"
                    type="date"
                    value={editingTestimonial.publishedDate}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, publishedDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Gallery Images (Drag & Drop)</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload images for the gallery
                  </p>
                  <MultiImageDropzone
                    images={editingTestimonial.images || []}
                    onChange={(images) => {
                      setEditingTestimonial({
                        ...editingTestimonial,
                        images
                      });
                    }}
                    label="Testimonial Images"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingTestimonial(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb]"
                    disabled={isSaving}
                    onClick={handleSave}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Testimonial'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </div>
  );
};