import React, { useState } from 'react';
import { Publication, PublicationForm } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { VisualRichEditor } from './VisualRichEditor';
import { SharedToolbar } from './SharedToolbar';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Plus, Trash2, Edit, X, CheckCircle, FileText, Star } from 'lucide-react';
import { Switch } from '@/app/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { PDFDropzone } from '@/app/components/PDFDropzone';
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { useConfirm } from '@/shared/hooks';
import { useServerPagination } from '@/hooks/useServerPagination';
import { EntityValidator } from '@/app/components/admin/utils/adminHelpers';
import {
  createPublication,
  updatePublication as updatePublicationInDb,
  deletePublication as deletePublicationFromDb,
  getPublicationsPaginated,
  getAllPublications,
} from '@/services/supabaseService';
import { uploadPDF, deleteStorageFile } from '@/utils/storageUpload';
import { PaginationControls } from '@/app/components/admin/PaginationControls';
import { AdminPageSkeleton } from '@/app/components/admin/SkeletonLoaders';
import { invalidatePublicationsCache } from '@/utils/cacheInvalidation';

interface PublicationsManagerProps {
  publications: Publication[];
  onUpdate: (publications: Publication[]) => void;
  refreshContent?: () => Promise<void>;
}

export const PublicationsManager: React.FC<PublicationsManagerProps> = ({ publications: _publications, onUpdate: _onUpdate, refreshContent }) => {
  const [editingPublication, setEditingPublication] = useState<PublicationForm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
  const [featuredPublications, setFeaturedPublications] = useState<Publication[]>([]);
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
  
  // Initialize delete confirmation hook
  const { confirmDelete, DeleteConfirmDialog } = useDeleteConfirmation();
  const { showConfirm, ConfirmDialog: ConfirmUnfeatureDialog } = useConfirm();

  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<Publication>({
    fetchFunction: getPublicationsPaginated,
    itemsPerPage: 6,
  });

  const addPublication = () => {
    const newPub: PublicationForm = {
      id: `temp-${Date.now()}`,
      title: '',
      authors: '',
      link: '',
      featured: false,
      pdfUrl: '',
      content: '',
      publishedDate: new Date().toISOString().split('T')[0],
      pdfAccessType: 'download',
    };
    setEditingPublication(newPub);
    setIsModalOpen(true);
  };

  const handleEdit = (pub: Publication) => {
    setEditingPublication({ ...pub } as PublicationForm);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete({
      itemName: 'publication',
      title: 'Delete Publication',
      message: 'Are you sure you want to delete this publication? This action cannot be undone.'
    });
    
    if (!confirmed) return;

    try {
      if (!id.startsWith('temp-') && !id.match(/^\d{13}$/)) {
        // Find the publication to get its PDF URL for storage cleanup
        const pubToDelete = pagination.data.find(p => p.id === id);
        if (pubToDelete?.pdfUrl) {
          await deleteStorageFile(pubToDelete.pdfUrl, 'pdfs');
        }
        await deletePublicationFromDb(id);
      }
      
      // Invalidate cache
      invalidatePublicationsCache();
      
      await pagination.refresh();
      toast.success('Publication deleted successfully!');
    } catch (error) {
      console.error('Error deleting publication:', error);
      toast.error('Failed to delete publication.');
    }
  };

  const handleSavePublication = async () => {
    if (!editingPublication) return;

    const validation = EntityValidator.validatePublication(editingPublication);
    if (!validation.isValid) {
      toast.error(validation.error || 'Validation failed');
      return;
    }
    
    // Validation: Check featured items limit (max 3)
    if (editingPublication.featured) {
      const allPublications = await getAllPublications();
      const currentFeatured = allPublications.filter((p: any) => 
        p.featured === true && p.id !== editingPublication.id
      );
      
      if (currentFeatured.length >= 3) {
        toast.error('Maximum 3 featured publications allowed. Please unselect an existing featured item first.');
        setFeaturedPublications(currentFeatured);
        setIsFeaturedModalOpen(true);
        return;
      }
    }
    
    setIsSaving(true);
    try {
      // Handle PDF Upload before saving to database
      let finalPdfUrl = editingPublication.pdfUrl;
      if (finalPdfUrl instanceof File) {
        finalPdfUrl = await uploadPDF(finalPdfUrl, 'publications');
      }

      const pubData = {
        title: editingPublication.title,
        authors: editingPublication.authors,
        link: editingPublication.link,
        featured: editingPublication.featured || false,
        pdf_url: (finalPdfUrl as string) || null,
        content: editingPublication.content || null,
        published_date: editingPublication.publishedDate || null,
        pdf_access_type: editingPublication.pdfAccessType || 'download',
      };
      
      if (editingPublication.id && !editingPublication.id.startsWith('temp-') && !editingPublication.id.match(/^\d{13}$/)) {
        await updatePublicationInDb(editingPublication.id, pubData);
        toast.success('Publication updated!');
      } else {
        await createPublication(pubData);
        toast.success('Publication created!');
      }
      
      // Invalidate cache
      invalidatePublicationsCache();
      
      await pagination.refresh();
      setIsModalOpen(false);
      setEditingPublication(null);
    } catch (error) {
      console.error('Error saving publication:', error);
      toast.error('Failed to save publication. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const loadFeaturedPublications = async () => {
    setLoadingFeatured(true);
    try {
      const allPublications = await getAllPublications();
      const featured = allPublications.filter((p: any) => p.featured === true);
      setFeaturedPublications(featured);
    } catch (error) {
      console.error('Error loading featured publications:', error);
      toast.error('Failed to load featured publications.');
    } finally {
      setLoadingFeatured(false);
    }
  };

  const handleShowFeatured = async () => {
    await loadFeaturedPublications();
    setIsFeaturedModalOpen(true);
  };

  const toggleFeatured = async (id: string, currentFeaturedStatus: boolean) => {
    // If currently featured and trying to un-feature, show confirmation
    if (currentFeaturedStatus) {
      const confirmed = await showConfirm({
        title: 'Remove from Featured?',
        message: 'Are you sure you want to remove this publication from the featured list? This will remove it from the home page highlights section.',
        confirmText: 'Remove',
        cancelText: 'Keep Featured',
        variant: 'danger'
      });
      
      if (!confirmed) return;
    }

    try {
      await updatePublicationInDb(id, { featured: !currentFeaturedStatus });
      
      setFeaturedPublications(prev => 
        prev.map(p => p.id === id ? { ...p, featured: !currentFeaturedStatus } : p)
          .filter(p => p.featured === true)
      );
      
      await pagination.refresh();
      
      // Refresh content context for home page
      if (refreshContent) {
        await refreshContent();
      }
      
      toast.success(`Publication ${!currentFeaturedStatus ? 'featured' : 'unfeatured'}!`);
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Publications</h3>
        <div className="flex gap-2">
          <Button onClick={handleShowFeatured} variant="default" size="sm" className="bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md">
            <Star className="w-4 h-4 mr-2" /> Show All Featured
          </Button>
          <Button onClick={addPublication} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Publication
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {pagination.loading && pagination.data.length === 0 && (
        <AdminPageSkeleton message="Loading publications..." />
      )}

      {/* Empty State */}
      {!pagination.loading && pagination.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <FileText className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No publications yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Publication" to create your first publication</p>
        </div>
      )}

      {/* Publications Grid */}
      {pagination.data.length > 0 && (
        <>
          {/* Show loading skeleton during pagination */}
          {pagination.loading ? (
            <AdminPageSkeleton message="Loading publications..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagination.data.map((pub) => (
                <Card
                  key={pub.id}
                  className="cursor-pointer relative group"
                  onClick={() => handleEdit(pub)}
                >
                  {pub.featured && (
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
                        handleDelete(pub.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-lg flex items-center justify-center">
                    <FileText className="w-16 h-16 text-blue-400" />
                  </div>

                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm line-clamp-2 mb-2">
                      {pub.title || 'Untitled Publication'}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                      {pub.authors || 'No authors'}
                    </p>
                    {pub.publishedDate && (
                      <p className="text-xs text-gray-500">
                        {new Date(pub.publishedDate).toLocaleDateString()}
                      </p>
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

      {/* Publication Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                  {editingPublication?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Publication
                </DialogTitle>
                <DialogDescription className="text-base text-gray-500 mt-0.5 font-medium">
                  {editingPublication?.id?.startsWith('temp-')
                    ? 'Create a new publication entry'
                    : 'Update the details for this publication'}
                </DialogDescription>
              </div>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <SharedToolbar 
                onCommand={handleCommand} 
              />
              
              {editingPublication && (
                <button
                  type="button"
                  onClick={async () => {
                    const newStatus = !editingPublication.featured;
                    if (newStatus) {
                      const allPublications = await getAllPublications();
                      const currentFeatured = allPublications.filter((p: any) => 
                        p.featured === true && p.id !== editingPublication.id
                      );
                      
                      if (currentFeatured.length >= 3) {
                        toast.error('Maximum 3 featured publications allowed. Please unselect an existing featured item first.');
                        setFeaturedPublications(currentFeatured);
                        setIsFeaturedModalOpen(true);
                        return;
                      }
                    }
                    setEditingPublication({ ...editingPublication, featured: newStatus });
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 group ${
                    editingPublication.featured 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-white border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <Star className={`w-4 h-4 transition-transform group-hover:scale-110 ${editingPublication.featured ? 'fill-white' : 'fill-transparent'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {editingPublication.featured ? 'Featured' : 'Feature This'}
                  </span>
                </button>
              )}
            </div>
          </DialogHeader>

          {editingPublication && (
            <div
              className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide"
            >
              <div className="space-y-8 py-6">
                <div>
                  <Label htmlFor="pub-title" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    Title <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="pub-title"
                    value={editingPublication.title}
                    onChange={(e) =>
                      setEditingPublication({ ...editingPublication, title: e.target.value })
                    }
                    placeholder="Enter publication title"
                    className="text-lg font-semibold"
                  />
                </div>

                <div>
                  <Label htmlFor="pub-authors" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    Authors <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="pub-authors"
                    value={editingPublication.authors}
                    onChange={(e) =>
                      setEditingPublication({ ...editingPublication, authors: e.target.value })
                    }
                    placeholder="e.g., John Doe, Jane Smith"
                  />
                </div>

                <VisualRichEditor
                  id="pub-content"
                  label="Abstract/Description"
                  value={editingPublication.content || ''}
                  onChange={(value: string) =>
                    setEditingPublication({ ...editingPublication, content: value })
                  }
                  rows={4}
                  placeholder="Enter publication abstract or description"
                  showToolbar={false}
                  onCommand={(cmd) => {
                    if (cmd === 'focus') {
                      setActiveField('pub-content');
                    }
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="pub-link" className="text-sm font-semibold text-gray-700 mb-1">External Link</Label>
                    <Input
                      id="pub-link"
                      value={editingPublication.link || ''}
                      onChange={(e) =>
                        setEditingPublication({ ...editingPublication, link: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="pub-date" className="text-sm font-semibold text-gray-700 mb-1">Published Date</Label>
                    <Input
                      id="pub-date"
                      type="date"
                      value={editingPublication.publishedDate || ''}
                      onChange={(e) =>
                        setEditingPublication({ ...editingPublication, publishedDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1">PDF File (Drag & Drop)</Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload the PDF file for this publication (PDF only)
                  </p>
                  <PDFDropzone
                    value={editingPublication.pdfUrl}
                    onChange={(value) =>
                      setEditingPublication({ ...editingPublication, pdfUrl: value })
                    }
                    label="Drop PDF file here"
                  />
                </div>

                {editingPublication.pdfUrl && (
                  <div>
                    <Label htmlFor="pdf-access-type" className="text-sm font-semibold text-gray-700 mb-1">PDF Access Type</Label>
                    <Select
                      value={editingPublication.pdfAccessType || 'download'}
                      onValueChange={(value: 'view' | 'download') =>
                        setEditingPublication({ ...editingPublication, pdfAccessType: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select access type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="download">Downloadable - Users can view and download</SelectItem>
                        <SelectItem value="view">View Only - Users can only view</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      Choose whether users can download the PDF or only view it
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 p-6 border-t border-gray-100 shrink-0 bg-gray-50/80 backdrop-blur-sm rounded-b-2xl">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-white hover:border-gray-300 transition-all"
              onClick={() => {
                setIsModalOpen(false);
                setEditingPublication(null);
              }}
            >
              <X className="w-5 h-4 mr-2" /> Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:shadow-lg hover:shadow-blue-500/25 text-white transition-all transform hover:-translate-y-0.5"
              disabled={isSaving}
              onClick={handleSavePublication}
            >
              <CheckCircle className="w-5 h-5 mr-2" /> {isSaving ? 'Saving...' : 'Save Publication'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Featured Publications Modal */}
      <Dialog open={isFeaturedModalOpen} onOpenChange={setIsFeaturedModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">Featured Publications</DialogTitle>
                <DialogDescription className="text-base text-gray-500 mt-0.5 font-medium">
                  Toggle featured status for publications. Maximum of 3 featured items allowed. Changes are saved immediately.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div 
            className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide"
          >
            <div className="pt-4">
              {loadingFeatured ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#1887FC] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading featured publications...</p>
                  </div>
                </div>
              ) : featuredPublications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Star className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No featured publications yet</p>
                  <p className="text-xs text-gray-400 mt-1">Toggle the featured switch when editing a publication</p>
                </div>
              ) : (
                <>
                  {/* Featured count warning */}
                  {featuredPublications.length >= 3 && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> You have reached the maximum of 3 featured publications. To add a new featured item, please unselect one below.
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3 py-4">
                    {featuredPublications.map((pub) => (
                      <div
                        key={pub.id}
                        className="flex items-center gap-4 p-4 border rounded-2xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{pub.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-1">{pub.authors}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-end mr-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${pub.featured ? 'text-blue-600' : 'text-gray-400'}`}>
                              {pub.featured ? 'Featured' : 'Inactive'}
                            </span>
                          </div>
                          <Switch
                            checked={pub.featured || false}
                            onCheckedChange={() => toggleFeatured(pub.id, pub.featured || false)}
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
          
          <div className="flex justify-end p-6 border-t border-gray-100 shrink-0 bg-gray-50/80 backdrop-blur-sm rounded-b-2xl">
            <Button
              variant="outline"
              className="px-8 h-11 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-white transition-all"
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
