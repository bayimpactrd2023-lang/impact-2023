/**
 * Search Bar Component
 * 
 * Reusable search input with clear button.
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

export interface SearchBarProps {
  /** Current search query */
  value: string;
  
  /** Handler for search change */
  onChange: (value: string) => void;
  
  /** Handler for clear */
  onClear?: () => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Search bar component
 * 
 * Features:
 * - Search icon
 * - Clear button (when has value)
 * - Responsive width
 * - Accessible labels
 */
export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
}: SearchBarProps) {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      
      {/* Input */}
      <Input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
        aria-label="Search"
      />
      
      {/* Clear Button */}
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
