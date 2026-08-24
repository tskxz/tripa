"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert max-w-none text-slate-200 text-xs sm:text-sm leading-relaxed space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-4 mb-2 border-b border-slate-800 pb-1.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-semibold text-sky-400 mt-3 mb-1.5">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="mb-2 text-slate-300 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 mb-3 text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1.5 mb-3 text-slate-300">{children}</ol>,
          li: ({ children }) => <li className="text-slate-300">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors font-medium"
            >
              <span>{children}</span>
              <ExternalLink className="w-3 h-3 inline shrink-0" />
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-slate-900/80 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="p-2.5 font-semibold text-slate-200">{children}</th>,
          td: ({ children }) => <td className="p-2.5 text-slate-300">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
