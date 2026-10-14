"use client";

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Globe,
  Hash,
  Link2,
  Loader2,
  Play,
  RefreshCw,
  Sparkles,
  StickyNote,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownRenderer } from "@/features/learn/components/markdown-renderer";
import { useDeleteSource, useSource } from "../hooks/use-sources";
import type { Source, SourceStatus } from "../lib/types";

type SourceDetailProps = {
  workspaceId: string;
  sourceId: string;
  onBack: () => void;
};

/* ── meta helpers ────────────────────────────────────────────────── */

function getTypeMeta(type: string) {
  if (type === "PDF")
    return { icon: FileText, color: "text-red-400", bg: "bg-red-400/10", label: "PDF" };
  if (type === "YOUTUBE")
    return { icon: Play, color: "text-red-500", bg: "bg-red-500/10", label: "YouTube" };
  if (type === "WEBSITE")
    return { icon: Globe, color: "text-sky-400", bg: "bg-sky-400/10", label: "Website" };
  if (type === "MARKDOWN")
    return { icon: FileText, color: "text-violet-400", bg: "bg-violet-400/10", label: "Markdown" };
  return { icon: StickyNote, color: "text-amber-400", bg: "bg-amber-400/10", label: "Text" };
}

function StatusBadge({ status }: { status: SourceStatus }) {
  const map: Record<SourceStatus, { icon: React.ElementType; label: string; cls: string }> = {
    READY: { icon: CheckCircle2, label: "Ready", cls: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
    PROCESSING: { icon: Loader2, label: "Processing", cls: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
    PENDING: { icon: Clock, label: "Pending", cls: "text-sky-500 bg-sky-500/10 border-sky-500/30" },
    FAILED: { icon: XCircle, label: "Failed", cls: "text-destructive bg-destructive/10 border-destructive/30" },
  };
  const { icon: Icon, label, cls } = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold ${cls}`}>
      <Icon className={`size-3 ${status === "PROCESSING" ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Strips out leading boilerplate navigation links often found in scraped web pages
 * (e.g., [Sitemap], [Open in app], [Sign in], Sign up, logo links, standalone dashes).
 */
function cleanWebContent(rawContent: string): { cleaned: string; hasBoilerplate: boolean } {
  if (!rawContent) return { cleaned: "", hasBoilerplate: false };

  const lines = rawContent.split("\n");
  let startIndex = 0;
  let detectedBoilerplate = false;

  for (let i = 0; i < Math.min(lines.length, 35); i++) {
    const line = lines[i].trim();
    if (
      line.startsWith("[Sitemap](") ||
      line.startsWith("[Open in app](") ||
      line.startsWith("[Sign in](") ||
      line.startsWith("[Sign In](") ||
      line.startsWith("[Medium Logo](") ||
      line.startsWith("[Logo](") ||
      line.toLowerCase() === "sign up" ||
      line.toLowerCase() === "sign in" ||
      line.toLowerCase() === "menu" ||
      line.match(/^-{4,}$/) ||
      line === ""
    ) {
      detectedBoilerplate = true;
      startIndex = i + 1;
    } else {
      break;
    }
  }

  const cleaned = lines.slice(startIndex).join("\n").trim();
  return {
    cleaned: cleaned || rawContent,
    hasBoilerplate: detectedBoilerplate && startIndex > 0,
  };
}

/* ── main component ──────────────────────────────────────────────── */

export function SourceDetail({ workspaceId, sourceId, onBack }: SourceDetailProps) {
  const { data: source, isLoading, isError, refetch } = useSource(workspaceId, sourceId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-1">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !source) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <XCircle className="size-10 text-destructive/60" />
        <p className="text-[13px] text-muted-foreground">Could not load source.</p>
        <Button size="sm" variant="outline" className="gap-1.5 text-[12px]" onClick={() => void refetch()}>
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  return <SourceDetailView workspaceId={workspaceId} source={source} onBack={onBack} />;
}

function SourceDetailView({
  workspaceId,
  source,
  onBack,
}: {
  workspaceId: string;
  source: Source;
  onBack: () => void;
}) {
  const meta = getTypeMeta(source.type);
  const Icon = meta.icon;
  const metadata = source.metadata as Record<string, unknown> | null;
  const deleteSource = useDeleteSource(workspaceId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"reader" | "raw">("reader");
  const [filterBoilerplate, setFilterBoilerplate] = useState(true);

  const rawContent = source.content || "";
  const isWebSource = source.type === "WEBSITE";

  // Clean boilerplate for web sources
  const { cleaned: cleanedContent, hasBoilerplate } = useMemo(
    () => cleanWebContent(rawContent),
    [rawContent],
  );

  const displayContent =
    isWebSource && filterBoilerplate && hasBoilerplate
      ? cleanedContent
      : rawContent;

  const wordCount = rawContent
    ? rawContent.trim().split(/\s+/).filter(Boolean).length
    : null;

  const effectiveUrl =
    source.url ||
    (typeof metadata?.fileUrl === "string" ? metadata.fileUrl : null);

  async function handleDelete() {
    await deleteSource.mutateAsync(source.id);
    onBack();
  }

  const handleCopyContent = async () => {
    if (!displayContent) return;
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── SECTION 1: SOURCE HEADER & INFORMATION (Unified into ONE card) ── */}
      <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-3.5">
          {/* Left: Back button + Icon + Title + Type badge + Status badge */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={onBack}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">All sources</span>
            </button>

            <span className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
              <Icon className={`size-4 ${meta.color}`} />
            </span>

            <div className="min-w-0 flex items-center gap-2 flex-wrap">
              <h2 className="truncate text-[14.5px] font-semibold text-foreground max-w-[240px] sm:max-w-md">
                {source.title}
              </h2>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${meta.bg} ${meta.color} border-current/20`}>
                <Icon className="size-2.5" />
                {meta.label}
              </span>
              <StatusBadge status={source.status} />
            </div>
          </div>

          {/* Right: Delete button (with confirmation) */}
          <div className="shrink-0">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-1.5 text-[12px] text-muted-foreground/70 transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                <span>Delete source</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] text-destructive">Delete?</span>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-xl border border-border/60 px-2.5 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteSource.isPending}
                  onClick={() => void handleDelete()}
                  className="flex items-center gap-1.5 rounded-xl bg-destructive px-3 py-1.5 text-[11.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {deleteSource.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Divider bar line separating Header from Information */}
        <div className="border-t border-border/60 bg-muted/20 px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]">
            {/* Added */}
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="size-3 text-muted-foreground/60" />
                Added:
              </span>
              <span className="font-medium text-foreground">{formatDate(source.createdAt)}</span>
            </div>

            {/* URL */}
            {effectiveUrl && (
              <div className="flex items-center gap-1.5 max-w-[280px] sm:max-w-md truncate">
                <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                  <Link2 className="size-3 text-muted-foreground/60" />
                  URL:
                </span>
                <a
                  href={effectiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline truncate font-medium"
                >
                  <span className="truncate">{effectiveUrl}</span>
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              </div>
            )}

            {/* Words */}
            {wordCount != null && (
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Hash className="size-3 text-muted-foreground/60" />
                  Words:
                </span>
                <span className="font-medium text-foreground">{wordCount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status-specific banners */}
      {source.status === "PROCESSING" && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/5 px-5 py-3.5">
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-amber-500" />
          <div>
            <p className="text-[13px] font-medium text-amber-600 dark:text-amber-400">
              Processing in progress
            </p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              Your source is being indexed — this may take a moment.
            </p>
          </div>
        </div>
      )}

      {source.status === "FAILED" && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-3.5">
          <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div>
            <p className="text-[13px] font-medium text-destructive">Processing failed</p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              Something went wrong while indexing this source. You can try deleting and re-adding it.
            </p>
          </div>
        </div>
      )}

      {/* ── SECTION 2: EXTRACTED CONTENT (Structured & User-Friendly) ── */}
      {source.content ? (
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <FileText className="size-3.5 text-primary" />
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                Extracted Content
              </h3>
              {isWebSource && (
                <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                  Web Article
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* If web source and boilerplate was detected: Allow toggling clean mode */}
              {isWebSource && hasBoilerplate && (
                <button
                  type="button"
                  onClick={() => setFilterBoilerplate((prev) => !prev)}
                  className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                    filterBoilerplate
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground"
                  }`}
                  title={filterBoilerplate ? "Showing cleaned article (nav junk removed)" : "Showing full raw scrape"}
                >
                  <Sparkles className="size-3" />
                  <span>{filterBoilerplate ? "Clean Article" : "Full Scrape"}</span>
                </button>
              )}

              {/* View Mode Toggle: Reader (Formatted) vs Raw Text */}
              <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("reader")}
                  className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-all ${
                    viewMode === "reader"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BookOpen className="size-3" />
                  <span>Reader</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("raw")}
                  className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-all ${
                    viewMode === "raw"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Code2 className="size-3" />
                  <span>Raw</span>
                </button>
              </div>

              {/* Copy Action */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyContent}
                className="h-7 gap-1.5 rounded-lg px-2 text-[11.5px] text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Content Body: Rendered Markdown or Raw Preformatted Text */}
          <div className="max-h-[580px] overflow-y-auto px-5 sm:px-7 py-5">
            {viewMode === "reader" ? (
              <article className="max-w-none">
                <MarkdownRenderer content={displayContent} />
              </article>
            ) : (
              <pre className="font-mono text-[12px] leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
                {displayContent}
              </pre>
            )}
          </div>
        </div>
      ) : (
        source.status !== "FAILED" && (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-8 text-center">
            <FileText className="mx-auto size-8 text-muted-foreground/30" />
            <p className="mt-2 text-[12.5px] text-muted-foreground">
              Content will appear here once processing is complete.
            </p>
          </div>
        )
      )}
    </div>
  );
}
