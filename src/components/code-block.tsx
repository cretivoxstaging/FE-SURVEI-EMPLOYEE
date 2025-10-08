// src/CodeBlock.tsx
"use client";

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Inline code
  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-800 font-mono text-sm border border-gray-300"
        {...props}
      >
        {children}
      </code>
    );
  }

  // Code block dengan syntax highlighting
  if (match) {
    return (
      <div className="relative group mb-4 rounded-lg overflow-hidden border border-gray-700">
        {/* Header dengan nama bahasa dan tombol copy */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-all duration-200"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code dengan syntax highlighting */}
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: '#1e1e1e',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }
            }}
            showLineNumbers
            wrapLines
            {...props}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  // Code block tanpa bahasa spesifik
  return (
    <div className="relative group mb-4 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
      <div className="flex items-center justify-end px-4 py-2 bg-gray-800 border-b border-gray-700">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-all duration-200"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-200 font-mono">{children}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;