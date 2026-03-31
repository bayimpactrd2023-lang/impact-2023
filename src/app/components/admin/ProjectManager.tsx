import React, { useState, useCallback } from 'react';
import { Project } from '@/app/context/ContentContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Plus, Trash2, Edit, X, CheckCircle, FolderOpen } from 'lucide-react';
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
import { AdminModalLoadingBar, AdminPageSkeleton } from '@/app/components/admin/SkeletonLoaders';
import { invalidateProjectsCache } from '@/utils/cacheInvalidation';

interface ProjectManagerProps {
  projects: Project[];
  onUpdate: (projects: Project[]) => void;
  title?: string;
  category?: string;
  refreshContent?: () => Promise<void>;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, onUpdate, title = "Projects", category, refreshContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
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
    const newProject: Project = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      category: category,
      imageUrl: '',
      images: [],
      date: new Date().toISOString().split('T')[0],
    };
    setEditingProject(newProject);
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject({ ...project });
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
      if (!id.startsWith('temp-') && !id.match(/^\\d{13}$/)) {
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
    
    setIsSaving(true);
    try {
      const projectData = {
        title: editingProject.title,
        description: editingProject.description,
        category: category,
        image_url: editingProject.imageUrl || null,
        images: editingProject.images || null,
        date: editingProject.date || null,
      };

      if (editingProject.id && !editingProject.id.startsWith('temp-') && !editingProject.id.match(/^\\d{13}$/)) {
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{title || 'Manage Projects'}</h3>
        <Button onClick={addProject} size="sm">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagination.data.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer relative group"
                onClick={() => handleEdit(project)}
              >
                <div className="absolute top-2 left-2 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/90 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                {project.imageUrl || (project.images && project.images.length > 0) ? (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={project.imageUrl || project.images?.[0] || ''}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg flex items-center justify-center">
                    <FolderOpen className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-2">
                    {project.title || 'Untitled Project'}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {project.description}
                  </p>
                  {project.date && (
                    <p className="text-xs text-gray-500">
                      {new Date(project.date).toLocaleDateString()}
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

      {/* Project Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingProject?.id?.startsWith('temp-') ? 'Create' : 'Edit'} Project
            </DialogTitle>
            <DialogDescription>
              {editingProject?.id?.startsWith('temp-')
                ? 'Create a new project entry'
                : 'Update the details for this project'}
            </DialogDescription>
          </DialogHeader>
          
          {editingProject && (
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-1">
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="project-title">Project Title *</Label>
                  <Input
                    id="project-title"
                    value={editingProject.title}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, title: e.target.value })
                    }
                    placeholder="Enter project title"
                  />
                </div>

                <div>
                  <Label htmlFor="project-description">Description *</Label>
                  <Textarea
                    id="project-description"
                    value={editingProject.description}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, description: e.target.value })
                    }
                    rows={6}
                    placeholder="Enter project description"
                  />
                </div>

                <div>
                  <Label htmlFor="project-date">Project Date</Label>
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
                      <Label>Cover Image (Drag & Drop)</Label>
                      <p className="text-xs text-gray-500 mb-2">
                        Upload a cover image for this project
                      </p>
                      <ImageDropzone
                        value={editingProject.imageUrl || ''}
                        onChange={(url) =>
                          setEditingProject({ ...editingProject, imageUrl: url })
                        }
                        label="Cover Image"
                      />
                    </div>

                    <div>
                      <Label>Gallery Images (Drag & Drop)</Label>
                      <p className="text-xs text-gray-500 mb-2">
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

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingProject(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb]"
                    disabled={isSaving}
                    onClick={handleSave}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Project'}
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