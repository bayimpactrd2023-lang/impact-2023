import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
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

interface VisualRichEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export const VisualRichEditor: React.FC<VisualRichEditorProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(!value || value === '<br>' || value === '<div><br></div>');

  // Sync external value to editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
      setShowPlaceholder(!value || value === '<br>' || value === '<div><br></div>' || value === '<p><br></p>');
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setShowPlaceholder(!html || html === '<br>' || html === '<div><br></div>' || html === '<p><br></p>');
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  const toggleBold = () => execCommand('bold');
  const applyBlueText = () => execCommand('foreColor', '#1887FC');
  const applyBlackText = () => execCommand('foreColor', 'black');
  const insertBulletList = () => execCommand('insertUnorderedList');
  const insertNumberedList = () => execCommand('insertOrderedList');

  // Handle paste to strip formatting
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Clear placeholder on first focus
  const handleFocus = () => {
    setIsFocused(true);
    if (showPlaceholder && editorRef.current) {
      editorRef.current.innerHTML = '';
      setShowPlaceholder(false);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (editorRef.current && !editorRef.current.textContent?.trim()) {
      setShowPlaceholder(true);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-semibold flex items-center gap-2">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-md border border-gray-200">
          {/* Bold */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-600 hover:text-[#1887FC] font-bold"
            onClick={toggleBold}
            title="Bold"
          >
            <Bold className="w-4 h-4 mr-1" />
            <span className="text-xs">Bold</span>
          </Button>

          <div className="w-[1px] h-4 bg-gray-300 mx-1" />

          {/* Highlight Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-gray-600 hover:text-[#1887FC]"
              >
                <Highlighter className="w-4 h-4 mr-1" style={{ color: '#1887FC' }} />
                <span className="text-xs text-[#1887FC]">Blue Text</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={applyBlueText} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#1887FC]" />
                <span className="text-[#1887FC]">Blue Text</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={applyBlackText} className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <span>Black Text (Normal)</span>
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
                className="h-8 px-2 text-gray-600 hover:text-[#1887FC]"
              >
                <List className="w-4 h-4 mr-1" />
                <span className="text-xs">List</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={insertBulletList} className="flex items-center gap-2">
                <List className="w-4 h-4" />
                <span>Bullet List</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={insertNumberedList} className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4" />
                <span>Numbered List</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        className={`
          relative min-h-[${rows * 24}px] 
          font-sans text-sm leading-relaxed
          border rounded-md 
          ${isFocused ? 'ring-2 ring-[#1887FC] border-[#1887FC]' : 'border-input'}
          bg-white
        `}
      >
        {showPlaceholder && (
          <div className="absolute top-3 left-3 text-gray-400 pointer-events-none select-none">
            {placeholder || 'Enter text...'}
          </div>
        )}
        <div
          ref={editorRef}
          id={id}
          contentEditable
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPaste={handlePaste}
          className="w-full h-full min-h-[inherit] p-3 outline-none empty:before:content-[attr(data-placeholder)]"
          style={{ minHeight: `${rows * 24}px` }}
          suppressContentEditableWarning
        />
      </div>

      <p className="text-[10px] text-gray-400 italic">
        Tip: Select text and click Bold, Blue Text, or List to format. Selected text will appear with blue color.
      </p>
    </div>
  );
};

export default VisualRichEditor;
