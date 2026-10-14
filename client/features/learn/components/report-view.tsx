"use client";

import { useState } from "react";
import {
  AlignLeft,
  Check,
  Clock,
  Copy,
  FileText,
  Hash,
  Layers,
  List,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReportContent } from "../lib/types";
import { MarkdownRenderer } from "./markdown-renderer";

type ReportViewProps = {
  content: ReportContent;
};

export function ReportView({ content }: ReportViewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"sections" | "document">("sections");

  const sections = content?.sections || [];
  const fullMarkdown = content?.markdown || "";

  // Combine or select text for reading stats
  const allText = fullMarkdown || sections.map((s) => `${s.title}\n${s.content}`).join("\n\n");
  const words = allText.trim() ? allText.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(allText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const scrollToSection = (index: number) => {
    const el = document.getElementById(`report-section-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!sections.length && !fullMarkdown) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
        <Sparkles className="size-8 text-muted-foreground/50" />
        <p className="mt-3 text-[14px] font-medium text-foreground">No report content available</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          This report does not contain any sections or text yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── UNIFIED REPORT HEADER CARD ─────────────────────── */}
      <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 bg-muted/20">
          {/* Left: Metadata */}
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-semibold text-foreground">AI Research Report</h3>
                {sections.length > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {sections.length} sections
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {readingTime} min read
                </span>
                <span>&middot;</span>
                <span className="flex items-center gap-1">
                  <Hash className="size-3" />
                  {words} words
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions and View Toggle */}
          <div className="flex items-center gap-2">
            {sections.length > 0 && fullMarkdown && (
              <div className="flex items-center rounded-lg border border-border/70 bg-background/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("sections")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                    activeTab === "sections"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Layers className="size-3" />
                  <span>Sections</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("document")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                    activeTab === "document"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <AlignLeft className="size-3" />
                  <span>Document</span>
                </button>
              </div>
            )}

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
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Table of contents in the same card separated by divider line */}
        {activeTab === "sections" && sections.length > 1 && (
          <div className="border-t border-border/60 px-4 py-2.5 flex flex-wrap items-center gap-2">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/70 mr-1 flex items-center gap-1">
              <List className="size-3" />
              Contents:
            </span>
            {sections.map((section, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToSection(idx)}
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2 py-0.5 text-[11px] font-medium text-foreground/80 transition-all hover:border-primary/40 hover:text-primary"
              >
                <span className="size-3.5 rounded-full bg-primary/10 text-[9px] font-bold text-primary flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="truncate max-w-[140px] sm:max-w-[180px]">{section.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Structured Sections Mode */}
      {activeTab === "sections" && sections.length > 0 ? (
        <div className="space-y-4">
          {sections.map((section, index) => {
            const sectionWords = section.content ? section.content.trim().split(/\s+/).length : 0;
            return (
              <div
                key={index}
                id={`report-section-${index}`}
                className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7 shadow-sm transition-all hover:border-border"
              >
                {/* Section Title Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-[11.5px] font-bold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[15px] sm:text-[16px] font-semibold text-foreground">
                      {section.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground/70">
                    {sectionWords} words
                  </span>
                </div>

                {/* Section Markdown Content */}
                <div className="pt-4">
                  <MarkdownRenderer content={section.content} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Full Document Whitepaper View */
        <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-9 shadow-sm">
          <article className="max-w-none">
            <MarkdownRenderer
              content={
                fullMarkdown ||
                sections
                  .map(
                    (s, i) =>
                      `## ${String(i + 1).padStart(2, "0")}. ${s.title}\n\n${s.content}`,
                  )
                  .join("\n\n---\n\n")
              }
            />
          </article>
        </div>
      )}
    </div>
  );
}
