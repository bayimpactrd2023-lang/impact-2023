import React, { useState } from 'react';
import { InternshipTestimonial, InternshipTestimonialForm } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { VisualRichEditor } from './VisualRichEditor';
import { SharedToolbar } from './SharedToolbar';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Plus, Trash2, Edit, CheckCircle, X, MessageSquare, User, Quote } from 'lucide-react';
import { MultiImageDropzone } from '@/app/components/MultiImageDropzone';
import { RichTextContent } from '@/app/components/RichTextContent';
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
  hasChanges
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
  const [activeField, setActiveField] = useState<string | null>(null);

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
      if (!id.startsWith('temp-') && !id.match(/^\d{13}$/)) {
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
      const originalTestimonial = pagination.data.find(t => t.id === editingTestimonial.id);
      const originalImages = originalTestimonial?.images || [];

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

      // Cleanup gallery images that were removed from the array
      const currentGalleryUrls = finalImages.filter(img => typeof img === 'string') as string[];
      for (const oldImg of originalImages) {
        if (!currentGalleryUrls.includes(oldImg)) {
          await deleteStorageFile(oldImg, 'testimonials');
        }
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

      if (editingTestimonial.id && !editingTestimonial.id.startsWith('temp-') && !editingTestimonial.id.match(/^\d{13}$/)) {
        const originalTestimonial = pagination.data.find(t => t.id === editingTestimonial.id);
        if (originalTestimonial && !hasChanges(originalTestimonial, editingTestimonial)) {
          toast.info('No changes detected.');
          setIsModalOpen(false);
          setEditingTestimonial(null);
          return;
        }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
            <Quote className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">Internship Testimonials</h3>
            <p className="text-xs text-gray-500 font-medium">Manage student success stories</p>
          </div>
        </div>
        <Button 
          onClick={addTestimonial} 
          size="sm"
          className="w-full sm:w-auto bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md h-10 sm:h-9 px-4 font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagination.data.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="cursor-pointer relative group overflow-hidden border-gray-100/50 hover:border-blue-200/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 rounded-3xl"
                onClick={() => handleEdit(testimonial)}
              >
                {/* Delete Button */}
                <div className="absolute top-4 right-4 z-20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 bg-white/90 backdrop-blur-md shadow-md hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all border border-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(testimonial.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="p-6 pb-4">
                  {/* Image Container - Circular and centered */}
                  <div className="relative mx-auto w-32 h-32 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#1887FC] to-[#3b82f6] rounded-full animate-pulse opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-[#1887FC] to-[#3b82f6] shadow-lg shadow-blue-500/20">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white border-4 border-white">
                        {testimonial.images && testimonial.images.length > 0 ? (
                          <img
                            src={testimonial.images[0]}
                            alt={testimonial.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                            <User className="w-12 h-12 text-[#1887FC]" />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Quote Icon Badge */}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">
                      <Quote className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>

                  <div className="space-y-1 text-center">
                    <h4 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-[#1887FC] transition-colors">
                      {testimonial.name || 'Unnamed'}
                    </h4>
                    <p className="text-sm font-semibold text-[#1887FC] line-clamp-1">
                      {testimonial.degree || 'No degree'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      {testimonial.institution || 'No institution'}
                    </p>
                    <div className="relative pt-2">
                      <div className="text-xs text-gray-500 line-clamp-3 italic leading-relaxed">
                        <RichTextContent text={testimonial.quote} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Edit className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors">Click to edit</span>
                    </div>
                    <div className="text-[10px] font-black text-gray-300">
                      CLASS OF {testimonial.year}
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

      {/* Testimonial Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                  {editingTestimonial?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Testimonial
                </DialogTitle>
                <DialogDescription className="text-base text-gray-500 mt-0.5 font-medium">
                  {editingTestimonial?.id?.startsWith('temp-')
                    ? 'Create a new internship testimonial'
                    : 'Update the details for this testimonial'}
                </DialogDescription>
              </div>
            </div>
            <div className="pt-2">
              <SharedToolbar 
                onCommand={(cmd: string, val: any = '') => {
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
                }} 
              />
            </div>
          </DialogHeader>
          
          {editingTestimonial && (
            <div
              className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide"
            >
              <div className="space-y-8 py-6">
                <div>
                  <Label htmlFor="testimonial-name" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    Name <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="testimonial-name"
                    value={editingTestimonial.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setEditingTestimonial(prev => prev ? { ...prev, name: newName } : null);
                    }}
                    placeholder="Enter intern's name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="testimonial-degree" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      Degree <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      id="testimonial-degree"
                      value={editingTestimonial.degree}
                      onChange={(e) => {
                        const newDegree = e.target.value;
                        setEditingTestimonial(prev => prev ? { ...prev, degree: newDegree } : null);
                      }}
                      placeholder="e.g., Bachelor of Science in Agriculture"
                    />
                  </div>

                  <div>
                    <Label htmlFor="testimonial-institution" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      Institution <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      id="testimonial-institution"
                      value={editingTestimonial.institution}
                      onChange={(e) => {
                        const newInstitution = e.target.value;
                        setEditingTestimonial(prev => prev ? { ...prev, institution: newInstitution } : null);
                      }}
                      placeholder="e.g., University of the Philippines"
                    />
                  </div>
                </div>

                <VisualRichEditor
                  id="testimonial-quote"
                  label="Quote/Short Testimonial"
                  value={editingTestimonial.quote}
                  onChange={(value: string) =>
                    setEditingTestimonial(prev => prev ? { ...prev, quote: value } : null)
                  }
                  rows={3}
                  placeholder="Enter a short quote or testimonial..."
                  required
                  showToolbar={false}
                  onCommand={(cmd) => {
                    if (cmd === 'focus') {
                      setActiveField('testimonial-quote');
                    }
                  }}
                />

                <VisualRichEditor
                  id="testimonial-fulltext"
                  label="Full Testimonial"
                  value={editingTestimonial.fullText || ''}
                  onChange={(value: string) =>
                    setEditingTestimonial(prev => prev ? { ...prev, fullText: value } : null)
                  }
                  rows={6}
                  placeholder="Enter the full testimonial text..."
                  showToolbar={false}
                  onCommand={(cmd) => {
                    if (cmd === 'focus') {
                      setActiveField('testimonial-fulltext');
                    }
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="testimonial-year" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      Year <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      id="testimonial-year"
                      value={editingTestimonial.year}
                      onChange={(e) => {
                        const newYear = e.target.value;
                        setEditingTestimonial(prev => prev ? { ...prev, year: newYear } : null);
                      }}
                      placeholder="e.g., 2024"
                    />
                  </div>

                  <div>
                    <Label htmlFor="testimonial-date" className="text-sm font-semibold text-gray-700 mb-1">Published Date</Label>
                    <Input
                      id="testimonial-date"
                      type="date"
                      value={editingTestimonial.publishedDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setEditingTestimonial(prev => prev ? { ...prev, publishedDate: newDate } : null);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1">Gallery Images (Drag & Drop)</Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload images for the gallery
                  </p>
                  <MultiImageDropzone
                    images={editingTestimonial.images || []}
                    onChange={(images) => {
                      setEditingTestimonial(prev => prev ? { ...prev, images } : null);
                    }}
                    label="Testimonial Images"
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
                setEditingTestimonial(null);
              }}
            >
              <X className="w-5 h-4 mr-2" /> Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:shadow-lg hover:shadow-blue-500/25 text-white transition-all transform hover:-translate-y-0.5"
              disabled={isSaving}
              onClick={handleSave}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Testimonial'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </div>
  );
};
