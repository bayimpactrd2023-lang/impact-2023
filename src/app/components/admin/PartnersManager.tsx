import React, { useState } from 'react';
import { Partner, PartnerForm } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Plus, Trash2, Edit, X, CheckCircle, Handshake, Building2 } from 'lucide-react';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { useServerPagination } from '@/hooks/useServerPagination';
import { EntityValidator } from '@/app/components/admin/utils/adminHelpers';
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
      if (!id.startsWith('temp-') && !id.match(/^\\d{13}$/)) {
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
      if (typeof finalLogoUrl === 'object' && finalLogoUrl instanceof File) {
        finalLogoUrl = await uploadImage(finalLogoUrl, 'partners');
      }

      const partnerData = {
        name: editingPartner.name,
        logo_url: (finalLogoUrl as string) || '',
      };

      if (editingPartner.id && !editingPartner.id.startsWith('temp-') && !editingPartner.id.match(/^\\d{13}$/)) {
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Partners</h3>
        <Button onClick={addPartner} size="sm">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagination.data.map((partner) => (
              <Card
                key={partner.id}
                className="cursor-pointer hover:shadow-lg transition-shadow relative group"
                onClick={() => handleEdit(partner)}
              >
                <div className="absolute top-2 left-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(partner.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                {partner.logoUrl ? (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg bg-white p-4 flex items-center justify-center">
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm text-center">
                    {partner.name || 'Unnamed Partner'}
                  </h4>
                  <div className="mt-3 flex items-center justify-center gap-2">
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

      {/* Partner Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPartner?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Partner
            </DialogTitle>
            <DialogDescription>
              {editingPartner?.id?.startsWith('temp-')
                ? 'Create a new partner entry'
                : 'Update the details for this partner'}
            </DialogDescription>
          </DialogHeader>

          {editingPartner && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="partner-name">Partner Name *</Label>
                <Input
                  id="partner-name"
                  value={editingPartner.name}
                  onChange={(e) =>
                    setEditingPartner({ ...editingPartner, name: e.target.value })
                  }
                  placeholder="Enter partner name"
                />
              </div>

              <div>
                <Label>Logo</Label>
                <ImageDropzone
                  value={editingPartner.logoUrl || ''}
                  onChange={(url) =>
                    setEditingPartner({ ...editingPartner, logoUrl: url })
                  }
                  label="Partner Logo"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPartner(null);
                  }}
                >
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb]"
                  disabled={isSaving}
                  onClick={handleSave}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Partner'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </div>
  );
};