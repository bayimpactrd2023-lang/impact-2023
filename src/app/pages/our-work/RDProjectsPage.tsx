import React from 'react';
import { Project } from '@/app/context/ContentContext';
import { PageSkeletonLoader } from '@/app/components/PageSkeletonLoader';
import { ProjectList } from '@/app/components/ProjectList';
import { useServerPagination } from '@/hooks/useServerPagination';
import { getProjectsPaginated } from '@/services/optimizedSupabaseService';

export const RDProjectsPage: React.FC = () => {
  // Use server-side pagination with 6 items per page
  // Fetch R&D projects for the unified category
  const pagination = useServerPagination<Project>({
    fetchFunction: (page, itemsPerPage) => 
      getProjectsPaginated('rd_projects', page, itemsPerPage),
    itemsPerPage: 6,
  });

  // Show full-page skeleton during any loading
  if (pagination.loading) {
    return <PageSkeletonLoader message="Loading R&D Projects..." />;
  }

  return (
    <ProjectList 
      projects={pagination.data}
      title="R&D Projects" 
      subtitle="Discover our ongoing and past research initiatives driving innovation in agriculture and sustainable development."
      pagination={pagination}
    />
  );
};
