import React, { useEffect, useRef } from 'react';

// Check if text contains HTML tags
const containsHTML = (text: string): boolean => {
  return /<\/?[a-z][\s\S]*>/i.test(text);
};

const decodeHTMLEntities = (text: string): string => {
  if (!text) return text;

  let decoded = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return decoded;
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = decoded;
  return textarea.value;
};

// URL regex pattern - matches http, https, and www URLs
const URL_REGEX = /(https?:\/\/[^\s<>"{}|\^`\[\]]+|www\.[^\s<>"{}|\^`\[\]]+\.[a-zA-Z]{2,}[^\s<>"{}|\^`\[\]]*)/g;

// Sanitize and clean HTML from WYSIWYG editor
const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
  // Remove editor-specific UI elements (buttons and resize handles)
  let cleaned = html
    .replace(/<button[^>]*class="[^"]*delete-image-btn[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '')
    .replace(/<div[^>]*class="[^"]*resize-handle[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // Remove persistent selection styles from images that might have been saved
  cleaned = cleaned.replace(/(<img[^>]*?style="[^"]*?)(outline|box-shadow|ring):[^;"]*;?/gi, '$1');
  cleaned = cleaned.replace(/class="[^"]*?ring-(?:4|blue-500|offset-2)[^"]*?"/gi, '');
  
  // Clean up inline styles that were meant only for the editor
  cleaned = cleaned.replace(/pointer-events:\s*auto;?/gi, '');
  cleaned = cleaned.replace(/user-select:\s*none;?/gi, '');

  // Remove extra ** that might be wrapped in <b> tags
  cleaned = cleaned.replace(/<b>\*\*/g, '<b>').replace(/\*\*<\/b>/g, '</b>');
  
  // Remove empty paragraphs
  cleaned = cleaned.replace(/<p>\s*(?:<br\s*\/?>|&nbsp;|\s)*\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '');
  
  // Replace multiple <br> with single <br> if they are adjacent
  cleaned = cleaned.replace(/(<br\s*\/?>\s*){2,}/gi, '<br>');
  
  // Replace <font color="..."> with <span style="color:..."> for better compatibility
  cleaned = cleaned.replace(
    /<font color="([^"]+)">/gi, 
    '<span style="color: $1;">'
  );
  cleaned = cleaned.replace(/<\/font>/gi, '</span>');
  
  // Note: We don't automatically convert URLs to <a> tags here because 
  // dangerouslySetInnerHTML is static. We'll handle it in useEffect for HTML content.
  
  return cleaned;
};

