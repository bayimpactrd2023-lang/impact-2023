import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TeamMember } from '@/app/context/ContentContext';
import { User as UserIcon } from 'lucide-react';

interface TeamMemberDetailModalProps {
  teamMember: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TeamMemberDetailModal: React.FC<TeamMemberDetailModalProps> = ({
  teamMember,
  isOpen,
  onClose,
}) => {
  if (!teamMember) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden bg-white border-none shadow-2xl rounded-2xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle className="sr-only">{teamMember.name}</DialogTitle>
          <DialogDescription className="sr-only">
            Team member details for {teamMember.name}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-hide max-h-[90vh]">
          {/* Profile Section */}
          <div className="p-8 sm:p-10 text-center border-b border-gray-200">
            {/* Team Member Image */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-lg ring-4 ring-blue-50">
                {teamMember.imageUrl ? (
                  <ImageWithFallback
                    src={teamMember.imageUrl}
                    alt={teamMember.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1887FC] to-[#4da3fd] flex items-center justify-center">
                    <UserIcon className="w-16 h-16 sm:w-18 sm:h-18 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {teamMember.name}
            </h2>

            {/* Role Badge */}
            <span className="inline-block px-6 py-2 bg-blue-50 text-[#1887FC] rounded-full font-medium text-base border border-blue-100">
              {teamMember.role}
            </span>
          </div>

          {/* Description Section */}
          <div className="p-6 sm:p-8">
            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {teamMember.description}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};