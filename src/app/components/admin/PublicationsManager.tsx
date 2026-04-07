import React, { useState } from 'react';
import { Publication, PublicationForm } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Plus, Trash2, Edit, X, CheckCircle, FileText, Star } from 'lucide-react';
import { Switch } from '@/app/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { PDFDropzone } from '@/app/components/PDFDropzone';
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { useServerPagination } from '@/hooks/useServerPagination';
import { EntityValidator } from '@/app/components/admin/utils/adminHelpers';
import {
  createPublication,
  updatePublication as updatePublicationInDb,
  deletePublication as deletePublicationFromDb,
  getPublicationsPaginated,
  getAllPublications,
} from '@/services/supabaseService';
import { uploadImage, deleteStorageFile } from '@/utils/storageUpload';
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
  
  // Initialize delete confirmation hook
  const { confirmDelete, DeleteConfirmDialog } = useDeleteConfirmation();

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
      if (!id.startsWith('temp-') && !id.match(/^\\d{13}$/)) {
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
      if (typeof finalPdfUrl === 'object' && (finalPdfUrl as any) instanceof File) {
        finalPdfUrl = await uploadImage(finalPdfUrl as any, 'publications');
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
      
      if (editingPublication.id && !editingPublication.id.startsWith('temp-') && !editingPublication.id.match(/^\\d{13}$/)) {
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
          <Button onClick={handleShowFeatured} variant="outline" size="sm">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingPublication?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Publication
            </DialogTitle>
            <DialogDescription>
              {editingPublication?.id?.startsWith('temp-')
                ? 'Create a new publication entry'
                : 'Update the details for this publication'}
            </DialogDescription>
          </DialogHeader>

          {editingPublication && (
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-1">
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="pub-title">Title *</Label>
                  <Input
                    id="pub-title"
                    value={editingPublication.title}
                    onChange={(e) =>
                      setEditingPublication({ ...editingPublication, title: e.target.value })
                    }
                    placeholder="Enter publication title"
                  />
                </div>

                <div>
                  <Label htmlFor="pub-authors">Authors *</Label>
                  <Input
                    id="pub-authors"
                    value={editingPublication.authors}
                    onChange={(e) =>
                      setEditingPublication({ ...editingPublication, authors: e.target.value })
                    }
                    placeholder="e.g., John Doe, Jane Smith"
                  />
                </div>

                <div>
                  <Label htmlFor="pub-content">Abstract/Description</Label>
                  <Textarea
                    id="pub-content"
                    value={editingPublication.content || ''}
                    onChange={(e) =>
                      setEditingPublication({ ...editingPublication, content: e.target.value })
                    }
                    rows={4}
                    placeholder="Enter publication abstract or description"
                  />
                </div>

                <div>
                  <Label htmlFor="pub-link">External Link</Label>
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
                  <Label>PDF File</Label>
                  <PDFDropzone
                    value={editingPublication.pdfUrl || ''}
                    onChange={(url) =>
                      setEditingPublication({ ...editingPublication, pdfUrl: url })
                    }
                    label="Drop PDF file here"
                  />
                </div>

                {editingPublication.pdfUrl && (
                  <div>
                    <Label htmlFor="pdf-access-type">PDF Access Type</Label>
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
                    <p className="text-xs text-gray-500 mt-1">
                      Choose whether users can download the PDF or only view it
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="pub-date">Published Date</Label>
                  <Input
                    id="pub-date"
                    type="date"
                    value={editingPublication.publishedDate || ''}
                    onChange={(e) =>
                      setEditingPublication({ ...editingPublication, publishedDate: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="pub-featured"
                    checked={editingPublication.featured || false}
                    onCheckedChange={(checked) =>
                      setEditingPublication({ ...editingPublication, featured: checked })
                    }
                  />
                  <Label htmlFor="pub-featured" className="cursor-pointer">
                    Featured Publication
                  </Label>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingPublication(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb]"
                    disabled={isSaving}
                    onClick={handleSavePublication}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Publication'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Featured Publications Modal */}
      <Dialog open={isFeaturedModalOpen} onOpenChange={setIsFeaturedModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#1887FC]" />
              Featured Publications
            </DialogTitle>
            <DialogDescription>
              Toggle featured status for publications. Maximum of 3 featured items allowed. Changes are saved immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-1">
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
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{pub.title}</h4>
                        <p className="text-xs text-gray-500">{pub.authors}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Featured</span>
                        <Switch
                          checked={pub.featured || false}
                          onCheckedChange={() => toggleFeatured(pub.id, pub.featured || false)}
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