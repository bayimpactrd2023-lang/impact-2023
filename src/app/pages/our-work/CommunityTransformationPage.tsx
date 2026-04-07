import React from 'react';
import { Project } from '@/app/context/ContentContext';
import { PageSkeletonLoader } from '@/app/components/PageSkeletonLoader';
import { ProjectList } from '@/app/components/ProjectList';
import { useServerPagination } from '@/hooks/useServerPagination';
import { getProjectsPaginated } from '@/services/optimizedSupabaseService';

export const CommunityTransformationPage: React.FC = () => {
  // Use server-side pagination with 6 items per page
  const pagination = useServerPagination<Project>({
    fetchFunction: (page, itemsPerPage) => getProjectsPaginated('community_transformation', page, itemsPerPage),
    itemsPerPage: 6,
  });

  // Show full-page skeleton during any loading
  if (pagination.loading) {
    return <PageSkeletonLoader message="Loading Community Transformation Projects..." />;
  }

  return (
    <ProjectList
      projects={pagination.data}
      title="Community Transformation"
      subtitle="Empowering communities through education, capacity building, and sustainable development."
      pagination={pagination}
    />
  );
};