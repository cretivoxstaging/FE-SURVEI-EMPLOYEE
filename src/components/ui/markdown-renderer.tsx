import React from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from '../code-block';

export default function MarkdownRenderer({ className, content }: any) {
  return (
    <ReactMarkdown
      components={{
        code: CodeBlock as any,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
