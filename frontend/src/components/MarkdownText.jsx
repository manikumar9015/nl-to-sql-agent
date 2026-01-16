/**
 * Simple Markdown Renderer Component
 * Renders common markdown syntax in chat messages
 */
import React from 'react';

const MarkdownText = ({ text, variant = 'light' }) => {
  if (!text) return null;

  // Split by lines to handle block elements
  const lines = text.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        // Headers (## or ###)
        if (line.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-base font-semibold mt-3 mb-1">
              {line.substring(4)}
            </h4>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-lg font-bold mt-4 mb-2">
              {line.substring(3)}
            </h3>
          );
        }
        
        // Bullet points
        if (line.match(/^[-•]\s/)) {
          const content = line.substring(2);
          return (
            <div key={idx} className="flex gap-2 ml-4">
              <span className="opacity-70">•</span>
              <span>{renderInlineMarkdown(content, variant)}</span>
            </div>
          );
        }
        
        // Empty lines
        if (line.trim() === '') {
          return <div key={idx} className="h-2"></div>;
        }
        
        // Regular paragraphs
        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineMarkdown(line, variant)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Render inline markdown (bold, italic, code)
 */
const renderInlineMarkdown = (text, variant) => {
  if (!text) return null;

  // 1. Mask code blocks first to protect them
  const codeBlocks = [];
  const maskedText = text.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `__CODE_${codeBlocks.length}__`;
    codeBlocks.push({
      placeholder,
      content: (
        <code 
          key={`code-${codeBlocks.length}`} 
          className="font-mono text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-rose-600 dark:text-rose-300 border border-black/5 dark:border-white/10"
        >
          {code}
        </code>
      )
    });
    return placeholder;
  });

  // 2. Split by bold syntax
  // matches **text**
  const parts = maskedText.split(/(\*\*.+?\*\*)/g);
  
  return parts.map((part, index) => {
    // Check if part is bold
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const content = part.substring(2, part.length - 2);
      
      // If content contains placeholders, we need to unmask them interacting with the text
      return (
        <strong key={`bold-${index}`} className="font-bold">
          {restoreAndRender(content, codeBlocks)}
        </strong>
      );
    }
    
    // Regular text (still might contain placeholders)
    return <span key={`text-${index}`}>{restoreAndRender(part, codeBlocks)}</span>;
  });
};

/**
 * Helper to restore code placeholders within a string
 */
const restoreAndRender = (text, codeBlocks) => {
  if (!text) return null;
  
  // Split by code placeholders pattern
  const parts = text.split(/(__CODE_\d+__)/g);
  
  return parts.map((part, i) => {
    const validPlaceholder = /^__CODE_(\d+)__$/.exec(part);
    if (validPlaceholder) {
      const index = parseInt(validPlaceholder[1], 10);
      return codeBlocks[index] ? codeBlocks[index].content : part;
    }
    return part;
  });
};

export default MarkdownText;
