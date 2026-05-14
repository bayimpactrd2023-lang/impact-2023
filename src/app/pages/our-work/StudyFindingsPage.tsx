import React from 'react';
import { Construction, Clock, FileText } from 'lucide-react';

export const StudyFindingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-[#1887FC] to-[#3b82f6] p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <Construction className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Study Findings
            </h1>
            <p className="text-white/90 text-lg">
              Under Development
            </p>
          </div>

          {/* Content */}
          <div className="p-8 sm:p-12 text-center">
            <div className="max-w-2xl mx-auto">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-medium mb-6">
                <Clock className="w-4 h-4" />
                <span>Coming Soon</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                We're Working On It!
              </h2>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Our study findings section is currently under development. 
                We're compiling research results, data analysis, and key insights 
                from our ongoing projects. Check back soon for comprehensive 
                research findings and publications.
              </p>

              {/* Feature Preview */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-[#1887FC]" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    What to Expect
                  </h3>
                </div>
                <ul className="text-left text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#1887FC] mt-1">•</span>
                    <span>Research data and analysis from completed studies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1887FC] mt-1">•</span>
                    <span>Key findings and insights from our projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1887FC] mt-1">•</span>
                    <span>Downloadable reports and publications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1887FC] mt-1">•</span>
                    <span>Visual data representations and infographics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};