// Parse URLs and convert to clickable links
const parseUrls = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  URL_REGEX.lastIndex = 0; // Reset regex state
  while ((match = URL_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const url = match[0];
    const href = url.startsWith('http') ? url : `https://${url}`;
    const displayUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');

    parts.push(
      <a
        key={`url-${match.index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#1887FC] hover:text-[#0d6fd8] underline underline-offset-2 font-medium break-all"
        title={href}
        onClick={(e) => e.stopPropagation()}
      >
        {displayUrl.length > 50 ? displayUrl.slice(0, 47) + '...' : displayUrl}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

// Parse [[text]] syntax and convert to blue spans (processes URLs inside as well)
const parseHighlights = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      // Parse URLs in the text before this highlight
      parts.push(...parseUrls(text.slice(lastIndex, match.index)));
    }
    parts.push(
      <span key={match.index} className="text-[#1887FC] font-semibold">
        {match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    // Parse URLs in the remaining text
    parts.push(...parseUrls(text.slice(lastIndex)));
  }

  return parts;
};

// Parse markdown-style bold **text**
const parseBold = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /\*\*([^*]+)\*\*/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...parseHighlights(text.slice(lastIndex, match.index)));
    }
    parts.push(
      <strong key={match.index} className="font-bold">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(...parseHighlights(text.slice(lastIndex)));
  }

  return parts;
};

// Legacy parser for old markdown-style format
const parseLegacyFormat = (text: string, className: string): React.ReactNode => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList || currentList.items.length === 0) return;

    const ListTag = currentList.type === 'ul' ? 'ul' : 'ol';
    elements.push(
      <ListTag key={`list-${elements.length}`} className="list-disc pl-6 my-2 space-y-1">
        {currentList.items.map((item, idx) => (
          <li key={idx} className="text-gray-700">
            {parseBold(item)}
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for bullet list item
    if (trimmed.startsWith('- ')) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(line.trimStart().slice(2));
      continue;
    }

    // Check for numbered list item
    const numberedMatch = trimmed.match(/^(\d+)\.\s/);
    if (numberedMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(line.trimStart().slice(numberedMatch[0].length));
      continue;
    }

    // Regular paragraph text
    if (trimmed) {
      flushList();
      elements.push(
        <p key={`p-${i}`} className="mb-6 last:mb-0 whitespace-pre-wrap">
          {parseBold(line)}
        </p>
      );
    } else {
      flushList();
      elements.push(<div key={`spacer-${i}`} className="h-4" />);
    }
  }

  flushList();

  return <div className={`whitespace-pre-line ${className}`}>{elements}</div>;
};

// Component to render rich text with lists and highlighting
interface RichTextContentProps {
  text: string | undefined | null;
  enabled?: boolean;
  className?: string;
  onImageClick?: (url: string) => void;
}

export const RichTextContent: React.FC<RichTextContentProps> = ({ 
  text, 
  enabled = true,
  className = '',
  onImageClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-link URLs in HTML content after mount
  useEffect(() => {
    if (!containerRef.current || !text || !containsHTML(text)) return;

    const walkAndReplace = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const content = node.textContent || '';
        // Use a new regex instance for each check
        const urlRegex = new RegExp(URL_REGEX.source, 'g');
        if (urlRegex.test(content)) {
          const span = document.createElement('span');
          const parts = [];
          let lastIndex = 0;
          let match;
          
          urlRegex.lastIndex = 0;
          while ((match = urlRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
              parts.push(document.createTextNode(content.slice(lastIndex, match.index)));
            }
            
            const url = match[0];
            const href = url.startsWith('http') ? url : `https://${url}`;
            const link = document.createElement('a');
            link.href = href;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'text-[#1887FC] hover:text-[#0d6fd8] underline underline-offset-2 font-medium break-all';
            link.textContent = url.length > 50 ? url.slice(0, 47) + '...' : url;
            link.onclick = (e) => e.stopPropagation();
            parts.push(link);
            
            lastIndex = match.index + match[0].length;
          }
          
          if (lastIndex < content.length) {
            parts.push(document.createTextNode(content.slice(lastIndex)));
          }
          
          parts.forEach(p => span.appendChild(p));
          node.parentNode?.replaceChild(span, node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        
        // Handle images for full-screen modal and 404 errors
        if (el.tagName === 'IMG') {
          const img = el as HTMLImageElement;
          
          // Remove image if it fails to load (404)
          img.onerror = () => {
            console.warn('[RichTextContent] Removing broken image:', img.src);
            const wrapper = img.closest('.image-wrapper');
            if (wrapper) {
              wrapper.remove();
            } else {
              img.remove();
            }
          };

          if (onImageClick) {
            img.style.cursor = 'pointer';
            img.onclick = (e) => {
              e.stopPropagation();
              onImageClick(img.src);
            };
          }
        }

        // Don't process content inside existing links or buttons
        if (el.tagName !== 'A' && el.tagName !== 'BUTTON') {
          Array.from(el.childNodes).forEach(walkAndReplace);
        }
      }
    };

    walkAndReplace(containerRef.current);
  }, [text]);

  // Handle null/undefined/empty text gracefully
  if (!text) {
    return null;
  }

  if (!enabled) {
    return <>{text}</>;
  }

  const decodedText = decodeHTMLEntities(text);

  // Check if content is HTML (from WYSIWYG editor)
  if (containsHTML(decodedText)) {
    const cleanedHTML = sanitizeHTML(decodedText);
    return (
      <div 
        ref={containerRef}
        className={`prose prose-sm sm:prose-base max-w-none ${className} [&_a]:text-[#1887FC] [&_a]:underline [&_a:hover]:text-[#0d6fd8]
          [&_img]:max-sm:hidden [&_img]:rounded-2xl [&_img]:shadow-xl [&_img]:my-12 [&_img]:max-w-full [&_img]:w-full sm:[&_img]:w-auto
          [&_img.float-left]:float-none [&_img.float-left]:mx-auto [&_img.float-left]:mb-10 sm:[&_img.float-left]:float-left sm:[&_img.float-left]:mr-12 sm:[&_img.float-left]:max-w-[45%] sm:[&_img.float-left]:!w-[45%] sm:[&_img.float-left]:clear-left sm:[&_img.float-left]:-mt-2
          [&_img.float-right]:float-none [&_img.float-right]:mx-auto [&_img.float-right]:mb-10 sm:[&_img.float-right]:float-right sm:[&_img.float-right]:ml-12 sm:[&_img.float-right]:max-w-[45%] sm:[&_img.float-right]:!w-[45%] sm:[&_img.float-right]:clear-right sm:[&_img.float-right]:-mt-2
          [&_.image-wrapper.float-left]:float-none [&_.image-wrapper.float-left]:mx-auto [&_.image-wrapper.float-left]:mb-10 sm:[&_.image-wrapper.float-left]:float-left sm:[&_.image-wrapper.float-left]:mr-12 sm:[&_.image-wrapper.float-left]:max-w-[45%] sm:[&_.image-wrapper.float-left]:clear-left sm:[&_.image-wrapper.float-left]:-mt-25
          [&_.image-wrapper.float-right]:float-none [&_.image-wrapper.float-right]:mx-auto [&_.image-wrapper.float-right]:mb-10 sm:[&_.image-wrapper.float-right]:float-right sm:[&_.image-wrapper.float-right]:ml-12 sm:[&_.image-wrapper.float-right]:max-w-[45%] sm:[&_.image-wrapper.float-right]:clear-right sm:[&_.image-wrapper.float-right]:-mt-2
          [&_p]:mb-10 last:[&_p]:mb-0 [&_p]:text-gray-700 [&_p]:leading-[1.9] [&_p]:whitespace-pre-wrap [&_p]:break-words [&_p]:display-flow-root [&_p]:mt-0
          [&_p:has(~_img.float-left)]:sm:w-[48%] [&_p:has(~_img.float-left)]:sm:float-right
          [&_p:has(~_img.float-right)]:sm:w-[48%] [&_p:has(~_img.float-right)]:sm:float-left
          [&_img.float-left~p]:sm:w-[48%] [&_img.float-left~p]:sm:float-right
          [&_img.float-right~p]:sm:w-[48%] [&_img.float-right~p]:sm:float-left
          [&_h1]:text-4xl [&_h1]:sm:text-5xl [&_h1]:font-black [&_h1]:mt-16 [&_h1]:mb-12 [&_h1]:clear-both [&_h1]:tracking-tight [&_h1]:break-words [&_h1]:w-full
          [&_h2]:text-3xl [&_h2]:sm:text-4xl [&_h2]:font-extrabold [&_h2]:mt-14 [&_h2]:mb-10 [&_h2]:clear-both [&_h2]:tracking-tight [&_h2]:break-words [&_h2]:w-full
          [&_h3]:text-2xl [&_h3]:sm:text-3xl [&_h3]:font-bold [&_h3]:mt-12 [&_h3]:mb-8 [&_h3]:clear-both [&_h3]:break-words [&_h3]:w-full
          [&_b]:clear-both [&_b]:block [&_b]:mt-10 [&_b]:mb-8 [&_b]:text-2xl [&_b]:font-black [&_b]:w-full
          [&_strong]:clear-both [&_strong]:block [&_strong]:mt-10 [&_strong]:mb-8 [&_strong]:text-2xl [&_strong]:font-black [&_strong]:w-full
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-10 [&_ul]:space-y-4 [&_ul]:clear-both [&_ul]:break-words [&_ul]:display-flow-root
          [&_ul:has(~_img.float-left)]:sm:w-[48%] [&_ul:has(~_img.float-left)]:sm:float-right
          [&_ul:has(~_img.float-right)]:sm:w-[48%] [&_ul:has(~_img.float-right)]:sm:float-left
          [&_img.float-left~ul]:sm:w-[48%] [&_img.float-left~ul]:sm:float-right
          [&_img.float-right~ul]:sm:w-[48%] [&_img.float-right~ul]:sm:float-left
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-10 [&_ol]:space-y-4 [&_ol]:clear-both [&_ol]:break-words [&_ol]:display-flow-root
          [&_ol:has(~_img.float-left)]:sm:w-[48%] [&_ol:has(~_img.float-left)]:sm:float-right
          [&_ol:has(~_img.float-right)]:sm:w-[48%] [&_ol:has(~_img.float-right)]:sm:float-left
          [&_img.float-left~ol]:sm:w-[48%] [&_img.float-left~ol]:sm:float-right
          [&_img.float-right~ol]:sm:w-[48%] [&_img.float-right~ol]:sm:float-left
          [&_img]:max-sm:hidden [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-2xl [&_img]:shadow-xl [&_img]:transition-all [&_img]:duration-300
          [&_img:not(.float-left):not(.float-right)]:block [&_img:not(.float-left):not(.float-right)]:mx-auto [&_img:not(.float-left):not(.float-right)]:my-10
          [&_.image-wrapper]:max-sm:hidden [&_.image-wrapper]:max-w-full sm:[&_.image-wrapper]:max-w-[45%] [&_.image-wrapper]:w-full sm:[&_.image-wrapper]:w-[45%] [&_.image-wrapper]:mx-auto sm:[&_.image-wrapper]:float-left sm:[&_.image-wrapper]:mr-[5%] sm:[&_.image-wrapper]:clear-left
          [&_.image-wrapper.float-left]:mr-12 [&_.image-wrapper.float-left]:mb-8 [&_.image-wrapper.float-left]:float-left [&_.image-wrapper.float-left]:clear-left [&_.image-wrapper.float-left]:mx-0
          [&_.image-wrapper.float-right]:ml-12 [&_.image-wrapper.float-right]:mb-8 [&_.image-wrapper.float-right]:float-right [&_.image-wrapper.float-right]:clear-right [&_.image-wrapper.float-right]:mx-0
          [&_.image-wrapper.mx-auto]:block [&_.image-wrapper.mx-auto]:mx-auto [&_.image-wrapper.mx-auto]:mb-12 [&_.image-wrapper.mx-auto]:max-w-[85%]
          [&_p]:mb-8 [&_p]:leading-[1.8] [&_p]:text-gray-700 [&_p]:text-lg [&_p]:break-words
          [&_p[style*="text-align: center"]]:text-center [&_p[style*="text-align:center"]]:text-center [&_p[style*="text-align: center"]]:sm:float-none [&_p[style*="text-align: center"]]:sm:w-full
          [&_p[style*="text-align: right"]]:text-right [&_p[style*="text-align:right"]]:text-right
          [&_p[style*="text-align: justify"]]:text-justify [&_p[style*="text-align:justify"]]:text-justify
          [&_div[style*="text-align: center"]]:text-center [&_div[style*="text-align:center"]]:text-center [&_div[style*="text-align: center"]]:sm:float-none [&_div[style*="text-align: center"]]:sm:w-full
          [&_div[style*="text-align: right"]]:text-right [&_div[style*="text-align:right"]]:text-right
          [&_div[style*="text-align: justify"]]:text-justify [&_div[style*="text-align:justify"]]:text-justify
          [&_div]:whitespace-pre-wrap [&_div]:break-words
          after:content-[''] after:table after:clear-both
        `}
        dangerouslySetInnerHTML={{ __html: cleanedHTML }}
      />
    );
  }

  // Use legacy parser for old markdown-style format
  return parseLegacyFormat(decodedText, className);
};

// Admin helper tip component - updated for new WYSIWYG editor
export const RichTextHelperTip: React.FC = () => (
  <p className="text-xs text-[#1887FC] mb-2">
    Tip: Use the toolbar to format text. Bold, Blue Text color, and Lists are supported. Legacy format: [[text]] for blue, **text** for bold, "- " for bullets.
  </p>
);
