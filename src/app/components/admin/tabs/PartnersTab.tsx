/**
 * Partners Tab Component
 * 
 * Tab for managing partners.
 */

import { FileText } from 'lucide-react';
import { ContentGridTab } from './ContentGridTab';
import { Partner } from '../types/admin.types';
import { CardContent } from '@/app/components/ui/card';

interface PartnersTabProps {
  partners: Partner[];
  onAdd: () => void;
  onEdit: (item: Partner) => void;
  onDelete: (id: string) => void;
}

/**
 * Partners management tab
 */
export function PartnersTab({ partners, onAdd, onEdit, onDelete }: PartnersTabProps) {
  /**
   * Render a single partner card
   */
  const renderPartnerCard = (item: Partner) => (
    <>
      {/* Logo */}
      {item.logoUrl ? (
        <div className="w-full h-48 overflow-hidden rounded-t-lg flex items-center justify-center bg-gray-50 p-4">
          <img
            src={item.logoUrl}
            alt={item.name}
            className="max-h-32 max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <CardContent className="p-4">
        <h4 className="font-semibold text-sm line-clamp-1 mb-2 text-center">
          {item.name || 'Unnamed Partner'}
        </h4>
      </CardContent>
    </>
  );

  return (
    <ContentGridTab
      title="Manage Partners"
      addButtonLabel="Add Partner"
      items={partners}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      renderCard={renderPartnerCard}
    />
  );
}
