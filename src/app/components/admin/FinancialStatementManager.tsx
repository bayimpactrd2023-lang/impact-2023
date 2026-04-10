import React, { useState } from 'react';
import { FinancialStatement, FinancialStatementForm } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Plus, Trash2, Edit, X, CheckCircle, FileText } from 'lucide-react';
import { PDFDropzone } from '@/app/components/PDFDropzone';
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { useServerPagination } from '@/hooks/useServerPagination';
import {
  createFinancialStatement,
  updateFinancialStatement as updateStatementInDb,
  deleteFinancialStatement as deleteStatementFromDb,
  getFinancialStatementsPaginated,
} from '@/services/supabaseService';
import { InteractiveRichEditor } from '@/app/components/admin/InteractiveRichEditor';
import { PaginationControls } from '@/app/components/admin/PaginationControls';
import { AdminPageSkeleton } from '@/app/components/admin/SkeletonLoaders';
import { invalidateFinancialCache } from '@/utils/cacheInvalidation';
import { uploadPDF, deleteStorageFile } from '@/utils/storageUpload';
import {
  AdminValidationRules,
  mergeValidationResults,
  validateMaxChars,
  validateMaxWords,
  validateRequiredTrimmed,
} from '@/app/components/admin/utils/adminHelpers';

interface FinancialStatementManagerProps {
  statements: FinancialStatement[];
  onUpdate: (statements: FinancialStatement[]) => void;
  refreshContent?: () => Promise<void>;
}

