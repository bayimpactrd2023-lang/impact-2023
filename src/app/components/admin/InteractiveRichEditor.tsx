import React, { useRef, useState, useEffect } from 'react';
import { SharedToolbar } from '@/app/components/admin/SharedToolbar';
import { cn } from "@/app/components/ui/utils";
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';

interface InteractiveRichEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  showToolbar?: boolean;
  onCommand?: (command: string, value?: string) => void;
}

export const InteractiveRichEditor: React.FC<InteractiveRichEditorProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  showToolbar = true,
  onCommand
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Listen for commands from parent toolbar
  useEffect(() => {
    const handleToolbarCommand = (e: any) => {
      const { command, value: cmdValue } = e.detail;
      handleCommand(command, cmdValue);
    };

    window.addEventListener(`editor-command-${id}`, handleToolbarCommand);
    return () => {
      window.removeEventListener(`editor-command-${id}`, handleToolbarCommand);
    };
  }, [id]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    const selectedText = text.substring(start, end);

    // Do nothing if no text is selected
    if (start === end) return;

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

    // Do nothing if no text is selected
    if (originalSelLength === 0) return;
    
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      if (start === end) {
        // No selection, just insert 4 spaces
        const newText = text.substring(0, start) + '    ' + text.substring(end);
        onChange(newText);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(start + 4, start + 4);
          }
        }, 0);
      } else {
        // Multi-line indentation
        const beforeText = text.substring(0, start);
        const lineStart = beforeText.lastIndexOf('\n') + 1;
        const afterText = text.substring(end);
        const lineEnd = end + (afterText.indexOf('\n') === -1 ? afterText.length : afterText.indexOf('\n'));

        const selectionText = text.substring(lineStart, lineEnd);
        const indentedText = selectionText.split('\n').map(line => '    ' + line).join('\n');
        
        const newText = text.substring(0, lineStart) + indentedText + text.substring(lineEnd);
        onChange(newText);

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            // Select the newly indented lines
            textareaRef.current.setSelectionRange(lineStart, lineStart + indentedText.length);
          }
        }, 0);
      }
    }
  };

  const handleCommand = (command: string, _value?: string) => {
    // If we're using a single shared toolbar, we need to handle the focus properly
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    if (onCommand) {
       onCommand(command, _value);
       // We don't return here because we still want to apply the command locally
       // if it's meant for this editor.
    }

    switch(command) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'highlight':
        insertText('[[', ']]');
        break;
      case 'bullet':
        applyBullet('bullet');
        break;
      case 'number':
        applyBullet('number');
        break;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-semibold flex items-center gap-2">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        
        {showToolbar && (
          <SharedToolbar onCommand={handleCommand} />
        )}
      </div>

      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={handleTextChange}
        onFocus={() => {
          setIsFocused(true);
          if (onCommand) onCommand('focus'); // Notify parent that this field is active
        }}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        rows={rows}
        placeholder={placeholder}
        className={cn(
          "font-sans text-sm leading-relaxed resize-y transition-all duration-200",
          isFocused ? "ring-2 ring-[#1887FC] border-[#1887FC]" : "border-gray-200"
        )}
      />
      <p className="text-[10px] text-gray-400 italic">
        Tip: Select text and click "Bold" for **bold**, "Highlight" for blue, or "List" for bullets/numbers.
      </p>
    </div>
  );
};

