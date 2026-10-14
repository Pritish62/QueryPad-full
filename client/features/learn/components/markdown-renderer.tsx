"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`prose-custom max-w-none text-foreground/90 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-6 text-[18px] sm:text-[20px] font-bold tracking-tight text-foreground pb-2 border-b border-border/60 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 text-[15px] sm:text-[16px] font-semibold tracking-tight text-foreground flex items-center gap-2 pb-1 border-b border-border/40 first:mt-0">
              <span className="size-1.5 rounded-full bg-primary shrink-0" />
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-[13.5px] sm:text-[14.5px] font-semibold text-foreground first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-1.5 mt-3 text-[12.5px] font-semibold text-foreground/90 first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-3 text-[13px] sm:text-[13.5px] leading-[1.7] text-foreground/85 last:mb-0 break-words">
              {children}
            </p>
          ),
          a: ({ href, children }) => {
            const isExternal = href?.startsWith("http://") || href?.startsWith("https://");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-3 hover:text-primary/80 transition-colors break-all"
              >
                <span>{children}</span>
                {isExternal && <ExternalLink className="size-3 inline shrink-0 opacity-70" />}
              </a>
            );
          },
          img: ({ src, alt }) => (
            <span className="block my-3">
              <img
                src={src}
                alt={alt || "Extracted image"}
                className="max-h-96 rounded-xl border border-border/60 object-contain shadow-xs bg-muted/20"
                loading="lazy"
              />
              {alt && <span className="block text-[11px] text-muted-foreground mt-1 text-center">{alt}</span>}
            </span>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="my-3 space-y-1.5 pl-5 list-disc marker:text-primary/70 text-[13px] sm:text-[13.5px] leading-relaxed text-foreground/85">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 space-y-1.5 pl-5 list-decimal marker:font-semibold marker:text-primary/70 text-[13px] sm:text-[13.5px] leading-relaxed text-foreground/85">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-3.5 rounded-r-2xl border-l-3 border-primary/70 bg-primary/5 py-2 px-4 text-[12.5px] italic text-foreground/80">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-border/70 shadow-2xs">
              <table className="w-full border-collapse text-left text-[12px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-border/70 bg-muted/60 text-foreground font-semibold">
              {children}
            </thead>
          ),
          th: ({ children }) => <th className="p-2.5 font-semibold">{children}</th>,
          td: ({ children }) => (
            <td className="border-t border-border/40 p-2.5 text-foreground/85">
              {children}
            </td>
          ),
          code: ({ inline, className: codeClassName, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11.5px] font-medium text-primary break-all"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="my-3 overflow-x-auto rounded-xl border border-border/70 bg-muted/40 p-3.5 font-mono text-[12px] text-foreground">
                <code className={codeClassName} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          hr: () => <hr className="my-5 border-border/60" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
