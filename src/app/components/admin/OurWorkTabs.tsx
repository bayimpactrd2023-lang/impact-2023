import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ProjectManager } from '@/app/components/admin/ProjectManager';
import { FinancialStatementManager } from '@/app/components/admin/FinancialStatementManager';
import { InternshipTestimonialManager } from '@/app/components/admin/InternshipTestimonialManager';
import { useContent } from '@/app/context/ContentContext';
import { AdminSkeletonLoader } from '@/app/components/AdminSkeletonLoader';
import { toast } from 'sonner';

interface OurWorkTabsProps {
  refreshContent: () => Promise<void>;
}

export const OurWorkTabs: React.FC<OurWorkTabsProps> = ({ refreshContent }) => {
  const {
    content,
    loadingStates,
    updateInternationallyFundedProjects,
    updateLocallyFundedProjects,
    updateCommunityTransformationProjects,
    updateInternshipPrograms,
    updateFinancialStatements,
    updateStudyFindings,
    updateInternshipTestimonials,
    fetchInternationallyFundedProjects,
    fetchLocallyFundedProjects,
    fetchCommunityTransformationProjects,
    fetchInternshipPrograms,
    fetchStudyFindings,
    fetchFinancialStatements,
    fetchInternshipTestimonials,
  } = useContent();

  const [activeSubTab, setActiveSubTab] = useState('internationally-funded');
  const [isSubTabLoading, setIsSubTabLoading] = useState(false);

  // Track which tabs have been loaded
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['internationally-funded']));

  // Fetch initial data for the first tab on mount
  React.useEffect(() => {
    const loadInitialData = async () => {
      setIsSubTabLoading(true);
      try {
        await fetchInternationallyFundedProjects();
      } catch (error) {
        console.error('[OurWorkTabs] Error loading initial data:', error);
        toast.error('Failed to load project data');
      } finally {
        setIsSubTabLoading(false);
      }
    };

    if (!loadedTabs.has('internationally-funded')) {
      loadInitialData();
    }
  }, []);

  const handleSubTabChange = async (value: string) => {
    if (value === activeSubTab) return;

    setActiveSubTab(value);

    // Check if we've already loaded this tab's data
    if (loadedTabs.has(value)) {
      return;
    }

    setIsSubTabLoading(true);

    try {
      switch (value) {
        case 'internationally-funded':
          await fetchInternationallyFundedProjects();
          break;
        case 'locally-funded':
          await fetchLocallyFundedProjects();
          break;
        case 'community':
          await fetchCommunityTransformationProjects();
          break;
        case 'internship':
          await Promise.all([fetchInternshipPrograms(), fetchInternshipTestimonials()]);
          break;
        case 'financial':
          await fetchFinancialStatements();
          break;
        case 'findings':
          await fetchStudyFindings();
          break;
      }
      
      // Mark this tab as loaded
      setLoadedTabs(prev => new Set([...prev, value]));
    } catch (error) {
      console.error(`Error fetching data for sub-tab ${value}:`, error);
      toast.error('Failed to load data');
    } finally {
      setIsSubTabLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Manage "Our Work" Sections</h3>
      <Tabs value={activeSubTab} onValueChange={handleSubTabChange}>
        <TabsList className="w-full flex-wrap h-auto mb-4">
          <TabsTrigger value="internationally-funded">Int. Funded</TabsTrigger>
          <TabsTrigger value="locally-funded">Loc. Funded</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="internship">Internship</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
        </TabsList>

        {isSubTabLoading && <AdminSkeletonLoader />}

        {!isSubTabLoading && (
          <>
            <TabsContent value="internationally-funded">
              <ProjectManager 
                projects={content.internationallyFundedProjects} 
                onUpdate={updateInternationallyFundedProjects} 
                title="Internationally Funded Projects" 
                category="internationally_funded" 
                refreshContent={refreshContent} 
              />
            </TabsContent>
            <TabsContent value="locally-funded">
              <ProjectManager 
                projects={content.locallyFundedProjects} 
                onUpdate={updateLocallyFundedProjects} 
                title="Locally Funded Projects" 
                category="locally_funded" 
                refreshContent={refreshContent} 
              />
            </TabsContent>
            <TabsContent value="community">
              <ProjectManager 
                projects={content.communityTransformationProjects} 
                onUpdate={updateCommunityTransformationProjects} 
                title="Community Transformation" 
                category="community_transformation" 
                refreshContent={refreshContent} 
              />
            </TabsContent>
            <TabsContent value="internship">
              <InternshipTestimonialManager 
                testimonials={content.internshipTestimonials} 
                onUpdate={updateInternshipTestimonials} 
                refreshContent={refreshContent} 
              />
            </TabsContent>
            <TabsContent value="financial">
              <FinancialStatementManager 
                statements={content.financialStatements} 
                onUpdate={updateFinancialStatements} 
                refreshContent={refreshContent} 
              />
            </TabsContent>
            <TabsContent value="findings">
              {/* Under Development Placeholder */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#1887FC] to-[#0b5ab8] mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Under Development</h3>
                <p className="text-gray-700 mb-4 max-w-md mx-auto">
                  The Findings from Our Latest Studies section is currently being developed and will be available soon.
                </p>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white rounded-full font-semibold text-sm">
                  🚧 Development in Progress
                </div>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};