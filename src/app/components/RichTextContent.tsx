import React from 'react';

// Parse [[text]] syntax and convert to blue spans
const parseHighlights = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} className="text-[#1887FC] font-semibold">
        {match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
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

    // Check for bullet list item
    if (trimmed.startsWith('- ')) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(trimmed.slice(2));
      continue;
    }

    // Check for numbered list item
    const numberedMatch = trimmed.match(/^(\d+)\.\s/);
    if (numberedMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(trimmed.slice(numberedMatch[0].length));
      continue;
    }

    // Regular paragraph text
    if (trimmed) {
      flushList();
      elements.push(
        <p key={`p-${i}`} className="mb-2 last:mb-0">
          {parseHighlights(line)}
        </p>
      );
    } else {
      flushList();
    }
  }

  flushList();

  return <div className={`whitespace-pre-line ${className}`}>{elements}</div>;
};

// Admin helper tip component
export const RichTextHelperTip: React.FC = () => (
  <p className="text-xs text-[#1887FC] mb-2">
    Tip: Use [[text]] to highlight in blue. Start lines with "- " for bullets or "1. " for numbered lists.
  </p>
);
