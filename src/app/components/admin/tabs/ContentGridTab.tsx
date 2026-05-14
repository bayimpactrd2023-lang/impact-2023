/**
 * Generic Content Grid Tab
 * 
 * A reusable tab component for displaying content in a grid with add/edit/delete actions.
 * Implements the Template Method Pattern for common tab layouts.
 */

import type { ReactNode, MouseEvent } from 'react';
import { Plus, Trash2, Edit, FileText } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';

interface ContentGridTabProps<T extends { id: string }> {
  /** Tab title */
  title: string | ReactNode;
  
  /** Button label for adding new items */
  addButtonLabel: string;
  
  /** Array of items to display */
  items: T[];
  
  /** Handler for add button click */
  onAdd: () => void;
  
  /** Handler for item click (edit) */
  onEdit: (item: T) => void;
  
  /** Handler for delete button click */
  onDelete: (id: string) => void;
  
  /** Render function for each card */
  renderCard: (item: T) => ReactNode;
  
  /** Optional: Number of columns for different screen sizes */
  gridCols?: {
    sm: number;
    md: number;
    lg: number;
  };
}

/**
 * Generic content grid tab component
 * 
 * Provides a consistent layout for content management tabs:
 * - Header with title and add button
 * - Grid of cards
 * - Edit/delete actions on each card
 */
export function ContentGridTab<T extends { id: string }>({
  title,
  addButtonLabel,
  items,
  onAdd,
  onEdit,
  onDelete,
  renderCard,
  gridCols = { sm: 2, md: 2, lg: 3 },
}: ContentGridTabProps<T>) {
  // Initialize delete confirmation hook
  const { confirmDelete, DeleteConfirmDialog } = useDeleteConfirmation();
  
  /**
   * Handle delete confirmation
   */
  const handleDelete = async (e: MouseEvent, id: string, itemName: string) => {
    e.stopPropagation();
    const confirmed = await confirmDelete({ itemName: itemName.toLowerCase() });
    if (confirmed) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="text-lg font-semibold">{title}</div>
        <Button onClick={onAdd} size="sm" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> {addButtonLabel}
        </Button>
      </div>

      {/* Grid of Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-${gridCols.sm} lg:grid-cols-${gridCols.lg} gap-4`}>
        {items.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No items yet. Click the button above to add your first item.</p>
          </div>
        ) : (
          items.map(item => (
            <Card
              key={item.id}
              className="cursor-pointer relative group"
              onClick={() => onEdit(item)}
            >
              {/* Delete Button - Always visible */}
              <div className="absolute top-2 left-2 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 shadow-sm"
                  onClick={e => handleDelete(e, item.id, typeof title === 'string' ? title : 'item')}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>

              {/* Card Content */}
              {renderCard(item)}

              {/* Edit Hint */}
              <CardContent className="px-4 pb-4">
                <div className="mt-3 flex items-center gap-2">
                  <Edit className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">Click to edit</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog />
    </div>
  );
}