import { useEffect, useState, FC } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ProjectManager } from './ProjectManager';
import { FinancialStatementManager } from './FinancialStatementManager';
import { InternshipTestimonialManager } from './InternshipTestimonialManager';
import { useContent } from '@/app/context/ContentContext';
import { AdminSkeletonLoader } from '@/app/components/AdminSkeletonLoader';
import { toast } from 'sonner';

interface OurWorkTabsProps {
  refreshContent: () => Promise<void>;
}

export const OurWorkTabs: FC<OurWorkTabsProps> = ({ refreshContent }) => {
  const {
    content,
    updateInternationallyFundedProjects,
    updateLocallyFundedProjects,
    updateFinancialStatements,
    updateInternshipTestimonials,
    fetchInternationallyFundedProjects,
    fetchLocallyFundedProjects,
    fetchFinancialStatements,
    fetchInternshipTestimonials,
  } = useContent();

  const [activeSubTab, setActiveSubTab] = useState('internationally-funded');
  const [isSubTabLoading, setIsSubTabLoading] = useState(false);

  // Track which tabs have been loaded
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['internationally-funded']));

  // Fetch initial data for the first tab on mount
  useEffect(() => {
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
  }, [fetchInternationallyFundedProjects, loadedTabs]);

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
        case 'internship':
          await fetchInternshipTestimonials();
          break;
        case 'financial':
          await fetchFinancialStatements();
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
      <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Manage "Our Work" Sections</h3>
      <Tabs value={activeSubTab} onValueChange={handleSubTabChange}>
        <TabsList className="w-full flex-wrap h-auto mb-8 bg-[#EBF4FF]/60 p-1.5 rounded-2xl border border-[#D1E7FF] shadow-sm backdrop-blur-sm">
          <TabsTrigger 
            value="internationally-funded" 
            className="rounded-xl px-6 py-3 transition-all data-[state=active]:bg-white data-[state=active]:text-[#1887FC] data-[state=active]:shadow-lg font-bold text-gray-600 hover:text-[#1887FC]/80 text-sm"
          >
            Int. Funded
          </TabsTrigger>
          <TabsTrigger 
            value="locally-funded"
            className="rounded-xl px-6 py-3 transition-all data-[state=active]:bg-white data-[state=active]:text-[#1887FC] data-[state=active]:shadow-lg font-bold text-gray-600 hover:text-[#1887FC]/80 text-sm"
          >
            Loc. Funded
          </TabsTrigger>
          <TabsTrigger 
            value="internship"
            className="rounded-xl px-6 py-3 transition-all data-[state=active]:bg-white data-[state=active]:text-[#1887FC] data-[state=active]:shadow-lg font-bold text-gray-600 hover:text-[#1887FC]/80 text-sm"
          >
            Community
          </TabsTrigger>
          <TabsTrigger 
            value="financial"
            className="rounded-xl px-6 py-3 transition-all data-[state=active]:bg-white data-[state=active]:text-[#1887FC] data-[state=active]:shadow-lg font-bold text-gray-600 hover:text-[#1887FC]/80 text-sm"
          >
            Financial
          </TabsTrigger>
        </TabsList>

        {isSubTabLoading && <AdminSkeletonLoader />}

        {!isSubTabLoading && (
          <div className="mt-6">
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
          </div>
        )}
      </Tabs>
    </div>
  );
};
