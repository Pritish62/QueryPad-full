"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Hash,
  Loader2,
  Play,
  RefreshCw,
  StickyNote,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      <Icon className={`size-3 ${status === "PROCESSING" ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <span className="w-28 shrink-0 text-[11.5px] font-medium text-muted-foreground">{label}</span>
      <span className="text-[12.5px] text-foreground break-all">{value}</span>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* ── main component ──────────────────────────────────────────────── */

export function SourceDetail({ workspaceId, sourceId, onBack }: SourceDetailProps) {
  const { data: source, isLoading, isError, refetch } = useSource(workspaceId, sourceId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 p-1">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
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

  const wordCount = source.content
    ? source.content.trim().split(/\s+/).filter(Boolean).length
    : null;

  const charCount = source.content?.length ?? null;

  async function handleDelete() {
    await deleteSource.mutateAsync(source.id);
    onBack();
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Back nav + Delete */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex w-fit items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All sources
        </button>

        {/* Delete button */}
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-1.5 text-[12px] text-muted-foreground/70 transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
            Delete source
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] text-destructive">Delete permanently?</span>
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
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Header card */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
            <Icon className={`size-5 ${meta.color}`} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-semibold leading-snug">{source.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold border ${meta.bg} ${meta.color} border-current/20`}>
                <Icon className="size-2.5" />
                {meta.label}
              </span>
              <StatusBadge status={source.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Metadata card */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          <Hash className="size-3.5" />
          Details
        </h3>
        <div>
          <MetaRow label="Status" value={<StatusBadge status={source.status} />} />
          <MetaRow label="Type" value={meta.label} />
          <MetaRow label="Added" value={formatDate(source.createdAt)} />
          <MetaRow label="Updated" value={formatDate(source.updatedAt)} />
          {source.url && (
            <MetaRow
              label="URL"
              value={
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
                >
                  {source.url.length > 60 ? `${source.url.slice(0, 60)}…` : source.url}
                  <ExternalLink className="size-3" />
                </a>
              }
            />
          )}
          {metadata?.pageCount != null && (
            <MetaRow label="Pages" value={String(metadata.pageCount)} />
          )}
          {metadata?.fileSize != null && (
            <MetaRow label="File size" value={formatBytes(Number(metadata.fileSize))} />
          )}
          {metadata?.fileName != null && (
            <MetaRow label="File name" value={String(metadata.fileName)} />
          )}
          {metadata?.videoId != null && (
            <MetaRow
              label="Video ID"
              value={
                <a
                  href={`https://youtube.com/watch?v=${metadata.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[12px] text-primary hover:underline"
                >
                  {String(metadata.videoId)}
                  <ExternalLink className="size-3" />
                </a>
              }
            />
          )}
          {wordCount != null && (
            <MetaRow label="Words" value={wordCount.toLocaleString()} />
          )}
          {charCount != null && (
            <MetaRow label="Characters" value={charCount.toLocaleString()} />
          )}
          {metadata?.fileUrl != null && (
            <MetaRow
              label="File URL"
              value={
                <a
                  href={String(metadata.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
                >
                  View PDF
                  <ExternalLink className="size-3" />
                </a>
              }
            />
          )}
        </div>
      </div>

      {/* Status-specific message */}
      {source.status === "PROCESSING" && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/5 px-5 py-4">
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-amber-500" />
          <div>
            <p className="text-[13px] font-medium text-amber-600 dark:text-amber-400">
              Processing in progress
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Your source is being indexed — this may take a moment. Refresh to check progress.
            </p>
          </div>
        </div>
      )}
      {source.status === "PENDING" && (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-400/30 bg-sky-400/5 px-5 py-4">
          <Clock className="mt-0.5 size-4 shrink-0 text-sky-500" />
          <div>
            <p className="text-[13px] font-medium text-sky-600 dark:text-sky-400">
              Queued for processing
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              This source is queued and will be indexed shortly.
            </p>
          </div>
        </div>
      )}
      {source.status === "FAILED" && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4">
          <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div>
            <p className="text-[13px] font-medium text-destructive">Processing failed</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Something went wrong while indexing this source. You can try deleting and re-adding it.
            </p>
          </div>
        </div>
      )}

      {/* Extracted content */}
      {source.content && (
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Extracted content
            </h3>
            {wordCount && (
              <span className="text-[11px] text-muted-foreground/50">
                ~{wordCount.toLocaleString()} words
              </span>
            )}
          </div>
          <div className="max-h-[420px] overflow-y-auto px-5 py-4">
            <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-foreground/80">
              {source.content}
            </p>
          </div>
        </div>
      )}

      {/* No content yet */}
      {!source.content && source.status !== "FAILED" && (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-8 text-center">
          <FileText className="mx-auto size-8 text-muted-foreground/30" />
          <p className="mt-3 text-[12.5px] text-muted-foreground">
            Content will appear here once processing is complete.
          </p>
        </div>
      )}
    </div>
  );
}
