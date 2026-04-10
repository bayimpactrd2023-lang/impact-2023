import React, { useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { 
  List, 
  ListOrdered, 
  Highlighter,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

interface InteractiveRichEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export const InteractiveRichEditor: React.FC<InteractiveRichEditorProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    const selectedText = text.substring(start, end);

    const newText = 
      text.substring(0, start) + 
      before + 
      selectedText + 
      after + 
      text.substring(end);

    onChange(newText);

    // Focus back and set selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = start + before.length + selectedText.length + after.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const applyBullet = (type: 'bullet' | 'number') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const originalSelLength = end - start;
    
    // Find line boundaries
    const beforeText = text.substring(0, start);
    const lineStart = beforeText.lastIndexOf('\n') + 1;
    const afterText = text.substring(end);
    const lineEnd = end + (afterText.indexOf('\n') === -1 ? afterText.length : afterText.indexOf('\n'));
    
    // Get the full lines that cover the selection
    const fullBefore = text.substring(0, lineStart);
    const fullAfter = text.substring(lineEnd);
    const linesToFormat = text.substring(lineStart, lineEnd);
    
    // Calculate selection offset within the formatted area
    const selStartInLines = start - lineStart;
    
    // Split and format lines
    const lines = linesToFormat.split('\n');
    let lineNumber = 1;
    
    const formattedLines = lines.map((line) => {
      // Remove existing bullet/number prefix if present
      const cleanedLine = line.replace(/^(- |\d+\. )/, '');
      // Apply new prefix
      const currentPrefix = type === 'number' ? `${lineNumber++}. ` : '- ';
      return cleanedLine.trim() ? currentPrefix + cleanedLine : line;
    });
    
    const formattedText = formattedLines.join('\n');
    const newText = fullBefore + formattedText + fullAfter;
    
    // Calculate new selection positions
    const prefixLength = type === 'number' ? 3 : 2; // "1. " or "- "
    const hadPrefix = lines[0]?.startsWith('- ') || /^\d+\. /.test(lines[0] || '');
    
    onChange(newText);

    // Restore focus and preserve selection
    setTimeout(() => {
      textarea.focus();
      // Keep selection adjusted for prefix changes
      const newStart = lineStart + selStartInLines + (hadPrefix ? 0 : prefixLength);
      const newEnd = newStart + originalSelLength + (formattedLines.length - 1) * (hadPrefix ? 0 : prefixLength);
      textarea.setSelectionRange(newStart, Math.min(newEnd, lineStart + formattedText.length));
    }, 0);
  };

  const applyHighlight = () => {
    insertText('[[', ']]');
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-semibold flex items-center gap-2">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-md border border-gray-200">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-600 hover:text-[#1887FC]"
            onClick={applyHighlight}
            title="Highlight selection"
          >
            <Highlighter className="w-4 h-4 mr-1" />
            <span className="text-xs">Highlight</span>
          </Button>

          <div className="w-[1px] h-4 bg-gray-300 mx-1" />

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
              <DropdownMenuItem onClick={() => applyBullet('bullet')} className="flex items-center gap-2">
                <List className="w-4 h-4" />
                <span>Bullet List (- )</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyBullet('number')} className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4" />
                <span>Numbered List (1. )</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={handleTextChange}
        rows={rows}
        placeholder={placeholder}
        className="font-sans text-sm leading-relaxed resize-y focus-visible:ring-[#1887FC]"
      />
      <p className="text-[10px] text-gray-400 italic">
        Tip: Select any text and click "Highlight" to wrap it in blue, or "List" to bullet/number all selected lines.
      </p>
    </div>
  );
};
