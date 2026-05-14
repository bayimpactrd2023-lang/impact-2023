import React from 'react';
import { Project } from '@/app/context/ContentContext';
import { PageSkeletonLoader } from '@/app/components/PageSkeletonLoader';
import { ProjectList } from '@/app/components/ProjectList';
import { useServerPagination } from '@/hooks/useServerPagination';
import { getProjectsPaginated } from '@/services/optimizedSupabaseService';

export const TechnologySpinoffsPage: React.FC = () => {
  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<Project>({
    fetchFunction: (page, itemsPerPage) => getProjectsPaginated('technology_spinoffs', page, itemsPerPage),
    itemsPerPage: 6,
  });

  // Show full-page skeleton during any loading
  if (pagination.loading) {
    return <PageSkeletonLoader message="Loading Technology Spinoffs..." />;
  }

  return (
    <ProjectList 
      projects={pagination.data}
      title="Technology Spinoffs" 
      subtitle="Explore our innovative applications, dashboards, and systems developed from our research findings."
      pagination={pagination}
    />
  );
};
