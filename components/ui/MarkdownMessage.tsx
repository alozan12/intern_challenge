'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownMessageProps {
  content: string
  className?: string
  isUser?: boolean
}

export function MarkdownMessage({ content, className, isUser = false }: MarkdownMessageProps) {
  const baseTextClass = isUser ? "text-white" : "text-gray-900"
  const headingClass = isUser ? "text-white" : ""
  const linkClass = isUser ? "text-red-200 hover:text-red-100" : "text-blue-600 hover:text-blue-800"
  const quoteClass = isUser ? "border-red-300 text-red-100" : "border-gray-300 text-gray-700"
  
  return (
    <div className={cn("prose prose-sm max-w-none", baseTextClass, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Headings
        h1: ({ children }) => <h1 className={cn("text-xl font-bold mt-4 mb-2", headingClass)}>{children}</h1>,
        h2: ({ children }) => <h2 className={cn("text-lg font-semibold mt-3 mb-2", headingClass)}>{children}</h2>,
        h3: ({ children }) => <h3 className={cn("text-base font-semibold mt-2 mb-1", headingClass)}>{children}</h3>,
        
        // Paragraphs and text
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        
        // Lists
        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="ml-2">{children}</li>,
        
        // Code
        code: ({ inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '')
          if (!inline && match) {
            return (
              <div className="mb-3">
                <SyntaxHighlighter
                  style={isUser ? oneDark : vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-md text-sm"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            )
          }
          
          if (inline) {
            return (
              <code className={cn(
                "px-1.5 py-0.5 rounded text-sm font-mono",
                isUser ? "bg-red-800 text-red-100" : "bg-gray-100 text-gray-800"
              )}>
                {children}
              </code>
            )
          }
          
          return (
            <code className={cn(
              "block p-3 rounded-md text-sm font-mono overflow-x-auto mb-3",
              isUser ? "bg-red-800 text-red-100" : "bg-gray-100 text-gray-800"
            )}>
              {children}
            </code>
          )
        },
        pre: ({ children }) => children,
        
        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className={cn("border-l-4 pl-4 py-1 mb-3 italic", quoteClass)}>
            {children}
          </blockquote>
        ),
        
        // Links
        a: ({ href, children }) => (
          <a href={href} className={cn("underline", linkClass)} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        
        // Horizontal rules
        hr: () => <hr className="my-4 border-gray-300" />,
        
        // Tables (GFM)
        table: ({ children }) => (
          <div className="overflow-x-auto mb-3">
            <table className="min-w-full border-collapse border border-gray-300">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-gray-300">{children}</tr>,
        th: ({ children }) => <th className="px-3 py-2 text-left font-semibold border-r border-gray-300 last:border-r-0">{children}</th>,
        td: ({ children }) => <td className="px-3 py-2 border-r border-gray-300 last:border-r-0">{children}</td>,
      }}
    >
      {content}
      </ReactMarkdown>
    </div>
  )
}