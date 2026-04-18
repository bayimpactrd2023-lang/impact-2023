import React, { useState } from 'react';
import { Partner, PartnerForm } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Plus, Trash2, Edit, X, CheckCircle, Handshake, Building2 } from 'lucide-react';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { useServerPagination } from '@/hooks/useServerPagination';
import { EntityValidator, hasChanges } from '@/app/components/admin/utils/adminHelpers';
import {
  createPartner,
  updatePartner as updatePartnerInDb,
  deletePartner as deletePartnerFromDb,
  getPartnersPaginated,
} from '@/services/supabaseService';
import { uploadImage, deleteStorageFile } from '@/utils/storageUpload';
import { PaginationControls } from '@/app/components/admin/PaginationControls';
import { AdminPageSkeleton } from '@/app/components/admin/SkeletonLoaders';
import { invalidatePartnersCache } from '@/utils/cacheInvalidation';

interface PartnersManagerProps {
  partners: Partner[];
  onUpdate: (partners: Partner[]) => void;
  refreshContent?: () => Promise<void>;
}

export const PartnersManager: React.FC<PartnersManagerProps> = ({ partners: _partners, onUpdate: _onUpdate, refreshContent: _refreshContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { confirmDelete, DeleteConfirmDialog } = useDeleteConfirmation();

  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<Partner>({
    fetchFunction: getPartnersPaginated,
    itemsPerPage: 6,
  });

  const addPartner = () => {
    const newPartner: PartnerForm = {
      id: `temp-${Date.now()}`,
      name: '',
      logoUrl: '',
    };
    setEditingPartner(newPartner);
    setIsModalOpen(true);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner({ ...partner } as PartnerForm);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete({
      itemName: 'partner',
      title: 'Delete Partner',
      message: 'Are you sure you want to delete this partner? This action cannot be undone.'
    });
    
    if (!confirmed) return;

    try {
      if (!id.startsWith('temp-') && !id.match(/^\d{13}$/)) {
        // Find the partner to get its logo URL for storage cleanup
        const partnerToDelete = pagination.data.find(p => p.id === id);
        if (partnerToDelete?.logoUrl) {
          await deleteStorageFile(partnerToDelete.logoUrl, 'partners');
        }
        await deletePartnerFromDb(id);
      }
      
      // Invalidate cache
      invalidatePartnersCache();
      
      await pagination.refresh();
      toast.success('Partner deleted successfully!');
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Failed to delete partner.');
    }
  };

  const handleSave = async () => {
    if (!editingPartner || isSaving) return;

    const validation = EntityValidator.validatePartner(editingPartner);
    if (!validation.isValid) {
      toast.error(validation.error || 'Validation failed');
      return;
    }
    
    setIsSaving(true);
    try {
      // Handle Image Upload before saving to database
      let finalLogoUrl = editingPartner.logoUrl;
      const originalPartner = pagination.data.find(p => p.id === editingPartner.id);

      if (typeof finalLogoUrl === 'object' && finalLogoUrl instanceof File) {
        finalLogoUrl = await uploadImage(finalLogoUrl, 'partners');
        // Delete old logo if it was replaced
        if (originalPartner?.logoUrl && originalPartner.logoUrl !== finalLogoUrl) {
          await deleteStorageFile(originalPartner.logoUrl, 'partners');
        }
      } else if (!finalLogoUrl && originalPartner?.logoUrl) {
        // Logo was removed
        await deleteStorageFile(originalPartner.logoUrl, 'partners');
      }

      const partnerData = {
        name: editingPartner.name,
        logo_url: (finalLogoUrl as string) || '',
      };

      if (editingPartner.id && !editingPartner.id.startsWith('temp-') && !editingPartner.id.match(/^\d{13}$/)) {
        const originalPartner = pagination.data.find(p => p.id === editingPartner.id);
        if (originalPartner && !hasChanges(originalPartner, editingPartner)) {
          toast.info('No changes detected.');
          setIsModalOpen(false);
          setEditingPartner(null);
          return;
        }
        await updatePartnerInDb(editingPartner.id, partnerData);
        toast.success('Partner updated!');
      } else {
        await createPartner(partnerData);
        toast.success('Partner created!');
      }

      // Invalidate cache
      invalidatePartnersCache();

      await pagination.refresh();
      setIsModalOpen(false);
      setEditingPartner(null);
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('Failed to save partner. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
            <Handshake className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">Manage Partners</h3>
            <p className="text-xs text-gray-500 font-medium">Showcase your collaborators</p>
          </div>
        </div>
        <Button 
          onClick={addPartner} 
          size="sm"
          className="w-full sm:w-auto bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md h-10 sm:h-9 px-4 font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Partner
        </Button>
      </div>

      {/* Loading State */}
      {pagination.loading && pagination.data.length === 0 && (
        <AdminPageSkeleton message="Loading partners..." />
      )}

      {/* Empty State */}
      {!pagination.loading && pagination.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <Handshake className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No partners yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Partner" to create your first partner</p>
        </div>
      )}

      {/* Partners Grid */}
      {pagination.data.length > 0 && (
        <>
          {/* Show loading skeleton during pagination */}
          {pagination.loading ? (
            <AdminPageSkeleton message="Loading partners..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagination.data.map((partner) => (
              <Card
                key={partner.id}
                className="cursor-pointer relative group overflow-hidden border-gray-100/50 hover:border-blue-200/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 rounded-3xl"
                onClick={() => handleEdit(partner)}
              >
                {/* Delete Button */}
                <div className="absolute top-4 right-4 z-20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 bg-white/90 backdrop-blur-md shadow-md hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all border border-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(partner.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="p-6">
                  {/* Logo Container - Boxed with theme shadow */}
                  <div className="relative mx-auto w-full aspect-square max-w-[160px] mb-4 group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#1887FC] to-[#3b82f6] rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity" />
                    <div className="relative w-full h-full rounded-2xl p-4 bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                      {partner.logoUrl ? (
                        <img
                          src={partner.logoUrl}
                          alt={partner.name}
                          className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-[#1887FC]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-center">
                    <h4 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-[#1887FC] transition-colors">
                      {partner.name || 'Unnamed Partner'}
                    </h4>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Edit className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors">Click to edit</span>
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

      {/* Partner Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
                <Handshake className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                  {editingPartner?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Partner
                </DialogTitle>
                <DialogDescription className="text-base text-gray-500 mt-0.5 font-medium">
                  {editingPartner?.id?.startsWith('temp-')
                    ? 'Create a new partner entry'
                    : 'Update the details for this partner'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {editingPartner && (
            <div
              className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide"
            >
              <div className="space-y-8 py-6">
                <div>
                  <Label htmlFor="partner-name" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    Partner Name <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="partner-name"
                    value={editingPartner.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setEditingPartner(prev => prev ? { ...prev, name: newName } : null);
                    }}
                    placeholder="Enter partner name"
                    className="text-lg font-semibold"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1">Logo (Drag & Drop)</Label>
                  <p className="text-xs text-gray-500 mb-3">Upload a high-quality logo for this partner</p>
                  <ImageDropzone
                    value={editingPartner.logoUrl || ''}
                    onChange={(url) =>
                      setEditingPartner(prev => prev ? { ...prev, logoUrl: url } : null)
                    }
                    label="Partner Logo"
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
                setEditingPartner(null);
              }}
            >
              <X className="w-5 h-4 mr-2" /> Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:shadow-lg hover:shadow-blue-500/25 text-white transition-all transform hover:-translate-y-0.5"
              disabled={isSaving}
              onClick={handleSave}
            >
              <CheckCircle className="w-5 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Partner'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </div>
  );
};
