import React, { useState } from 'react';
import { FinancialStatement, FinancialStatementForm } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Plus, Trash2, FileText, Edit, CheckCircle, X, Landmark } from 'lucide-react';
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
import { VisualRichEditor } from './VisualRichEditor';
import { SharedToolbar } from './SharedToolbar';
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
  hasChanges
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
  const [activeField, setActiveField] = useState<string | null>(null);

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
      if (!id.startsWith('temp-') && !id.match(/^\d{13}$/)) {
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
      const originalStatement = pagination.data.find(s => s.id === editingStatement.id);

      if (finalPdfUrl instanceof File) {
        finalPdfUrl = await uploadPDF(finalPdfUrl, 'pdfs');
        // Delete old PDF if it was replaced
        if (originalStatement?.pdfUrl && originalStatement.pdfUrl !== finalPdfUrl) {
          await deleteStorageFile(originalStatement.pdfUrl, 'pdfs');
        }
      } else if (!finalPdfUrl && originalStatement?.pdfUrl) {
        // PDF was removed
        await deleteStorageFile(originalStatement.pdfUrl, 'pdfs');
      }

      const statementData = {
        title: editingStatement.title,
        year: editingStatement.year,
        pdf_url: (finalPdfUrl as string) || '',
        description: editingStatement.description || '',
        pdf_access_type: editingStatement.pdfAccessType || 'download',
      };

      if (editingStatement.id && !editingStatement.id.startsWith('temp-') && !editingStatement.id.match(/^\d{13}$/)) {
        const originalStatement = pagination.data.find(s => s.id === editingStatement.id);
        if (originalStatement && !hasChanges(originalStatement, editingStatement)) {
          toast.info('No changes detected.');
          setIsModalOpen(false);
          setEditingStatement(null);
          return;
        }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
            <Landmark className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">Financial Statements</h3>
            <p className="text-xs text-gray-500 font-medium">Manage organization transparency reports</p>
          </div>
        </div>
        <Button 
          onClick={addStatement} 
          size="sm"
          className="w-full sm:w-auto bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md h-10 sm:h-9 px-4 font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagination.data.map((statement) => (
              <Card
                key={statement.id}
                className="cursor-pointer relative group overflow-hidden border-gray-100/50 hover:border-blue-200/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 rounded-3xl"
                onClick={() => handleEdit(statement)}
              >
                {/* Delete Button */}
                <div className="absolute top-4 right-4 z-20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 bg-white/90 backdrop-blur-md shadow-md hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all border border-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(statement.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="p-0">
                  {/* Visual Container */}
                  <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative overflow-hidden group-hover:from-blue-100 group-hover:to-blue-200 transition-colors duration-500">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-50" />
                    <div className="text-center relative z-10">
                      <FileText className="w-20 h-20 text-[#1887FC] transition-transform duration-500 group-hover:scale-110 drop-shadow-sm mx-auto mb-2" />
                      <div className="text-3xl font-black text-blue-700/80 tracking-tighter">{statement.year}</div>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-[#1887FC] transition-colors leading-tight">
                        {statement.title || `Financial Statement ${statement.year}`}
                      </h4>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-black text-[#1887FC] uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                          FY {statement.year}
                        </span>
                      </div>
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

      {/* Statement Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                  {editingStatement?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Financial Statement
                </DialogTitle>
                <DialogDescription className="text-base text-gray-500 mt-0.5 font-medium">
                  {editingStatement?.id?.startsWith('temp-')
                    ? 'Create a new financial statement entry'
                    : 'Update the details for this financial statement'}
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

          {editingStatement && (
            <div
              className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide"
            >
              <div className="space-y-8 py-6">
                <div>
                  <Label htmlFor="statement-title" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    Title <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="statement-title"
                    value={editingStatement.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setEditingStatement(prev => prev ? { ...prev, title: newTitle } : null);
                    }}
                    placeholder="e.g., Annual Report 2023"
                  />
                </div>

                <div>
                  <Label htmlFor="statement-year" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    Year <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Select
                    value={editingStatement.year}
                    onValueChange={(value) => setEditingStatement(prev => prev ? { ...prev, year: value } : null)}
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

                <VisualRichEditor
                  id="statement-description"
                  label="Description (Optional)"
                  value={editingStatement.description || ''}
                  onChange={(val) =>
                    setEditingStatement(prev => prev ? { ...prev, description: val } : null)
                  }
                  placeholder="Enter a brief description of this financial statement"
                  rows={3}
                  showToolbar={false}
                  onCommand={(cmd) => {
                    if (cmd === 'focus') {
                      setActiveField('statement-description');
                    }
                  }}
                />

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    PDF File (Drag & Drop) <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload the PDF file for this financial statement (PDF only)
                  </p>
                  <PDFDropzone
                    value={editingStatement.pdfUrl}
                    onChange={(value) =>
                      setEditingStatement(prev => prev ? { ...prev, pdfUrl: value } : null)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="pdf-access-type" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    PDF Access Type <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Select
                    value={editingStatement.pdfAccessType || 'download'}
                    onValueChange={(value: 'view' | 'download') =>
                      setEditingStatement(prev => prev ? { ...prev, pdfAccessType: value } : null)
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
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 p-6 border-t border-gray-100 shrink-0 bg-gray-50/80 backdrop-blur-sm rounded-b-2xl">
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-white hover:border-gray-300 transition-all" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingStatement(null);
              }}
            >
              <X className="w-5 h-4 mr-2" /> Cancel
            </Button>
            <Button 
              className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:shadow-lg hover:shadow-blue-500/25 text-white transition-all transform hover:-translate-y-0.5"
              disabled={isSaving}
              onClick={handleSave}
            >
              <CheckCircle className="w-5 h-5 mr-2" /> {isSaving ? 'Saving...' : 'Save Statement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </div>
  );
};
