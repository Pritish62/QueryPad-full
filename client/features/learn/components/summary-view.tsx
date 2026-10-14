"use client";

import { useState } from "react";
import {
  BookOpen,
  Check,
  Clock,
  Copy,
  Hash,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SummaryContent } from "../lib/types";
import { MarkdownRenderer } from "./markdown-renderer";

type SummaryViewProps = {
  content: SummaryContent;
};

export function SummaryView({ content }: SummaryViewProps) {
  const [copied, setCopied] = useState(false);
  const markdownText = content?.markdown || "";

  // Compute word count and reading time
  const words = markdownText.trim() ? markdownText.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (!markdownText) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
        <Sparkles className="size-8 text-muted-foreground/50" />
        <p className="mt-3 text-[14px] font-medium text-foreground">No summary content available</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          This summary does not contain any text yet.
        </p>
      </div>
    );
  }

  return (
    /* ── SINGLE UNIFIED SUMMARY CARD (Toolbar + Content separated by line bar) ── */
    <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
      {/* Top Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">Executive Summary</h3>
            <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {readingTimeMinutes} min read
              </span>
              <span>&middot;</span>
              <span className="flex items-center gap-1">
                <Hash className="size-3" />
                {words} words
              </span>
            </div>
          </div>
        </div>

        {/* Copy Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8 gap-1.5 rounded-xl px-3 text-[11.5px] transition-all"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5 text-muted-foreground" />
              <span>Copy summary</span>
            </>
          )}
        </Button>
      </div>

      {/* Divider bar line separating Header from Formatted Markdown Content */}
      <div className="border-t border-border/60 p-5 sm:p-8">
        <article className="max-w-none">
          <MarkdownRenderer content={markdownText} />
        </article>
      </div>
    </div>
  );
}
