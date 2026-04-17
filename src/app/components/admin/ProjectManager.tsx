import React, { useState, useCallback } from 'react';
import { Project, ProjectForm } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Plus, Trash2, Edit, CheckCircle, X, FolderOpen, Calendar, Briefcase } from 'lucide-react';
import { ImageDropzone } from '@/app/components/ImageDropzone';
import { MultiImageDropzone } from '@/app/components/MultiImageDropzone';
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { useServerPagination } from '@/hooks/useServerPagination';
import {
  createProject,
  updateProject as updateProjectInDb,
  deleteProject as deleteProjectFromDb,
  getProjectsPaginated,
} from '@/services/supabaseService';

import { PaginationControls } from '@/app/components/admin/PaginationControls';
import { AdminPageSkeleton } from '@/app/components/admin/SkeletonLoaders';
import { invalidateProjectsCache } from '@/utils/cacheInvalidation';
import { uploadImage, uploadImages, deleteStorageFile } from '@/utils/storageUpload';
import { getImageUrl } from '@/utils/r2Upload';

import { VisualRichEditor } from './VisualRichEditor';
import { SharedToolbar } from './SharedToolbar';
import { 
  AdminValidationRules,
  mergeValidationResults,
  validateMaxChars,
  validateMaxWords,
  validateRequiredTrimmed,
  hasChanges
} from '@/app/components/admin/utils/adminHelpers';

interface ProjectManagerProps {
  projects: Project[];
  onUpdate: (projects: Project[]) => void;
  title?: string;
  category?: string;
  refreshContent?: () => Promise<void>;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ projects: _projects, onUpdate: _onUpdate, title = "Projects", category, refreshContent: _refreshContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleCommand = (cmd: string, val: any = '') => {
    if (activeField) {
      const event = new CustomEvent(`editor-command-${activeField}`, { 
        detail: { command: cmd, value: val } 
      });
      window.dispatchEvent(event);
    }
  };
  
  // Initialize delete confirmation hook
  const { confirmDelete, DeleteConfirmDialog } = useDeleteConfirmation();

  // Server-side pagination with category-specific fetch function
  const fetchProjectsByCategory = useCallback(
    (page: number, itemsPerPage: number) => {
      return getProjectsPaginated(category || '', page, itemsPerPage);
    },
    [category]
  );

  const pagination = useServerPagination<Project>({
    fetchFunction: fetchProjectsByCategory,
    itemsPerPage: 6,
  });

  const addProject = () => {
    const newProject: ProjectForm = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      category: category ?? '',
      imageUrl: '',
      images: [],
      date: new Date().toISOString().split('T')[0],
    };
    setEditingProject(newProject);
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject({ ...project } as ProjectForm);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete({
      itemName: 'project',
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.'
    });
    
    if (!confirmed) return;

