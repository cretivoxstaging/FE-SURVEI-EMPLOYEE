import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import CodeBlock from '../code-block';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  className?: string;
  content: string;
}

export default function MarkdownRenderer({ className, content }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          // Code blocks dengan syntax highlighting
          code: CodeBlock as any,

          // Styling untuk paragraf
          p: ({ children }) => (
            <p className="mb-4 last:mb-0 leading-7">{children}</p>
          ),

          // Styling untuk heading
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 border-b pb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h4>
          ),

          // Styling untuk list
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-7">{children}</li>
          ),

          // Styling untuk blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 py-2 mb-4 italic text-gray-700 bg-gray-50 rounded-r">
              {children}
            </blockquote>
          ),

          // Styling untuk link
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline decoration-blue-400 hover:decoration-blue-600 transition-colors"
            >
              {children}
            </a>
          ),

          // Styling untuk table
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold text-gray-700 border border-gray-300">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border border-gray-300">{children}</td>
          ),

          // Styling untuk horizontal rule
          hr: () => (
            <hr className="my-6 border-t-2 border-gray-200" />
          ),

          // Styling untuk strong (bold)
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">{children}</strong>
          ),

          // Styling untuk emphasis (italic)
          em: ({ children }) => (
            <em className="italic text-gray-700">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
