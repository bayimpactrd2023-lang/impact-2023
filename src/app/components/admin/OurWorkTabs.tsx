import { useEffect, useState, FC } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { ProjectManager } from './ProjectManager';
import { FinancialStatementManager } from './FinancialStatementManager';
import { InternshipTestimonialManager } from './InternshipTestimonialManager';
import { useContent } from '@/app/context/ContentContext';
import { AdminPageSkeleton } from './SkeletonLoaders';
import { toast } from 'sonner';
import { Globe, Users, Cpu, GraduationCap, Users2, Landmark } from 'lucide-react';

interface OurWorkTabsProps {
  refreshContent: () => Promise<void>;
}

const SECTIONS = [
  { value: 'rd-projects', label: 'R&D Projects', icon: Globe, category: 'rd_projects' },
  { value: 'community', label: 'Community Transformation', icon: Users, category: 'community_transformation' },
  { value: 'technology', label: 'Technology Spinoffs', icon: Cpu, category: 'technology_spinoffs' },
  { value: 'thesis-support', label: 'Thesis Support', icon: GraduationCap, category: 'thesis_support' },
  { value: 'internship', label: 'Internship Program', icon: Users2, category: 'internship_program' },
  { value: 'financial', label: 'Financial Transparency', icon: Landmark, category: 'financial_statements' },
];

export const OurWorkTabs: FC<OurWorkTabsProps> = ({ refreshContent }) => {
  const {
    content,
    updateRDProjects,
    updateCommunityTransformationProjects,
    updateTechnologySpinoffsProjects,
    updateStudentSupportProjects,
    updateFinancialStatements,
    updateInternshipTestimonials,
    fetchRDProjects,
    fetchCommunityTransformationProjects,
    fetchTechnologySpinoffsProjects,
    fetchStudentSupportProjects,
    fetchFinancialStatements,
    fetchInternshipTestimonials,
  } = useContent();

  const [activeSection, setActiveSection] = useState('rd-projects');
  const [isLoading, setIsLoading] = useState(false);
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());

  const fetchDataForSection = async (section: string) => {
    if (loadedSections.has(section)) return;

    setIsLoading(true);
    try {
      switch (section) {
        case 'rd-projects':
          await fetchRDProjects();
          break;
        case 'community':
          await fetchCommunityTransformationProjects();
          break;
        case 'technology':
          await fetchTechnologySpinoffsProjects();
          break;
        case 'thesis-support':
          await fetchStudentSupportProjects();
          break;
        case 'internship':
          await fetchInternshipTestimonials();
          break;
        case 'financial':
          await fetchFinancialStatements();
          break;
      }
      setLoadedSections(prev => new Set([...prev, section]));
    } catch (error) {
      console.error(`Error fetching data for ${section}:`, error);
      toast.error('Failed to load section data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataForSection(activeSection);
  }, [activeSection]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Manage "Our Work"</h3>
          <p className="text-sm text-gray-500 mt-1">Select a section to manage its content</p>
        </div>

        <div className="w-full sm:w-72">
          <Select value={activeSection} onValueChange={setActiveSection}>
            <SelectTrigger className="w-full h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-[#1887FC] focus:border-[#1887FC] transition-all font-semibold text-gray-700">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 shadow-xl p-1">
              {SECTIONS.map((section) => (
                <SelectItem 
                  key={section.value} 
                  value={section.value}
                  className="rounded-lg py-3 focus:bg-blue-50 focus:text-[#1887FC] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="w-4 h-4" />
                    <span className="font-medium">{section.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px] z-10 rounded-2xl">
            <AdminPageSkeleton message="Loading section..." />
          </div>
        ) : (
          <div className="transition-all duration-300">
            {activeSection === 'rd-projects' && (
              <ProjectManager 
                projects={content.rdProjects} 
                onUpdate={updateRDProjects}
                title="R&D Projects" 
                category="rd_projects" 
                refreshContent={refreshContent} 
              />
            )}
            {activeSection === 'community' && (
              <ProjectManager 
                projects={content.communityTransformationProjects} 
                onUpdate={updateCommunityTransformationProjects}
                title="Community Transformation" 
                category="community_transformation" 
                refreshContent={refreshContent} 
              />
            )}
            {activeSection === 'technology' && (
              <ProjectManager 
                projects={content.technologySpinoffsProjects} 
                onUpdate={updateTechnologySpinoffsProjects}
                title="Technology Spinoffs" 
                category="technology_spinoffs" 
                refreshContent={refreshContent} 
              />
            )}
            {activeSection === 'thesis-support' && (
              <ProjectManager
                projects={content.studentSupportProjects}
                onUpdate={updateStudentSupportProjects}
                title="Thesis Support"
                category="thesis_support"
                refreshContent={refreshContent}
              />
            )}
            {activeSection === 'internship' && (
              <InternshipTestimonialManager 
                testimonials={content.internshipTestimonials} 
                onUpdate={updateInternshipTestimonials}
                refreshContent={refreshContent} 
              />
            )}
            {activeSection === 'financial' && (
              <FinancialStatementManager 
                statements={content.financialStatements} 
                onUpdate={updateFinancialStatements}
                refreshContent={refreshContent} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