    try {
      if (!id.startsWith('temp-') && !id.match(/^\d{13}$/)) {
        // Find the project to get its image URLs for storage cleanup
        const projectToDelete = pagination.data.find(p => p.id === id);
        if (projectToDelete) {
          // Delete main image
          if (projectToDelete.imageUrl) {
            await deleteStorageFile(projectToDelete.imageUrl, 'projects');
          }
          // Delete gallery images
          if (projectToDelete.images && projectToDelete.images.length > 0) {
            for (const imgUrl of projectToDelete.images) {
              await deleteStorageFile(imgUrl, 'projects');
            }
          }
        }
        await deleteProjectFromDb(id);
      }
      
      // Invalidate cache
      invalidateProjectsCache();
      
      await pagination.refresh();
      toast.success('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project.');
    }
  };

  const handleSave = async () => {
    if (!editingProject || isSaving) return;

     const validation = mergeValidationResults(
       validateRequiredTrimmed(editingProject.title, 'Project title'),
       validateMaxChars(
         editingProject.title.trim(),
         AdminValidationRules.shortTitleMaxChars,
         'Project title'
       ),
       validateMaxWords(
         editingProject.title.trim(),
         AdminValidationRules.shortTitleMaxWords,
         'Project title'
       ),
      validateRequiredTrimmed(editingProject.description, 'Project overview'),
      validateRequiredTrimmed(editingProject.date || '', 'Published date'),
      validateMaxChars(
        editingProject.description.trim(),
        AdminValidationRules.contentMaxChars,
        'Project overview'
      ),
      validateMaxWords(
        editingProject.description.trim(),
        5000,
        'Project overview'
      ),
      validateMaxWords(
        editingProject.objectives?.trim() || '',
        5000,
        'Objectives'
      ),
      validateMaxWords(
        editingProject.methodology?.trim() || '',
        5000,
        'Methodology and Activities'
      )
     );
     if (!validation.isValid) {
       toast.error(validation.error || 'Validation failed');
       return;
     }
    
    setIsSaving(true);
    try {
      // Handle Image Uploads before saving to database
      let finalImageUrl = editingProject.imageUrl;
      const originalProject = pagination.data.find(p => p.id === editingProject.id);
      
      if (typeof finalImageUrl === 'object' && finalImageUrl instanceof File) {
        finalImageUrl = await uploadImage(finalImageUrl, 'projects');
        // Delete old cover image if it was replaced
        if (originalProject?.imageUrl && originalProject.imageUrl !== finalImageUrl) {
          await deleteStorageFile(originalProject.imageUrl, 'projects');
        }
      } else if (!finalImageUrl && originalProject?.imageUrl) {
        // Cover image was removed
        await deleteStorageFile(originalProject.imageUrl, 'projects');
      }

      let finalImages = editingProject.images || [];
      const originalImages = originalProject?.images || [];

      if (editingProject.images && editingProject.images.some(img => typeof img === 'object')) {
        const filesToUpload = editingProject.images.filter(img => typeof img === 'object') as File[];
        const uploadedUrls = await uploadImages(filesToUpload, 'projects');
        let uploadIdx = 0;
        finalImages = editingProject.images.map(img => {
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
          await deleteStorageFile(oldImg, 'projects');
        }
      }

      const projectData = {
        title: editingProject.title,
        description: editingProject.description,
        context: editingProject.context || null,
        objectives: editingProject.objectives || null,
        methodology: editingProject.methodology || null,
        category: category ?? '',
        image_url: (finalImageUrl as string) || null,
        images: (finalImages as string[]) || null,
        date: editingProject.date || null,
      };

      if (editingProject.id && !editingProject.id.startsWith('temp-') && !editingProject.id.match(/^\d{13}$/)) {
        const originalProject = pagination.data.find(p => p.id === editingProject.id);
        if (originalProject && !hasChanges(originalProject, editingProject)) {
          toast.info('No changes detected.');
          setIsModalOpen(false);
          setEditingProject(null);
          return;
        }
        await updateProjectInDb(editingProject.id, projectData);
        toast.success('Project updated!');
      } else {
        await createProject(projectData);
        toast.success('Project created!');
      }

      // Invalidate cache
      invalidateProjectsCache();

      await pagination.refresh();
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
            <Briefcase className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{title || 'Manage Projects'}</h3>
            <p className="text-xs text-gray-500 font-medium">Add or edit organization projects</p>
          </div>
        </div>
        <Button 
          onClick={addProject} 
          size="sm"
          className="w-full sm:w-auto bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md h-10 sm:h-9 px-4 font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

      {/* Loading State */}
      {pagination.loading && pagination.data.length === 0 && (
        <AdminPageSkeleton message="Loading projects..." />
      )}

      {/* Empty State */}
      {!pagination.loading && pagination.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <FolderOpen className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No projects yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Project" to create your first project</p>
        </div>
      )}

      {/* Projects Grid */}
      {pagination.data.length > 0 && (
        <>
          {/* Show loading skeleton during pagination */}
          {pagination.loading ? (
            <AdminPageSkeleton message="Loading projects..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagination.data.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer relative group overflow-hidden border-gray-100/50 hover:border-blue-200/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 rounded-3xl"
                onClick={() => handleEdit(project)}
              >
                {/* Delete Button */}
                <div className="absolute top-4 right-4 z-20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 bg-white/90 backdrop-blur-md shadow-md hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all border border-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="p-0">
                  {/* Image Container */}
                  <div className="relative w-full h-48 mb-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                    {project.imageUrl || (project.images && project.images.length > 0) ? (
                      <img
                        src={getImageUrl(project.imageUrl || project.images?.[0] || '')}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <FolderOpen className="w-16 h-16 text-[#1887FC]" />
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-[#1887FC] transition-colors leading-tight">
                        {project.title || 'Untitled Project'}
                      </h4>
                      {project.date && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <Calendar className="w-3.5 h-3.5 text-[#1887FC]" />
                          <span className="text-xs font-bold text-[#1887FC] uppercase tracking-wider">
                            {new Date(project.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {project.description.replace(/<[^>]*>?/gm, '')}
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

      {/* Project Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1887FC] to-[#3b82f6] text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                  {editingProject?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Project
                </DialogTitle>
                <DialogDescription className="text-base text-gray-500 mt-0.5 font-medium">
                  {editingProject?.id?.startsWith('temp-')
                    ? 'Create a new project entry'
                    : 'Update the details for this project'}
                </DialogDescription>
              </div>
            </div>
            <div className="pt-2">
              <SharedToolbar 
                onCommand={handleCommand} 
              />
            </div>
          </DialogHeader>
          
          {editingProject && (
            <div
              className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide"
            >
              <div className="space-y-8 py-6">
                <div>
                  <Label htmlFor="project-title" className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    Project Title <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="project-title"
                    value={editingProject.title}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, title: e.target.value })
                    }
                    placeholder="Enter project title"
                    className="text-base sm:text-lg font-semibold"
                  />
                </div>

                <VisualRichEditor
                  id="project-description"
                  label="Project overview"
                  value={editingProject.description}
                  onChange={(val) =>
                    setEditingProject({ ...editingProject, description: val })
                  }
                  rows={6}
                  placeholder="Enter project overview"
                  required
                  showToolbar={false}
                  onCommand={(cmd) => {
                    if (cmd === 'focus') {
                      setActiveField('project-description');
                    }
                  }}
                />

                <VisualRichEditor
                  id="project-objectives"
                  label="Objectives"
                  value={editingProject.objectives || ''}
                  onChange={(val) =>
                    setEditingProject({ ...editingProject, objectives: val })
                  }
                  rows={4}
                  placeholder="Enter project objectives"
                  showToolbar={false}
                  onCommand={(cmd) => {
                    if (cmd === 'focus') {
                      setActiveField('project-objectives');
                    }
                  }}
                />

                <VisualRichEditor
                  id="project-methodology"
                  label="Methodology and Activities"
                  value={editingProject.methodology || ''}
                  onChange={(val) =>
                    setEditingProject({ ...editingProject, methodology: val })
                  }
                  rows={4}
                  placeholder="Enter methodology and activities"
                  showToolbar={false}
                  onCommand={(cmd) => {
                    if (cmd === 'focus') {
                      setActiveField('project-methodology');
                    }
                  }}
                />

                <div>
                  <Label htmlFor="project-date" className="text-sm font-semibold text-gray-700 mb-1">
                    Published Date <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="project-date"
                    type="date"
                    value={editingProject.date || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, date: e.target.value })
                    }
                  />
                </div>

                {/* Cover Image and Gallery Images - Hide for study_findings */}
                {category !== 'study_findings' && (
                  <>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-1">Cover Image (Drag & Drop)</Label>
                      <p className="text-xs text-gray-500 mb-3">
                        Upload a cover image for this project
                      </p>
                      <ImageDropzone
                        value={editingProject.imageUrl}
                        onChange={(url) =>
                          setEditingProject({ ...editingProject, imageUrl: url })
                        }
                        label="Cover Image"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-1 flex justify-between">
                        <span>Gallery Images (Drag & Drop)</span>
                        <span className="text-xs text-gray-400 font-normal">{editingProject.images?.length || 0} images</span>
                      </Label>
                      <p className="text-xs text-gray-500 mb-3">
                        Upload additional images for the gallery
                      </p>
                      <MultiImageDropzone
                        images={editingProject.images || []}
                        onChange={(images) => {
                          setEditingProject({
                            ...editingProject,
                            images
                          });
                        }}
                        label="Project Images"
                      />
                    </div>
                  </>
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
                setEditingProject(null);
              }}
            >
              <X className="w-5 h-4 mr-2" /> Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:shadow-lg hover:shadow-blue-500/25 text-white transition-all transform hover:-translate-y-0.5"
              disabled={isSaving}
              onClick={handleSave}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </div>
  );
};
