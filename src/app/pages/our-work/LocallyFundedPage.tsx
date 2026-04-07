import React from 'react';
import { Project } from '@/app/context/ContentContext';
import { PageSkeletonLoader } from '@/app/components/PageSkeletonLoader';
import { ProjectList } from '@/app/components/ProjectList';
import { useServerPagination } from '@/hooks/useServerPagination';
import { getProjectsPaginated } from '@/services/optimizedSupabaseService';

export const LocallyFundedPage: React.FC = () => {
  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<Project>({
    fetchFunction: (page, itemsPerPage) => getProjectsPaginated('locally_funded', page, itemsPerPage),
    itemsPerPage: 6,
  });

  // Show full-page skeleton during any loading
  if (pagination.loading) {
    return <PageSkeletonLoader message="Loading Locally Funded Projects..." />;
  }

  return (
    <ProjectList 
      projects={pagination.data}
      title="Locally Funded Projects" 
      subtitle="Community-driven initiatives empowering local development and sustainable growth."
      pagination={pagination}
    />
  );
};