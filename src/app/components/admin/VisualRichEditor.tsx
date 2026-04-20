import React, { useRef, useEffect, useState } from 'react';
import { SharedToolbar } from './SharedToolbar';
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
  showImageUpload?: boolean;
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
  onImageUpload,
  showImageUpload = false
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
        return;
      }
      
      // Wrap bare images
      const id = `img-${Date.now()}`;
      const wrapper = document.createElement('div');
      wrapper.className = "image-wrapper relative inline-block group float-left mr-12 mb-8";
      wrapper.setAttribute('data-id', id);
      wrapper.setAttribute('contenteditable', 'false');
      wrapper.style.cssText = "display: inline-block; position: relative; user-select: none; max-width: 45%;";
      
      // Move styles from img to wrapper if they are floating styles
      if (img.style.float) {
        wrapper.style.float = img.style.float;
        wrapper.style.marginRight = img.style.marginRight;
        wrapper.style.marginBottom = img.style.marginBottom;
        wrapper.style.marginLeft = img.style.marginLeft;
      }
      
      img.parentNode?.replaceChild(wrapper, img);
      wrapper.appendChild(img);
      img.className = "max-w-full rounded-2xl shadow-xl";
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
    // If the active element is an input or textarea, we should NOT trigger rich text commands
    // because they might be using a shared toolbar and we don't want to clear or corrupt
    // their value with HTML commands that only work for contentEditable.
    const activeEl = document.activeElement;
    const isInputOrTextarea = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

    if (isInputOrTextarea) {
      // For inputs/textareas, we only allow certain commands if we implement them,
      // but standard document.execCommand will likely fail or cause issues.
      // For now, we just return to prevent clearing or focused editor issues.
      return;
    }

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
    } else if (command === 'roman') {
      document.execCommand('insertOrderedList', false);
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let container = selection.getRangeAt(0).commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode!;
        const ol = (container as HTMLElement).closest('ol');
        if (ol) {
          ol.style.listStyleType = 'upper-roman';
        }
      }
    } else if (command === 'alpha') {
      document.execCommand('insertOrderedList', false);
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let container = selection.getRangeAt(0).commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode!;
        const ol = (container as HTMLElement).closest('ol');
        if (ol) {
          ol.style.listStyleType = 'lower-alpha';
        }
      }
    } else if (command === 'justifyLeft') {
      // Use standard alignment
      document.execCommand('justifyLeft', false);
      
      // Proactively fix alignment if execCommand is inconsistent
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let container = selection.getRangeAt(0).commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode!;
        
        const parentP = (container as HTMLElement).closest('p, div[contenteditable="true"] > div, h1, h2, h3');
        if (parentP && parentP.getAttribute('contenteditable') !== 'false') {
          (parentP as HTMLElement).style.textAlign = 'left';
        }
      }
    } else if (command === 'justifyCenter') {
      document.execCommand('justifyCenter', false);
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let container = selection.getRangeAt(0).commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode!;
        
        const parentP = (container as HTMLElement).closest('p, div[contenteditable="true"] > div, h1, h2, h3');
        if (parentP && parentP.getAttribute('contenteditable') !== 'false') {
          (parentP as HTMLElement).style.textAlign = 'center';
        }
      }
    } else if (command === 'justifyRight') {
      document.execCommand('justifyRight', false);
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let container = selection.getRangeAt(0).commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode!;
        
        const parentP = (container as HTMLElement).closest('p, div[contenteditable="true"] > div, h1, h2, h3');
        if (parentP && parentP.getAttribute('contenteditable') !== 'false') {
          (parentP as HTMLElement).style.textAlign = 'right';
        }
      }
    } else if (command === 'justifyFull') {
      document.execCommand('justifyFull', false);
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let container = selection.getRangeAt(0).commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode!;
        
        const parentP = (container as HTMLElement).closest('p, div[contenteditable="true"] > div, h1, h2, h3');
        if (parentP && parentP.getAttribute('contenteditable') !== 'false') {
          (parentP as HTMLElement).style.textAlign = 'justify';
        }
      }
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
    
    // Standard image alignment
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
        wrapper.className = "image-wrapper relative inline-block group float-left mr-12 mb-8";
        wrapper.style.display = 'inline-block';
        wrapper.style.float = 'left';
        wrapper.style.marginRight = '3rem';
        wrapper.style.marginLeft = '0';
        wrapper.style.marginBottom = '2rem';
        wrapper.style.textAlign = '';
        wrapper.style.width = 'fit-content';
        wrapper.style.maxWidth = '45%';
      } else if (side === 'center') {
        wrapper.className = "image-wrapper relative block group mx-auto mb-12";
        wrapper.style.display = 'block';
        wrapper.style.float = 'none';
        wrapper.style.marginRight = 'auto';
        wrapper.style.marginLeft = 'auto';
        wrapper.style.textAlign = 'center';
        wrapper.style.width = 'fit-content';
        wrapper.style.maxWidth = '85%';
      } else {
        wrapper.className = "image-wrapper relative inline-block group float-right ml-12 mb-8";
        wrapper.style.display = 'inline-block';
        wrapper.style.float = 'right';
        wrapper.style.marginLeft = '3rem';
        wrapper.style.marginRight = '0';
        wrapper.style.marginBottom = '2rem';
        wrapper.style.textAlign = '';
        wrapper.style.width = 'fit-content';
        wrapper.style.maxWidth = '45%';
      }
      handleInput();
    }
  };

  const insertImage = (url: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      // Find current selection to see if we are updating an image
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode!;
        
        const existingImg = (container as HTMLElement).closest('img') || 
                           (container as HTMLElement).querySelector('img');
        
        if (existingImg) {
          existingImg.src = url;
          handleInput();
          return;
        }
      }

      // Create a wrapper for the image
      const id = `img-${Date.now()}`;
      const imgHtml = `
        <div class="image-wrapper relative inline-block group float-left mr-12 mb-8" data-id="${id}" contenteditable="false" style="position: relative; user-select: none; width: fit-content; max-width: 45%; display: inline-block; float: left; margin-right: 3rem; margin-bottom: 2rem;">
          <img src="${url}" class="max-w-full rounded-2xl shadow-xl cursor-pointer hover:ring-4 hover:ring-blue-500/30 transition-all duration-300" style="display: block; max-width: 100%; border-radius: 16px; width: 450px; height: auto;" />
        </div><p><br></p>`;
      
      document.execCommand('insertHTML', false, imgHtml);
      handleInput();
    }
  };

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
    
    // Convert newlines to paragraphs for better structure preservation
    const html = text
      .split(/\n\n+/)
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');
    
    if (html.includes('<p>')) {
      document.execCommand('insertHTML', false, html);
    } else {
      document.execCommand('insertText', false, text);
    }
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) {
          container = container.parentNode!;
        }

        // If an image is selected (via onMouseDown logic)
        const selectedImg = range.startContainer.nodeName === 'IMG' 
          ? range.startContainer 
          : (range.startContainer.childNodes[range.startOffset] as HTMLElement);

        if (selectedImg && (selectedImg as HTMLElement).tagName === 'IMG') {
          e.preventDefault();
          const wrapper = (selectedImg as HTMLElement).closest('.image-wrapper');
          if (wrapper) {
            const url = (selectedImg as HTMLImageElement).src;
            wrapper.remove();
            window.dispatchEvent(new CustomEvent('editor-image-deleted', { detail: { id, url } }));
            handleInput();
          }
          return;
        }
      }
    }

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

      // If this is a single editor component (not one of many in a form)
      // or if it's the active one
      const activeEl = document.activeElement;
      const isActive = activeEl && (activeEl.id === id || editorRef.current?.contains(activeEl));
      
      // Special case: if we're calling handleImageFile or insertImage, 
      // we might have lost focus to the toolbar/dialog, so we should be less strict 
      // if this is the targeted editor by ID
      const isTargeted = e.type === `editor-command-${id}`;

      if (command === 'insertImage') {
        if (isActive || isTargeted) insertImage(cmdValue);
      } else if (command === 'handleImageFile') {
        if (isActive || isTargeted) handleImageFile(cmdValue);
      } else if (command === 'alignImage') {
        if (isActive || isTargeted) alignImage(cmdValue as any);
      } else if (command === 'deleteSelectedImage') {
        if (isActive || isTargeted) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedImg = range.startContainer.nodeName === 'IMG' 
              ? range.startContainer 
              : (range.startContainer.childNodes[range.startOffset] as HTMLElement);

            if (selectedImg && (selectedImg as HTMLElement).tagName === 'IMG') {
              const wrapper = (selectedImg as HTMLElement).closest('.image-wrapper');
              if (wrapper) {
                const url = (selectedImg as HTMLImageElement).src;
                wrapper.remove();
                window.dispatchEvent(new CustomEvent('editor-image-deleted', { detail: { id, url } }));
                handleInput();
              }
            }
          }
        }
      } else {
        if (isActive || isTargeted) execCommand(command, cmdValue);
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
            showImageUpload={showImageUpload}
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
            // If we click an image, explicitly select it
            if ((e.target as HTMLElement).tagName === 'IMG') {
              const target = e.target as HTMLElement;

              // Remove selection class from all images first
              if (editorRef.current) {
                editorRef.current.querySelectorAll('img').forEach(img => {
                  img.style.outline = '';
                  img.style.boxShadow = '';
                });
              }
              
              // Add selection style to current image (only for editor)
              target.style.outline = '4px solid #3b82f633';
              target.style.boxShadow = '0 0 0 2px #3b82f6';

              const range = document.createRange();
              range.selectNode(e.target as Node);
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
            } else {
              // Clear selection styles if clicking elsewhere
              if (editorRef.current) {
                editorRef.current.querySelectorAll('img').forEach(img => {
                  img.style.outline = '';
                  img.style.boxShadow = '';
                });
              }
            }
          }}
          onDragStart={(e) => {
            // If dragging an image inside the editor, handle it
            if ((e.target as HTMLElement).tagName === 'IMG') {
              const target = e.target as HTMLImageElement;
              const wrapper = target.closest('.image-wrapper') as HTMLElement;
              
              // Store the ID of the image being moved
              if (wrapper && wrapper.getAttribute('data-id')) {
                e.dataTransfer.setData('text/plain', `move-image:${wrapper.getAttribute('data-id')}`);
                e.dataTransfer.effectAllowed = 'move';
              }
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(e) => {
            const data = e.dataTransfer.getData('text/plain');
            if (data && data.startsWith('move-image:')) {
              e.preventDefault();
              const imageId = data.split(':')[1];
              const wrapper = editorRef.current?.querySelector(`[data-id="${imageId}"]`);
              
              if (wrapper && editorRef.current) {
                // Get the drop position
                const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                if (range) {
                  // Move the existing element to the new position
                  range.insertNode(wrapper);
                  
                  // Clean up selection
                  const selection = window.getSelection();
                  selection?.removeAllRanges();
                  selection?.addRange(range);
                  
                  handleInput();
                }
              }
            }
          }}
          className="w-full h-full min-h-[inherit] p-3 outline-none empty:before:content-[attr(data-placeholder)] prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_img]:cursor-pointer text-sm sm:text-base leading-relaxed [&_p]:display-flow-root [&_p]:break-words [&_div]:break-words"
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
