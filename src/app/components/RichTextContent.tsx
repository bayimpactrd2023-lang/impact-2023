import React from 'react';

// URL regex pattern - matches http, https, and www URLs
const URL_REGEX = /(https?:\/\/[^\s<>"{}|\^`\[\]]+|www\.[^\s<>"{}|\^`\[\]]+\.[a-zA-Z]{2,}[^\s<>"{}|\^`\[\]]*)/g;

// Parse URLs and convert to clickable links
const parseUrls = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

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

// Component to render rich text with lists and highlighting
interface RichTextContentProps {
  text: string | undefined | null;
  enabled?: boolean;
  className?: string;
}

export const RichTextContent: React.FC<RichTextContentProps> = ({ 
  text, 
  enabled = true,
  className = ''
}) => {
  // Handle null/undefined/empty text gracefully
  if (!text) {
    return null;
  }

  if (!enabled) {
    return <>{text}</>;
  }

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
            {parseHighlights(item)}
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for bullet list item (must be at start of line, but preserve content spacing)
    if (trimmed.startsWith('- ')) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      // Use trimmed content for list items to remove the "- " prefix but keep the rest as-is
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
      // Use trimmed content to remove the "1. " prefix but keep the rest as-is
      currentList.items.push(line.trimStart().slice(numberedMatch[0].length));
      continue;
    }

    // Regular paragraph text - preserve the original line including leading spaces
    if (trimmed) {
      flushList();
      elements.push(
        <p key={`p-${i}`} className="mb-2 last:mb-0 whitespace-pre-wrap">
          {parseHighlights(line)}
        </p>
      );
    } else {
      // Empty line - add spacing between paragraphs
      flushList();
      elements.push(<div key={`spacer-${i}`} className="h-4" />);
    }
  }

  flushList();

  return <div className={`whitespace-pre-line ${className}`}>{elements}</div>;
};

// Admin helper tip component
export const RichTextHelperTip: React.FC = () => (
  <p className="text-xs text-[#1887FC] mb-2">
    Tip: Use [[text]] to highlight in blue. Start lines with "- " for bullets or "1. " for numbered lists. URLs are automatically converted to clickable links.
  </p>
);
