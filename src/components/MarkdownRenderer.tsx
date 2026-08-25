"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm leading-relaxed space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-bold text-black dark:text-white mt-4 mb-2 border-b border-neutral-200 dark:border-neutral-800 pb-1.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-3 mb-1.5">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="mb-2 text-neutral-700 dark:text-neutral-300 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 mb-3 text-neutral-700 dark:text-neutral-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1.5 mb-3 text-neutral-700 dark:text-neutral-300">{children}</ol>,
          li: ({ children }) => <li className="text-neutral-700 dark:text-neutral-300">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-black dark:text-white">{children}</strong>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 underline underline-offset-2 transition-colors font-medium"
            >
              <span>{children}</span>
              <ExternalLink className="w-3 h-3 inline shrink-0 text-neutral-500 dark:text-neutral-400" />
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded border border-neutral-200 dark:border-neutral-800">
              <table className="w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-neutral-100 dark:bg-black text-neutral-800 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-950/50">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="p-2.5 font-semibold text-neutral-800 dark:text-neutral-200">{children}</th>,
          td: ({ children }) => <td className="p-2.5 text-neutral-700 dark:text-neutral-300">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
