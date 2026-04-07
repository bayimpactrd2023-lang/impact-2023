/**
 * Home Tab Component
 * 
 * The main dashboard view showing tips, content overview, and quick actions.
 */

import {
  FileText,
  Newspaper,
  Users,
  Sparkles,
  Handshake,
  BookOpen,
  Layout,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { QuickAction } from '../types/admin.types';

interface HomeTabProps {
  /** Count of various content items */
  counts: {
    highlights: number;
    publications: number;
    projects: number;
    testimonials: number;
  };
  
  /** Quick action handlers */
  quickActions: {
    onCreateBlog: () => void;
    onAddNews: () => void;
    onAddTeamMember: () => void;
    onAddHighlight: () => void;
    onAddPartner: () => void;
    onCreatePublication: () => void;
    onEditHero: () => void;
  };
}

/**
 * Quick action button configuration
 */
const createQuickActions = (handlers: HomeTabProps['quickActions']): QuickAction[] => [
  {
    id: 'create-blog',
    label: 'Create Blog Post',
    description: 'Write a new article',
    icon: <FileText className="w-5 h-5" />,
    color: {
      bg: 'blue-50',
      hover: 'blue-400',
      iconBg: 'blue-100',
      iconHover: 'blue-200',
      iconText: 'blue-600',
    },
    onClick: handlers.onCreateBlog,
  },
  {
    id: 'add-news',
    label: 'Add News Update',
    description: 'Post an announcement',
    icon: <Newspaper className="w-5 h-5" />,
    color: {
      bg: 'green-50',
      hover: 'green-400',
      iconBg: 'green-100',
      iconHover: 'green-200',
      iconText: 'green-600',
    },
    onClick: handlers.onAddNews,
  },
  {
    id: 'add-team-member',
    label: 'Add Team Member',
    description: 'Manage your team',
    icon: <Users className="w-5 h-5" />,
    color: {
      bg: 'purple-50',
      hover: 'purple-400',
      iconBg: 'purple-100',
      iconHover: 'purple-200',
      iconText: 'purple-600',
    },
    onClick: handlers.onAddTeamMember,
  },
  {
    id: 'add-highlight',
    label: 'Add Highlight',
    description: 'Feature your work',
    icon: <Sparkles className="w-5 h-5" />,
    color: {
      bg: 'yellow-50',
      hover: 'yellow-400',
      iconBg: 'yellow-100',
      iconHover: 'yellow-200',
      iconText: 'yellow-600',
    },
    onClick: handlers.onAddHighlight,
  },
  {
    id: 'add-partner',
    label: 'Add Partner',
    description: 'Showcase collaborators',
    icon: <Handshake className="w-5 h-5" />,
    color: {
      bg: 'orange-50',
      hover: 'orange-400',
      iconBg: 'orange-100',
      iconHover: 'orange-200',
      iconText: 'orange-600',
    },
    onClick: handlers.onAddPartner,
  },
  {
    id: 'create-publication',
    label: 'Create Publication',
    description: 'Add new publication',
    icon: <BookOpen className="w-5 h-5" />,
    color: {
      bg: 'indigo-50',
      hover: 'indigo-400',
      iconBg: 'indigo-100',
      iconHover: 'indigo-200',
      iconText: 'indigo-600',
    },
    onClick: handlers.onCreatePublication,
  },
  {
    id: 'edit-hero',
    label: 'Edit Hero Section',
    description: 'Update homepage banner',
    icon: <Layout className="w-5 h-5" />,
    color: {
      bg: 'rose-50',
      hover: 'rose-400',
      iconBg: 'rose-100',
      iconHover: 'rose-200',
      iconText: 'rose-600',
    },
    onClick: handlers.onEditHero,
  },
];

/**
 * Home tab component - Main dashboard view
 */
export function HomeTab({ counts, quickActions }: HomeTabProps) {
  const actions = createQuickActions(quickActions);

  return (
    <div className="space-y-6">
      {/* Tips and Content Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💡 Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "All changes are automatically saved to your browser's local storage",
              'Click on any card in the grid views to open the edit modal',
              'Use the Save buttons to persist your changes after editing',
              'Images can be uploaded via drag-and-drop or URL input',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Content Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Content Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Highlights', value: counts.highlights },
              { label: 'Publications', value: counts.publications },
              { label: 'Projects (All)', value: counts.projects },
              { label: 'Testimonials', value: counts.testimonials },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-semibold text-gray-900">{item.value} items</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actions.map(action => (
              <Button
                key={action.id}
                variant="outline"
                className={`justify-start h-auto py-4 px-4 hover:border-${action.color.hover} hover:bg-${action.color.bg} transition-colors group`}
                onClick={action.onClick}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-${action.color.iconBg} text-${action.color.iconText} group-hover:bg-${action.color.iconHover} transition-colors`}>
                    {action.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{action.label}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
