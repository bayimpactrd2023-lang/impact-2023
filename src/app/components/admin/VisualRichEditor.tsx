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

  const hydrateImages = (html: string): string => {
    if (!html) return html;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');
    
    images.forEach(img => {
      // Skip if already wrapped
      if (img.parentElement?.classList.contains('image-wrapper')) {
        // Ensure buttons/handles exist even if wrapped (might have been stripped on save)
        const wrapper = img.parentElement;
        if (!wrapper.querySelector('.delete-image-btn')) {
          const id = wrapper.getAttribute('data-id') || `img-${Date.now()}`;
          const url = img.src;
          
          // Add resize handle
          if (!wrapper.querySelector('.resize-handle')) {
            const handle = document.createElement('div');
            handle.className = "resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity rounded-tl-md";
            handle.style.cssText = "position: absolute; bottom: 0; right: 0; width: 16px; height: 16px; background: #3b82f6; cursor: se-resize; border-top-left-radius: 4px;";
            wrapper.appendChild(handle);
          }
          
          // Add delete button
          const btn = document.createElement('button');
          btn.className = "delete-image-btn absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity";
          btn.type = "button";
          btn.style.cssText = "position: absolute; top: 8px; right: 8px; background: #ef4444; color: white; border-radius: 9999px; padding: 4px; border: none; cursor: pointer; line-height: 1;";
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
          btn.onclick = () => {
            wrapper.remove();
            window.dispatchEvent(new CustomEvent('editor-image-deleted', { detail: { id, url } }));
            handleInput();
          };
          wrapper.appendChild(btn);
        }
        return;
      }
      
      // Wrap bare images
      const id = `img-${Date.now()}`;
      const url = img.src;
      const wrapper = document.createElement('div');
      wrapper.className = "image-wrapper relative inline-block group float-left mr-4 mb-4";
      wrapper.setAttribute('data-id', id);
      wrapper.setAttribute('contenteditable', 'false');
      wrapper.style.cssText = "display: inline-block; position: relative; user-select: none;";
      
      // Move styles from img to wrapper if they are floating styles
      if (img.style.float) {
        wrapper.style.float = img.style.float;
        wrapper.style.marginRight = img.style.marginRight;
        wrapper.style.marginBottom = img.style.marginBottom;
        wrapper.style.marginLeft = img.style.marginLeft;
      }
      
      img.parentNode?.replaceChild(wrapper, img);
      wrapper.appendChild(img);
      img.className = "resizable-image max-w-full rounded-lg shadow-md";
      
      // Add resize handle
      const handle = document.createElement('div');
      handle.className = "resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity rounded-tl-md";
      handle.style.cssText = "position: absolute; bottom: 0; right: 0; width: 16px; height: 16px; background: #3b82f6; cursor: se-resize; border-top-left-radius: 4px;";
      wrapper.appendChild(handle);
      
      // Add delete button
      const btn = document.createElement('button');
      btn.className = "delete-image-btn absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity";
      btn.type = "button";
      btn.style.cssText = "position: absolute; top: 8px; right: 8px; background: #ef4444; color: white; border-radius: 9999px; padding: 4px; border: none; cursor: pointer; line-height: 1;";
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      btn.onclick = () => {
        wrapper.remove();
        window.dispatchEvent(new CustomEvent('editor-image-deleted', { detail: { id, url } }));
        handleInput();
      };
      wrapper.appendChild(btn);
    });
    
    return doc.body.innerHTML;
  };

  // Sync external value to editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      const hydratedHtml = hydrateImages(value || '');
      editorRef.current.innerHTML = hydratedHtml;
      setShowPlaceholder(!hydratedHtml || hydratedHtml === '<br>' || hydratedHtml === '<div><br></div>' || hydratedHtml === '<p><br></p>');
    }
  }, [value]);

  // Track image deletions (backspace/delete)
  useEffect(() => {
    if (!editorRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          // Check if the removed node is an image-wrapper or contains an image
          const removedEl = node as HTMLElement;
          if (removedEl.nodeType === 1) {
            const imgs = removedEl.querySelectorAll ? removedEl.querySelectorAll('img') : [];
            const imagesToProcess = removedEl.tagName === 'IMG' ? [removedEl as HTMLImageElement] : Array.from(imgs) as HTMLImageElement[];
            
            imagesToProcess.forEach(img => {
              const src = img.src;
              // Only track actual cloud URLs (not base64)
              if (src && !src.startsWith('data:')) {
                window.dispatchEvent(new CustomEvent('editor-image-deleted', { 
                  detail: { id: id, url: src } 
                }));
              }
            });
          }
        });
      });
    });

    observer.observe(editorRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [id]);

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
    } else if (command === 'justifyLeft') {
      document.execCommand('justifyLeft', false);
    } else if (command === 'justifyCenter') {
      document.execCommand('justifyCenter', false);
    } else if (command === 'justifyRight') {
      document.execCommand('justifyRight', false);
    } else if (command === 'justifyFull') {
      document.execCommand('justifyFull', false);
    }
    
    handleInput();
  };

  const alignImage = (side: 'left' | 'right' | 'center') => {
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
      const wrapper = targetImg.closest('.image-wrapper') as HTMLElement || targetImg;
      
      if (side === 'left') {
        wrapper.className = "image-wrapper relative inline-block group float-left mr-4 mb-4";
        wrapper.style.display = 'inline-block';
        wrapper.style.float = 'left';
        wrapper.style.marginRight = '16px';
        wrapper.style.marginLeft = '0';
        wrapper.style.textAlign = 'left';
        wrapper.style.width = 'fit-content';
      } else if (side === 'center') {
        wrapper.className = "image-wrapper relative block group mx-auto mb-4";
        wrapper.style.display = 'block';
        wrapper.style.float = 'none';
        wrapper.style.marginRight = 'auto';
        wrapper.style.marginLeft = 'auto';
        wrapper.style.textAlign = 'center';
        wrapper.style.width = 'fit-content';
      } else {
        wrapper.className = "image-wrapper relative inline-block group float-right ml-4 mb-4";
        wrapper.style.display = 'inline-block';
        wrapper.style.float = 'right';
        wrapper.style.marginLeft = '16px';
        wrapper.style.marginRight = '0';
        wrapper.style.textAlign = 'right';
        wrapper.style.width = 'fit-content';
      }
      handleInput();
    }
  };

  const insertImage = (url: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      // Create a wrapper for the image and the delete button
      // Use data-type="image-wrapper" to identify it for deletion logic
      const id = `img-${Date.now()}`;
      const imgHtml = `
        <div class="image-wrapper relative inline-block group float-left mr-4 mb-4" data-id="${id}" contenteditable="false" style="display: inline-block; position: relative; user-select: none;">
          <img src="${url}" class="resizable-image max-w-full rounded-lg shadow-md" style="display: block; max-width: 100%; border-radius: 8px; width: 300px; height: auto;" />
          <div class="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity rounded-tl-md" style="position: absolute; bottom: 0; right: 0; width: 16px; height: 16px; background: #3b82f6; cursor: se-resize; border-top-left-radius: 4px;"></div>
          <button 
            class="delete-image-btn absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" 
            onclick="this.parentElement.remove(); window.dispatchEvent(new CustomEvent('editor-image-deleted', { detail: { id: '${id}', url: '${url}' } }));"
            type="button"
            style="position: absolute; top: 8px; right: 8px; background: #ef4444; color: white; border-radius: 9999px; padding: 4px; border: none; cursor: pointer; line-height: 1;"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div><p><br></p>`;
      
      document.execCommand('insertHTML', false, imgHtml);
      handleInput();
    }
  };

  const [isResizing, setIsResizing] = useState(false);
  const [resizingTarget, setResizingTarget] = useState<HTMLElement | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      e.preventDefault();
      setIsResizing(true);
      const wrapper = target.parentElement;
      const img = wrapper?.querySelector('img');
      if (img) {
        setResizingTarget(img);
        setStartX(e.clientX);
        setStartWidth(img.offsetWidth);
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && resizingTarget) {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(50, startWidth + deltaX);
        resizingTarget.style.width = `${newWidth}px`;
        resizingTarget.style.height = 'auto'; // Maintain aspect ratio
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        setResizingTarget(null);
        handleInput();
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizingTarget, startX, startWidth]);

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      insertImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        // Fallback to simple insertion if no selection
        document.execCommand('insertText', false, '    ');
        handleInput();
        return;
      }

      const range = selection.getRangeAt(0);
      
      // If no text is selected, just insert 4 spaces
      if (range.collapsed) {
        document.execCommand('insertText', false, '    ');
      } else {
        // Multi-line indentation logic
        const content = range.cloneContents();
        const div = document.createElement('div');
        div.appendChild(content);
        
        // Split by lines/paragraphs and indent
        const html = div.innerHTML;
        const indentedHtml = html.split(/<br\/?>|<\/p><p>/i).map(line => {
          if (line.trim() === '') return line;
          return '&nbsp;&nbsp;&nbsp;&nbsp;' + line;
        }).join('<br>');

        document.execCommand('insertHTML', false, indentedHtml);
      }
      handleInput();
    }
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
      } else if (command === 'handleImageFile') {
        handleImageFile(cmdValue);
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
          "relative font-sans text-xs sm:text-sm leading-relaxed border rounded-2xl bg-white transition-all duration-300 after:content-[''] after:table after:clear-both",
          isFocused ? "ring-4 ring-blue-500/20 border-blue-500 shadow-sm" : "border-gray-200 hover:border-gray-300"
        )}
        style={{ minHeight: `${rows * 24}px` }}
      >
        {showPlaceholder && (
          <div className="absolute top-3 left-3 text-gray-400 pointer-events-none select-none text-xs sm:text-sm">
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
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => {
            handleMouseDown(e);
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
