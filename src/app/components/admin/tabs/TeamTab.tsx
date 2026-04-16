/**
 * Team Tab Component
 * 
 * Tab for managing team members.
 */

import { FileText, Users } from 'lucide-react';
import { ContentGridTab } from './ContentGridTab';
import { TeamMember } from '../types/admin.types';
import { CardContent } from '@/app/components/ui/card';
import { getImageUrl } from '@/utils/r2Upload';

interface TeamTabProps {
  teamMembers: TeamMember[];
  onAdd: () => void;
  onEdit: (item: TeamMember) => void;
  onDelete: (id: string) => void;
}

/**
 * Team members management tab
 */
export function TeamTab({ teamMembers, onAdd, onEdit, onDelete }: TeamTabProps) {
  /**
   * Render a single team member card
   */
  const renderTeamMemberCard = (item: TeamMember) => (
    <>
      {/* Photo */}
      {item.imageUrl ? (
        <div className="w-full h-48 overflow-hidden rounded-t-lg flex items-center justify-center bg-gray-100">
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.name}
            className="h-32 w-32 rounded-full object-cover mt-4"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <CardContent className="p-4">
        <h4 className="font-semibold text-sm line-clamp-1 mb-1">
          {item.name || 'Unnamed'}
        </h4>
        <p className="text-xs text-gray-600 mb-2">{item.role || 'No role'}</p>
        <p className="text-xs text-gray-500 line-clamp-2">
          {item.description || 'No description'}
        </p>
      </CardContent>
    </>
  );

  return (
    <ContentGridTab
      title={
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500 stroke-[3px]" />
          <span>Manage Board Members</span>
        </div>
      }
      addButtonLabel="Add Board Member"
      items={teamMembers}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      renderCard={renderTeamMemberCard}
    />
  );
}
