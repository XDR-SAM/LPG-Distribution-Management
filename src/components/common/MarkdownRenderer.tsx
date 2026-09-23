import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isDark?: boolean;
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-900 text-slate-100 font-mono text-[11px] shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold">
          <Terminal className="w-3 h-3 text-orange-400" />
          <span>{language || 'code'}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Helper to format inline markdown (bold, italic, code, links)
const renderInlineMarkdown = (text: string, isDark: boolean = false): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  // Tokenize string for code (`...`), bold (**...**), italic (*...*), links ([text](url))
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      const code = token.slice(1, -1);
      elements.push(
        <code
          key={`code-${match.index}`}
          className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono font-semibold ${
            isDark
              ? 'bg-slate-800 text-orange-300 border border-slate-700'
              : 'bg-orange-50 text-orange-800 border border-orange-200/80'
          }`}
        >
          {code}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      elements.push(
        <strong key={`b-${match.index}`} className={isDark ? 'text-white font-bold' : 'text-slate-900 font-bold'}>
          {boldText}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const italicText = token.slice(1, -1);
      elements.push(
        <em key={`i-${match.index}`} className="italic">
          {italicText}
        </em>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        elements.push(
          <a
            key={`a-${match.index}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-700 underline font-medium inline-flex items-center gap-0.5"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        );
      } else {
        elements.push(token);
      }
    } else {
      elements.push(token);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  isDark = false,
}) => {
  if (!content) return null;

  // Split content into blocks: code blocks vs standard text
  const blocks: React.ReactNode[] = [];
  const lines = content.split('\n');

  let inCodeBlock = false;
  let codeLang = '';
  let codeBuffer: string[] = [];

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    const isUl = currentList.type === 'ul';
    blocks.push(
      isUl ? (
        <ul key={`list-${blocks.length}`} className="my-2 space-y-1 pl-1">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isDark ? 'bg-orange-400' : 'bg-orange-600'}`} />
              <div className="flex-1 leading-relaxed">
                {renderInlineMarkdown(item, isDark)}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ol key={`list-${blocks.length}`} className="my-2 space-y-1 pl-1">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs">
              <span className={`w-4 h-4 rounded text-[10px] font-bold mt-0.5 shrink-0 flex items-center justify-center font-mono ${
                isDark ? 'bg-slate-800 text-orange-400 border border-slate-700' : 'bg-orange-100 text-orange-800 border border-orange-200'
              }`}>
                {idx + 1}
              </span>
              <div className="flex-1 leading-relaxed">
                {renderInlineMarkdown(item, isDark)}
              </div>
            </li>
          ))}
        </ol>
      )
    );
    currentList = null;
  };

  const flushTable = () => {
    if (!inTable) return;
    blocks.push(
      <div key={`table-${blocks.length}`} className="my-3 overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
        <table className="w-full text-left text-xs border-collapse font-sans">
          {tableHeader.length > 0 && (
            <thead className={isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'}>
              <tr>
                {tableHeader.map((h, hIdx) => (
                  <th key={hIdx} className="px-3 py-2 text-[11px] font-bold border-b border-slate-200">
                    {renderInlineMarkdown(h.trim(), isDark)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {tableRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={
                  rIdx % 2 === 0
                    ? isDark ? 'bg-slate-900/50' : 'bg-white'
                    : isDark ? 'bg-slate-900' : 'bg-slate-50/70'
                }
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-1.5 text-xs text-slate-700 whitespace-nowrap">
                    {renderInlineMarkdown(cell.trim(), isDark)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    inTable = false;
    tableHeader = [];
    tableRows = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check code fence
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        flushList();
        flushTable();
        inCodeBlock = true;
        codeLang = trimmed.replace('```', '').trim();
        codeBuffer = [];
      } else {
        // Close code block
        blocks.push(
          <CodeBlock
            key={`codeblock-${blocks.length}`}
            code={codeBuffer.join('\n')}
            language={codeLang}
          />
        );
        inCodeBlock = false;
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Markdown Table Check: lines starting and ending with '|'
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      flushList();
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map(c => c.trim());

      // If separator line like |---|---|
      const isSeparator = cells.every(c => /^[-:]+$/.test(c));
      if (isSeparator) {
        inTable = true;
        continue;
      }

      if (!inTable && tableHeader.length === 0) {
        tableHeader = cells;
      } else {
        inTable = true;
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    if (trimmed.startsWith('#### ')) {
      flushList();
      blocks.push(
        <h4
          key={`h4-${i}`}
          className={`font-bold text-xs uppercase tracking-wider mt-3 mb-1 ${
            isDark ? 'text-orange-400' : 'text-slate-800'
          }`}
        >
          {renderInlineMarkdown(trimmed.replace('#### ', ''), isDark)}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      blocks.push(
        <h3
          key={`h3-${i}`}
          className={`font-black text-sm mt-3.5 mb-1.5 flex items-center gap-1.5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          <span className="w-1.5 h-3.5 bg-orange-600 rounded-full inline-block" />
          <span>{renderInlineMarkdown(trimmed.replace('### ', ''), isDark)}</span>
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      blocks.push(
        <h2
          key={`h2-${i}`}
          className={`font-black text-base mt-4 mb-2 pb-1 border-b ${
            isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'
          }`}
        >
          {renderInlineMarkdown(trimmed.replace('## ', ''), isDark)}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      blocks.push(
        <h1
          key={`h1-${i}`}
          className={`font-black text-lg mt-4 mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          {renderInlineMarkdown(trimmed.replace('# ', ''), isDark)}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      blocks.push(
        <div
          key={`quote-${i}`}
          className={`my-2 pl-3 py-1.5 border-l-3 rounded-r text-xs italic ${
            isDark
              ? 'border-orange-500 bg-slate-800/60 text-slate-300'
              : 'border-orange-500 bg-orange-50/50 text-slate-700'
          }`}
        >
          {renderInlineMarkdown(trimmed.replace('> ', ''), isDark)}
        </div>
      );
      continue;
    }

    // Unordered lists: '* ' or '- ' or '• '
    const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Ordered lists: '1. ' or '2. '
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[1]);
      continue;
    }

    // Regular line / Paragraph
    flushList();
    if (trimmed === '') {
      // Empty line spacing
      blocks.push(<div key={`sp-${i}`} className="h-1.5" />);
    } else {
      blocks.push(
        <p key={`p-${i}`} className="leading-relaxed text-xs">
          {renderInlineMarkdown(trimmed, isDark)}
        </p>
      );
    }
  }

  flushList();
  flushTable();

  return (
    <div className={`markdown-body select-text ${className}`}>
      {blocks}
    </div>
  );
};
