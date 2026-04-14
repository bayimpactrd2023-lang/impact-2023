import React, { useRef, useEffect, useState } from 'react';
import { SharedToolbar } from '@/app/components/admin/SharedToolbar';
import { Label } from '@/app/components/ui/label';
import { cn } from "@/app/components/ui/utils";

interface VisualRichEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  showToolbar?: boolean;
  onCommand?: (command: string, value?: string) => void;
  onImageUpload?: (file: File) => void;
}

export const VisualRichEditor: React.FC<VisualRichEditorProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  showToolbar = true,
  onCommand,
  onImageUpload
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
    // Ensure the editor is focused before applying the command
    if (editorRef.current) {
      editorRef.current.focus();
    }

    if (onCommand) {
      onCommand(command, value);
    }

    if (command === 'bold') {
      document.execCommand('bold', false);
    } else if (command === 'foreColor') {
      document.execCommand('foreColor', false, value);
    } else if (command === 'bullet') {
      document.execCommand('insertUnorderedList', false);
    } else if (command === 'number') {
      document.execCommand('insertOrderedList', false);
    }
    
    handleInput();
  };

  const alignImage = (side: 'left' | 'right') => {
    if (!editorRef.current) return;
    
    // Find the image in the current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    let container = selection.getRangeAt(0).commonAncestorContainer;
    if (container.nodeType === 3) {
      container = container.parentNode!;
    }
    
    // Check if the container is an image or contains an image
    const images = (container as HTMLElement).querySelectorAll?.('img');
    let targetImg = (container.nodeName === 'IMG' ? container : (images?.length === 1 ? images[0] : null)) as HTMLImageElement;
    
    // Proactive search for any image in the editor if nothing is directly selected
    if (!targetImg && editorRef.current) {
      const allImgs = editorRef.current.querySelectorAll('img');
      if (allImgs.length > 0) {
        // Find the image closest to the selection or just the first one if only one exists
        targetImg = allImgs.length === 1 ? allImgs[0] : (selection.anchorNode?.parentElement?.querySelector('img') || allImgs[0]);
      }
    }
    
    if (targetImg) {
      if (side === 'left') {
        targetImg.className = "float-left mr-4 mb-4 max-w-[50%] rounded-lg shadow-md";
        targetImg.style.float = 'left';
        targetImg.style.marginRight = '16px';
        targetImg.style.marginLeft = '0';
      } else {
        targetImg.className = "float-right ml-4 mb-4 max-w-[50%] rounded-lg shadow-md";
        targetImg.style.float = 'right';
        targetImg.style.marginLeft = '16px';
        targetImg.style.marginRight = '0';
      }
      handleInput();
    }
  };

  const insertImage = (url: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      // Create an image element that floats left by default
      const imgHtml = `<img src="${url}" class="float-left mr-4 mb-4 max-w-[50%] rounded-lg shadow-md" style="float: left; margin-right: 16px; margin-bottom: 16px; max-width: 50%; border-radius: 8px;" />`;
      document.execCommand('insertHTML', false, imgHtml);
      handleInput();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

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

  // Listen for commands from parent toolbar
  useEffect(() => {
    const handleToolbarCommand = (e: any) => {
      const { command, value: cmdValue } = e.detail;
      if (command === 'insertImage') {
        insertImage(cmdValue);
      } else if (command === 'alignImage') {
        alignImage(cmdValue);
      } else {
        execCommand(command, cmdValue);
      }
    };

    window.addEventListener(`editor-command-${id}`, handleToolbarCommand);
    return () => {
      window.removeEventListener(`editor-command-${id}`, handleToolbarCommand);
    };
  }, [id]);

  return (
    <div className="space-y-1.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        
        {showToolbar && (
          <SharedToolbar 
            onCommand={execCommand} 
            onImageUpload={onImageUpload}
          />
        )}
      </div>

      <div
        className={cn(
          "relative font-sans text-sm leading-relaxed border rounded-2xl bg-white transition-all duration-300",
          isFocused ? "ring-4 ring-blue-500/20 border-blue-500 shadow-sm" : "border-gray-200 hover:border-gray-300"
        )}
        style={{ minHeight: `${rows * 24}px` }}
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
          onFocus={() => {
            handleFocus();
            if (onCommand) onCommand('focus');
          }}
          onBlur={handleBlur}
          onPaste={handlePaste}
          onMouseDown={(e) => {
            // If we click an image, explicitly select it
            if ((e.target as HTMLElement).tagName === 'IMG') {
              const range = document.createRange();
              range.selectNode(e.target as Node);
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
          }}
          className="w-full h-full min-h-[inherit] p-3 outline-none empty:before:content-[attr(data-placeholder)] prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
          style={{ minHeight: `${rows * 24}px` }}
          suppressContentEditableWarning
        />
      </div>

      <p className="text-[10px] text-gray-400 italic">
        Tip: Select text and click Bold, Highlight, or List to format.
      </p>
    </div>
  );
};


export default VisualRichEditor;
