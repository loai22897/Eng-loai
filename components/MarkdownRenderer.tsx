import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  variant?: 'dark' | 'light';
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, variant = 'dark' }) => {
  const isDark = variant === 'dark';

  return (
    <div className={`prose prose-sm max-w-none break-words ${isDark ? 'prose-invert text-slate-100' : 'prose-slate text-slate-900'}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <div className={`rounded-md my-4 border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-800 border-slate-700'}`}>
                <div className="bg-slate-800 px-4 py-1 text-xs text-slate-400 font-mono border-b border-slate-700">
                  {match ? match[1] : 'code'}
                </div>
                <pre className="p-4 overflow-x-auto text-sm text-slate-200">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className={`${isDark ? 'bg-slate-800 text-indigo-300' : 'bg-slate-200 text-indigo-700'} px-1.5 py-0.5 rounded font-mono text-sm`} {...props}>
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 border rounded-lg border-slate-200 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className={isDark ? 'bg-slate-800' : 'bg-indigo-50'}>{children}</thead>,
          tbody: ({ children }) => <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-200'}`}>{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className={`px-4 py-3 text-right font-bold tracking-wider ${isDark ? 'text-slate-200' : 'text-indigo-900'}`}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`px-4 py-2 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {children}
            </td>
          ),
          ul: ({ children }) => <ul className={`list-disc pl-5 my-2 space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{children}</ul>,
          ol: ({ children }) => <ol className={`list-decimal pl-5 my-2 space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{children}</ol>,
          h1: ({ children }) => <h1 className={`text-2xl font-bold mt-6 mb-4 ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>{children}</h1>,
          h2: ({ children }) => <h2 className={`text-xl font-bold mt-5 mb-3 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>{children}</h2>,
          h3: ({ children }) => <h3 className={`text-lg font-bold mt-4 mb-2 ${isDark ? 'text-indigo-200' : 'text-indigo-500'}`}>{children}</h3>,
          p: ({ children }) => <p className={`my-2 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{children}</p>,
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 border-indigo-500 pl-4 py-1 my-4 italic ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-indigo-50 text-slate-600'}`}>
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{children}</strong>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;