import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { 
  List, 
  ListOrdered, 
  Highlighter,
  Bold,
  ChevronDown,
  Image as ImageIcon,
  Trash2,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
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
  onImageUpload?: (file: File) => void;
}

export const SharedToolbar: React.FC<SharedToolbarProps> = ({ 
  onCommand, 
  className,
  onImageUpload
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean;
    blue: boolean;
    bullet: boolean;
    number: boolean;
    alignLeft: boolean;
    alignCenter: boolean;
    alignRight: boolean;
    alignJustify: boolean;
  }>({
    bold: false,
    blue: false,
    bullet: false,
    number: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false
  });
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkFormats = () => {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        blue: document.queryCommandValue('foreColor') === 'rgb(24, 135, 252)' || document.queryCommandValue('foreColor') === '#1887fc',
        bullet: document.queryCommandState('insertUnorderedList'),
        number: document.queryCommandState('insertOrderedList'),
        alignLeft: document.queryCommandState('justifyLeft'),
        alignCenter: document.queryCommandState('justifyCenter'),
        alignRight: document.queryCommandState('justifyRight'),
        alignJustify: document.queryCommandState('justifyFull')
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0.5 bg-gray-50/50 p-0.5 rounded-xl border border-gray-200 w-full sm:w-fit shadow-inner overflow-hidden">
        {/* Row 1: Bold & Highlight (Mobile) */}
        <div className="flex items-center gap-0.5 w-full sm:w-auto">
          {/* Bold */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2 sm:px-3 text-gray-600 hover:text-[#1887FC] hover:bg-blue-50 font-bold rounded-lg transition-all duration-200 flex-1 sm:flex-none shrink-0",
              activeFormats.bold ? "bg-blue-100 text-[#1887FC] shadow-sm scale-95" : ""
            )}
            onClick={() => onCommand('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4 mr-1 sm:mr-1.5" />
            <span className="text-[11px] sm:text-xs">Bold</span>
          </Button>

          <div className="w-[1px] h-4 bg-gray-300 mx-0.5" />

          {/* Highlight/Color */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 sm:px-3 text-gray-600 hover:text-[#1887FC] hover:bg-blue-50 rounded-lg transition-all duration-200 flex-1 sm:flex-none shrink-0",
                  activeFormats.blue ? "bg-blue-100 text-[#1887FC] shadow-sm scale-95" : ""
                )}
              >
                <Highlighter className="w-4 h-4 mr-1 sm:mr-1.5" style={{ color: '#1887FC' }} />
                <span className="text-[11px] sm:text-xs text-[#1887FC]">Highlight</span>
                <ChevronDown className="w-3 h-3 ml-1 sm:ml-1.5 opacity-50" />
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

          <div className="hidden sm:block w-[1px] h-4 bg-gray-300 mx-0.5" />
          
          {/* Combined Alignment Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 sm:px-3 text-gray-600 hover:text-[#1887FC] hover:bg-blue-50 rounded-lg transition-all duration-200 flex-1 sm:flex-none shrink-0 overflow-hidden",
                  (activeFormats.alignLeft || activeFormats.alignCenter || activeFormats.alignRight || activeFormats.alignJustify) ? "bg-blue-100 text-[#1887FC] shadow-sm scale-95" : ""
                )}
              >
                <div className="flex items-center min-w-0 overflow-hidden">
                  <AlignJustify className="w-4 h-4 mr-1 sm:mr-1.5 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold truncate">Align</span>
                  <ChevronDown className="w-3 h-3 ml-0.5 sm:ml-1.5 opacity-50 shrink-0" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl border-gray-200 shadow-lg min-w-[180px]">
              <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Text Alignment</div>
              <DropdownMenuItem 
                onClick={() => onCommand('justifyLeft')} 
                className={cn(
                  "flex items-center gap-2 cursor-pointer focus:bg-blue-50 py-2",
                  activeFormats.alignLeft ? "bg-blue-50 font-semibold text-[#1887FC]" : ""
                )}
              >
                <AlignLeft className="w-4 h-4" />
                <span>Align Left</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onCommand('justifyCenter')} 
                className={cn(
                  "flex items-center gap-2 cursor-pointer focus:bg-blue-50 py-2",
                  activeFormats.alignCenter ? "bg-blue-50 font-semibold text-[#1887FC]" : ""
                )}
              >
                <AlignCenter className="w-4 h-4" />
                <span>Align Center</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onCommand('justifyRight')} 
                className={cn(
                  "flex items-center gap-2 cursor-pointer focus:bg-blue-50 py-2",
                  activeFormats.alignRight ? "bg-blue-50 font-semibold text-[#1887FC]" : ""
                )}
              >
                <AlignRight className="w-4 h-4" />
                <span>Align Right</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onCommand('justifyFull')} 
                className={cn(
                  "flex items-center gap-2 cursor-pointer focus:bg-blue-50 py-2",
                  activeFormats.alignJustify ? "bg-blue-50 font-semibold text-[#1887FC]" : ""
                )}
              >
                <AlignJustify className="w-4 h-4" />
                <span>Justify</span>
              </DropdownMenuItem>

              {onImageUpload && (
                <>
                  <div className="h-px bg-gray-100 my-1" />
                  <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image Layout</div>
                  <DropdownMenuItem 
                    onClick={() => onCommand('alignImage', 'left')} 
                    className="flex items-center gap-2 cursor-pointer focus:bg-blue-50 py-2"
                  >
                    <AlignLeft className="w-4 h-4" />
                    <span>Float Left</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onCommand('alignImage', 'right')} 
                    className="flex items-center gap-2 cursor-pointer focus:bg-blue-50 py-2"
                  >
                    <AlignRight className="w-4 h-4" />
                    <span>Float Right</span>
                  </DropdownMenuItem>

                  <div className="h-px bg-gray-100 my-1" />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="w-[1px] h-4 bg-gray-300 mx-0.5 hidden sm:block" />

        {/* Image Upload & Actions */}
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 sm:px-3 text-gray-600 hover:text-[#1887FC] hover:bg-blue-50 rounded-lg transition-all duration-200"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file && onImageUpload) {
                  onImageUpload(file);
                }
              };
              input.click();
            }}
            title="Upload Image"
          >
            <ImageIcon className="w-4 h-4 mr-1 sm:mr-1.5" />
            <span className="text-[11px] sm:text-xs">Image</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 sm:px-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            onClick={() => onCommand('deleteSelectedImage')}
            title="Delete Selected Image"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="sm:hidden w-full h-[1px] bg-gray-200 my-0.5" />

        {/* Row 2: List, Image & Alignment (Mobile) */}
        <div className="flex items-center gap-0.5 w-full sm:w-auto">
          {/* List Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 sm:px-3 text-gray-600 hover:text-[#1887FC] hover:bg-blue-50 rounded-lg transition-all duration-200 flex-1 sm:flex-none shrink-0",
                  (activeFormats.bullet || activeFormats.number) ? "bg-blue-100 text-[#1887FC] shadow-sm scale-95" : ""
                )}
              >
                <List className="w-4 h-4 mr-1 sm:mr-1.5" />
                <span className="text-[11px] sm:text-xs">List</span>
                <ChevronDown className="w-3 h-3 ml-1 sm:ml-1.5 opacity-50" />
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
    </div>
  );
};