export const FinancialStatementManager: React.FC<FinancialStatementManagerProps> = ({ statements: _statements, onUpdate: _onUpdate, refreshContent: _refreshContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStatement, setEditingStatement] = useState<FinancialStatementForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { confirmDelete, DeleteConfirmDialog } = useDeleteConfirmation();

  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<FinancialStatement>({
    fetchFunction: getFinancialStatementsPaginated,
    itemsPerPage: 6,
  });

  // Generate year options (from 2000 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

  const addStatement = () => {
    const newStatement: FinancialStatementForm = {
      id: `temp-${Date.now()}`,
      title: '',
      year: new Date().getFullYear().toString(),
      pdfUrl: '',
      description: '',
      pdfAccessType: 'download', // Default to download
    };
    setEditingStatement(newStatement);
    setIsModalOpen(true);
  };

  const handleEdit = (statement: FinancialStatement) => {
    setEditingStatement({ ...statement });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete({
      itemName: 'financial statement',
      title: 'Delete Financial Statement',
      message: 'Are you sure you want to delete this financial statement? This action cannot be undone.'
    });
    
    if (!confirmed) return;

    try {
      if (!id.startsWith('temp-') && !id.match(/^\\d{13}$/)) {
        // Find the statement to get its PDF URL for storage cleanup
        const statementToDelete = pagination.data.find(s => s.id === id);
        if (statementToDelete?.pdfUrl) {
          await deleteStorageFile(statementToDelete.pdfUrl, 'pdfs');
        }
        await deleteStatementFromDb(id);
      }
      
      // Invalidate cache
      invalidateFinancialCache();
      
      await pagination.refresh();
      toast.success('Financial statement deleted successfully!');
    } catch (error) {
      console.error('Error deleting statement:', error);
      toast.error('Failed to delete financial statement.');
    }
  };

  const handleSave = async () => {
    if (!editingStatement || isSaving) return;
    
    const validation = mergeValidationResults(
      validateRequiredTrimmed(editingStatement.title, 'Title'),
      validateMaxChars(
        editingStatement.title.trim(),
        AdminValidationRules.shortTitleMaxChars,
        'Title'
      ),
      validateMaxWords(
        editingStatement.title.trim(),
        AdminValidationRules.shortTitleMaxWords,
        'Title'
      ),
      validateRequiredTrimmed(editingStatement.year, 'Year'),
      validateMaxChars((editingStatement.description || '').trim(), AdminValidationRules.shortTextMaxChars, 'Description'),
      validateMaxWords((editingStatement.description || '').trim(), AdminValidationRules.shortTextMaxWords, 'Description')
    );
    if (!validation.isValid) {
      toast.error(validation.error || 'Validation failed');
      return;
    }

    if (!editingStatement.pdfUrl || (typeof editingStatement.pdfUrl === 'string' && editingStatement.pdfUrl.trim() === '')) {
      toast.error('Please upload a PDF file for the financial statement');
      return;
    }
    
    setIsSaving(true);
    try {
      // Handle PDF Upload before saving to database
      let finalPdfUrl = editingStatement.pdfUrl;
      if (finalPdfUrl instanceof File) {
        finalPdfUrl = await uploadPDF(finalPdfUrl, 'pdfs');
      }

      const statementData = {
        title: editingStatement.title,
        year: editingStatement.year,
        pdf_url: (finalPdfUrl as string) || '',
        description: editingStatement.description || '',
        pdf_access_type: editingStatement.pdfAccessType || 'download',
      };

      if (editingStatement.id && !editingStatement.id.startsWith('temp-') && !editingStatement.id.match(/^\\d{13}$/)) {
        await updateStatementInDb(editingStatement.id, statementData);
        toast.success('Financial statement updated!');
      } else {
        await createFinancialStatement(statementData);
        toast.success('Financial statement created!');
      }

      // Invalidate cache
      invalidateFinancialCache();

      await pagination.refresh();
      setIsModalOpen(false);
      setEditingStatement(null);
    } catch (error) {
      console.error('Error saving statement:', error);
      toast.error('Failed to save financial statement. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Financial Statements</h3>
        <Button onClick={addStatement} size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Statement
        </Button>
      </div>

      {/* Loading State */}
      {pagination.loading && pagination.data.length === 0 && (
        <AdminPageSkeleton message="Loading financial statements..." />
      )}

      {/* Empty State */}
      {!pagination.loading && pagination.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <FileText className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No financial statements yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Statement" to create your first financial statement</p>
        </div>
      )}

      {/* Statements Grid */}
      {pagination.data.length > 0 && (
        <>
          {/* Show loading skeleton during pagination */}
          {pagination.loading ? (
            <AdminPageSkeleton message="Loading financial statements..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagination.data.map((statement) => (
              <Card
                key={statement.id}
                className="cursor-pointer relative group"
                onClick={() => handleEdit(statement)}
              >
                <div className="absolute top-2 left-2 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/90 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(statement.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">{statement.year}</div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-2">
                    {statement.title || `Financial Statement ${statement.year}`}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Year: {statement.year}
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

      {/* Statement Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStatement?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Financial Statement
            </DialogTitle>
            <DialogDescription>
              {editingStatement?.id?.startsWith('temp-')
                ? 'Create a new financial statement entry'
                : 'Update the details for this financial statement'}
            </DialogDescription>
          </DialogHeader>

          {editingStatement && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="statement-title">Title *</Label>
                <Input
                  id="statement-title"
                  value={editingStatement.title}
                  onChange={(e) =>
                    setEditingStatement({ ...editingStatement, title: e.target.value })
                  }
                  placeholder="e.g., Annual Financial Report"
                />
              </div>

              <div>
                <Label htmlFor="statement-year">Year *</Label>
                <Select
                  value={editingStatement.year.toString()}
                  onValueChange={(value) =>
                    setEditingStatement({ ...editingStatement, year: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a year">{editingStatement.year}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <InteractiveRichEditor
                id="statement-description"
                label="Description (Optional)"
                value={editingStatement.description || ''}
                onChange={(val) =>
                  setEditingStatement({ ...editingStatement, description: val })
                }
                placeholder="Enter a brief description of this financial statement"
                rows={3}
              />

              <div>
                <Label>PDF File (Drag & Drop) *</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Upload the PDF file for this financial statement (PDF only)
                </p>
                <PDFDropzone
                  value={editingStatement.pdfUrl}
                  onChange={(value) =>
                    setEditingStatement({ ...editingStatement, pdfUrl: value })
                  }
                  label="Financial Statement PDF"
                />
              </div>

              <div>
                <Label htmlFor="pdf-access-type">PDF Access Type *</Label>
                <Select
                  value={editingStatement.pdfAccessType || 'download'}
                  onValueChange={(value: 'view' | 'download') =>
                    setEditingStatement({ ...editingStatement, pdfAccessType: value })
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

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingStatement(null);
                  }}
                >
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb]"
                  disabled={isSaving}
                  onClick={handleSave}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Statement'}
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