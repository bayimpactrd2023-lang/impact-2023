import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { 
  List, 
  ListOrdered, 
  Highlighter,
  Bold,
  ChevronDown,
  Type
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/app/components/ui/utils";

interface SharedToolbarProps {
  onCommand: (command: string, value?: string) => void;
  className?: string;
}

export const SharedToolbar: React.FC<SharedToolbarProps> = ({ 
  onCommand, 
  className
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean;
    blue: boolean;
    bullet: boolean;
    number: boolean;
  }>({
    bold: false,
    blue: false,
    bullet: false,
    number: false
  });
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkFormats = () => {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        blue: document.queryCommandValue('foreColor') === 'rgb(24, 135, 252)' || document.queryCommandValue('foreColor') === '#1887fc',
        bullet: document.queryCommandState('insertUnorderedList'),
        number: document.queryCommandState('insertOrderedList')
      });
    };

    document.addEventListener('selectionchange', checkFormats);
    document.addEventListener('mouseup', checkFormats);
    document.addEventListener('keyup', checkFormats);

    return () => {
      document.removeEventListener('selectionchange', checkFormats);
      document.removeEventListener('mouseup', checkFormats);
      document.removeEventListener('keyup', checkFormats);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!toolbarRef.current) return;
      // If the toolbar's original position would be above the viewport
      // We check the parent's position to know when to stick
      const parent = toolbarRef.current.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        setIsSticky(parentRect.top <= 100); // 100px from top (modal header height approx)
      }
    };

    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div 
      ref={toolbarRef}
      className={cn(
        "z-50 transition-all duration-200 py-2",
        isSticky ? "sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm -mx-1 px-1" : "",
        className
      )}
    >
      <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-xl border border-gray-200 w-fit shadow-inner">
        {/* Bold */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3 text-gray-600 hover:text-[#1887FC] hover:bg-blue-50 font-bold rounded-lg transition-all duration-200",
            activeFormats.bold ? "bg-blue-100 text-[#1887FC] shadow-sm scale-95" : ""
          )}
          onClick={() => onCommand('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4 mr-1.5" />
          <span className="text-xs">Bold</span>
        </Button>

        <div className="w-[1px] h-4 bg-gray-300 mx-1" />

        {/* Highlight/Color */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 text-gray-600 hover:text-[#1887FC] hover:bg-blue-50 rounded-lg transition-all duration-200",
                activeFormats.blue ? "bg-blue-100 text-[#1887FC] shadow-sm scale-95" : ""
              )}
            >
              <Highlighter className="w-4 h-4 mr-1.5" style={{ color: '#1887FC' }} />
              <span className="text-xs text-[#1887FC]">Highlight</span>
              <ChevronDown className="w-3 h-3 ml-1.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-xl border-gray-200 shadow-lg">
            <DropdownMenuItem 
              onClick={() => onCommand('foreColor', '#1887FC')} 
              className={cn(
                "flex items-center gap-2 cursor-pointer focus:bg-blue-50",
                activeFormats.blue ? "bg-blue-50 font-semibold" : ""
              )}
            >
              <span className="w-4 h-4 rounded-full bg-[#1887FC]" />
              <span className="text-[#1887FC] font-medium">Blue Text</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCommand('foreColor', 'black')} className="flex items-center gap-2 cursor-pointer focus:bg-gray-100">
              <Type className="w-4 h-4" />
              <span>Normal Text</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-[1px] h-4 bg-gray-300 mx-1" />

        {/* List Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 text-gray-600 hover:text-[#1887FC] hover:bg-blue-50 rounded-lg transition-all duration-200",
                (activeFormats.bullet || activeFormats.number) ? "bg-blue-100 text-[#1887FC] shadow-sm scale-95" : ""
              )}
            >
              <List className="w-4 h-4 mr-1.5" />
              <span className="text-xs">List</span>
              <ChevronDown className="w-3 h-3 ml-1.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-xl border-gray-200 shadow-lg">
            <DropdownMenuItem 
              onClick={() => onCommand('bullet')} 
              className={cn(
                "flex items-center gap-2 cursor-pointer focus:bg-blue-50",
                activeFormats.bullet ? "bg-blue-50 font-semibold" : ""
              )}
            >
              <List className="w-4 h-4" />
              <span>Bullet List</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onCommand('number')} 
              className={cn(
                "flex items-center gap-2 cursor-pointer focus:bg-blue-50",
                activeFormats.number ? "bg-blue-50 font-semibold" : ""
              )}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Numbered List</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
