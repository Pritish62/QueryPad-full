"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Clock,
  FileText,
  Globe,
  Link2,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Square,
  StickyNote,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { ApiError } from "@/shared/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateSource,
  useDeleteSource,
  useImportWebsite,
  useImportYoutube,
  useSources,
  useUploadPdf,
} from "../hooks/use-sources";
import type { CreateSourceInput, Source, SourceStatus } from "../lib/types";
import { SourceDetail } from "./source-detail";

type SourceMode = CreateSourceInput["type"] | "WEBSITE" | "YOUTUBE" | "PDF";

type SourceLibraryProps = {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSourceId: string | null;
  onSourceSelect: (sourceId: string | null) => void;
  /** When true, only render the dialog (no source list panel) */
  dialogOnly?: boolean;
};

const sourceOptions: {
  value: SourceMode;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  activeBg: string;
  activeBorder: string;
}[] = [
  {
    value: "PDF",
    label: "PDF",
    icon: FileText,
    color: "text-red-400",
    bg: "bg-red-400/10",
    activeBg: "bg-red-400/15",
    activeBorder: "border-red-400/60",
  },
  {
    value: "TEXT",
    label: "Text",
    icon: StickyNote,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    activeBg: "bg-amber-400/15",
    activeBorder: "border-amber-400/60",
  },
  {
    value: "MARKDOWN",
    label: "MD",
    icon: FileText,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    activeBg: "bg-violet-400/15",
    activeBorder: "border-violet-400/60",
  },
  {
    value: "WEBSITE",
    label: "Web",
    icon: Globe,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    activeBg: "bg-sky-400/15",
    activeBorder: "border-sky-400/60",
  },
  {
    value: "YOUTUBE",
    label: "YouTube",
    icon: Play,
    color: "text-red-500",
    bg: "bg-red-500/10",
    activeBg: "bg-red-500/15",
    activeBorder: "border-red-500/60",
  },
];

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

function getSourceCardMeta(type: string) {
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

const STATUS_DOT: Record<SourceStatus, { cls: string; icon: React.ElementType }> = {
  READY: { cls: "text-emerald-500", icon: CheckCircle2 },
  PROCESSING: { cls: "text-amber-500", icon: Loader2 },
  PENDING: { cls: "text-sky-400", icon: Clock },
  FAILED: { cls: "text-destructive", icon: XCircle },
};

/* ── Add Source Dialog (shared logic) ──────────────────────────── */

function useAddSourceDialog(workspaceId: string) {
  const createMutation = useCreateSource(workspaceId);
  const websiteMutation = useImportWebsite(workspaceId);
  const youtubeMutation = useImportYoutube(workspaceId);
  const pdfMutation = useUploadPdf(workspaceId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<SourceMode>("PDF");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const isPending =
    createMutation.isPending ||
    websiteMutation.isPending ||
    youtubeMutation.isPending ||
    pdfMutation.isPending;
  const mutationError =
    createMutation.error ||
    websiteMutation.error ||
    youtubeMutation.error ||
    pdfMutation.error;

  function resetForm() {
    setTitle("");
    setContent("");
    setUrl("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleCreateSource(
    event: React.FormEvent<HTMLFormElement>,
    onSuccess: () => void,
  ) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedUrl = url.trim();

    try {
      if (mode === "PDF") {
        if (!file || file.type !== "application/pdf") return;
        await pdfMutation.mutateAsync(file);
      } else if (mode === "WEBSITE") {
        if (!trimmedUrl) return;
        await websiteMutation.mutateAsync({
          url: trimmedUrl,
          title: trimmedTitle || undefined,
        });
      } else if (mode === "YOUTUBE") {
        if (!trimmedUrl) return;
        await youtubeMutation.mutateAsync({
          url: trimmedUrl,
          title: trimmedTitle || undefined,
        });
      } else {
        if (!trimmedTitle || !trimmedContent) return;
        await createMutation.mutateAsync({
          type: mode,
          title: trimmedTitle,
          content: trimmedContent,
        });
      }
      resetForm();
      onSuccess();
    } catch {
      // error rendered in form
    }
  }

  return {
    mode, setMode, title, setTitle, content, setContent,
    url, setUrl, file, setFile, fileInputRef,
    isPending, mutationError, handleCreateSource, resetForm,
  };
}

/* ── SourceLibrary export ───────────────────────────────────────── */

export function SourceLibrary({
  workspaceId,
  open,
  onOpenChange,
  activeSourceId,
  onSourceSelect,
  dialogOnly = false,
}: SourceLibraryProps) {
  const form = useAddSourceDialog(workspaceId);

  /* Add Source Dialog */
  const dialog = (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg gap-0 p-0 overflow-hidden">
        <DialogHeader className="border-b border-border/70 px-6 py-4">
          <DialogTitle className="text-[15px]">Add source</DialogTitle>
        </DialogHeader>

        {/* Source type selector */}
        <div className="flex items-center gap-2 border-b border-border/70 px-6 py-4">
          {sourceOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = form.mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => form.setMode(option.value)}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
                  isSelected
                    ? `${option.activeBg} ${option.activeBorder}`
                    : "border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border"
                }`}
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-lg ${
                    isSelected ? option.bg : "bg-muted"
                  }`}
                >
                  <Icon className={`size-4 ${isSelected ? option.color : "text-muted-foreground"}`} />
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    isSelected ? option.color : "text-muted-foreground"
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form
          className="grid gap-4 px-6 py-5"
          onSubmit={(e) => void form.handleCreateSource(e, () => onOpenChange(false))}
        >
          {form.mode === "PDF" ? (
            <>
              <div className="grid gap-2">
                <Label className="text-[12px] font-medium text-muted-foreground">Upload PDF</Label>
                <label
                  htmlFor="source-file"
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border/70 bg-muted/20 px-4 py-7 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <Upload className="size-6 text-muted-foreground/60" />
                  <span className="text-[12.5px] text-muted-foreground">
                    {form.file ? form.file.name : "Click to select a PDF"}
                  </span>
                  <span className="text-[11px] text-muted-foreground/50">up to 25 MB</span>
                  <input
                    accept="application/pdf,.pdf"
                    className="sr-only"
                    disabled={form.isPending}
                    id="source-file"
                    onChange={(e) => form.setFile(e.target.files?.[0] ?? null)}
                    ref={form.fileInputRef}
                    required
                    type="file"
                  />
                </label>
              </div>
              <OptionalTitleInput
                disabled={form.isPending}
                value={form.title}
                onChange={form.setTitle}
                placeholder="Uses the file name if empty"
              />
            </>
          ) : form.mode === "WEBSITE" || form.mode === "YOUTUBE" ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="source-url" className="text-[12px] font-medium text-muted-foreground">
                  {form.mode === "WEBSITE" ? "Website URL" : "YouTube URL"}
                </Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    className="pl-8 text-[13px]"
                    disabled={form.isPending}
                    id="source-url"
                    onChange={(e) => form.setUrl(e.target.value)}
                    placeholder={
                      form.mode === "WEBSITE"
                        ? "https://example.com/article"
                        : "https://youtube.com/watch?v=..."
                    }
                    required
                    type="url"
                    value={form.url}
                  />
                </div>
              </div>
              <OptionalTitleInput
                disabled={form.isPending}
                value={form.title}
                onChange={form.setTitle}
                placeholder="Uses the imported title if empty"
              />
            </>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="source-title" className="text-[12px] font-medium text-muted-foreground">
                  Title
                </Label>
                <Input
                  className="text-[13px]"
                  disabled={form.isPending}
                  id="source-title"
                  maxLength={200}
                  onChange={(e) => form.setTitle(e.target.value)}
                  placeholder="A useful note"
                  required
                  value={form.title}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source-content" className="text-[12px] font-medium text-muted-foreground">
                  Content
                </Label>
                <Textarea
                  className="min-h-32 resize-none text-[13px]"
                  disabled={form.isPending}
                  id="source-content"
                  onChange={(e) => form.setContent(e.target.value)}
                  placeholder={
                    form.mode === "MARKDOWN"
                      ? "Write markdown content..."
                      : "Write or paste your content..."
                  }
                  required
                  value={form.content}
                />
              </div>
            </>
          )}

          {form.mutationError && (
            <p className="text-[12px] text-destructive">
              {getErrorMessage(form.mutationError, "Unable to create source.")}
            </p>
          )}

          <DialogFooter className="pt-1">
            <Button
              disabled={form.isPending}
              onClick={() => { form.resetForm(); onOpenChange(false); }}
              type="button"
              variant="ghost"
              size="sm"
              className="text-[12px]"
            >
              Cancel
            </Button>
            <Button disabled={form.isPending} type="submit" size="sm" className="gap-1.5 text-[12px]">
              <Plus className="size-3.5" />
              {form.isPending ? "Adding..." : "Add source"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (dialogOnly) {
    return dialog;
  }

  /* Sources Panel */
  return (
    <>
      <SourcesPanel
        activeSourceId={activeSourceId}
        onSourceSelect={onSourceSelect}
        workspaceId={workspaceId}
        onOpenChange={onOpenChange}
      />
      {dialog}
    </>
  );
}

/* ── SourcesPanel ───────────────────────────────────────────────── */

function SourcesPanel({
  workspaceId,
  onOpenChange,
  activeSourceId,
  onSourceSelect,
}: {
  workspaceId: string;
  onOpenChange: (open: boolean) => void;
  activeSourceId: string | null;
  onSourceSelect: (sourceId: string | null) => void;
}) {
  const { data: sources, error, isError, isLoading, refetch } =
    useSources(workspaceId);
  const deleteSource = useDeleteSource(workspaceId);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  /* Show detail view when a source is selected */
  if (activeSourceId) {
    return (
      <SourceDetail
        workspaceId={workspaceId}
        sourceId={activeSourceId}
        onBack={() => onSourceSelect(null)}
      />
    );
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (!sources) return;
    if (selectedIds.size === sources.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sources.map((s) => s.id)));
    }
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    try {
      for (const id of Array.from(selectedIds)) {
        await deleteSource.mutateAsync(id);
      }
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
    } finally {
      setBulkDeleting(false);
    }
  }

  const hasSelection = selectedIds.size > 0;
  const allSelected = sources ? selectedIds.size === sources.length && sources.length > 0 : false;

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Library
          </p>
          <h2 className="mt-1 text-[17px] font-semibold tracking-tight">Sources</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Bulk delete controls */}
          {hasSelection && !bulkDeleteConfirm && (
            <button
              type="button"
              onClick={() => setBulkDeleteConfirm(true)}
              className="flex items-center gap-1.5 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-1.5 text-[12px] font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" />
              Delete {selectedIds.size} selected
            </button>
          )}
          {bulkDeleteConfirm && (
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] text-destructive">
                Delete {selectedIds.size} source{selectedIds.size > 1 ? "s" : ""}?
              </span>
              <button
                type="button"
                onClick={() => setBulkDeleteConfirm(false)}
                className="rounded-xl border border-border/60 px-2.5 py-1.5 text-[11.5px] text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bulkDeleting}
                onClick={() => void handleBulkDelete()}
                className="flex items-center gap-1.5 rounded-xl bg-destructive px-3 py-1.5 text-[11.5px] font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {bulkDeleting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                Confirm delete
              </button>
            </div>
          )}
          <Button
            size="sm"
            className="hidden gap-1.5 text-[12px] sm:inline-flex"
            onClick={() => onOpenChange(true)}
          >
            <Plus className="size-3.5" />
            Add source
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Could not load sources</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>{getErrorMessage(error, "Unable to load sources.")}</span>
            <Button
              className="w-fit gap-1.5"
              onClick={() => void refetch()}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="size-3.5" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : sources?.length ? (
        <>
          {/* Select all toolbar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {allSelected ? (
                <CheckSquare className="size-4 text-primary" />
              ) : (
                <Square className="size-4" />
              )}
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            {hasSelection && (
              <span className="text-[11px] text-muted-foreground/60">
                {selectedIds.size} of {sources.length} selected
              </span>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                onClick={() => onSourceSelect(source.id)}
                selected={selectedIds.has(source.id)}
                onToggleSelect={(e) => {
                  e.stopPropagation();
                  toggleSelect(source.id);
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/50 px-6 py-14 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
            <FileText className="size-5 text-muted-foreground/60" />
          </div>
          <h3 className="mt-4 text-[14px] font-medium">No sources yet</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] text-muted-foreground">
            Add a PDF, website, YouTube video, or note to start building this workspace.
          </p>
          <Button className="mt-5 gap-1.5" size="sm" onClick={() => onOpenChange(true)}>
            <Plus className="size-3.5" />
            Add source
          </Button>
        </div>
      )}
    </section>
  );
}

/* ── SourceCard ─────────────────────────────────────────────────── */

function SourceCard({
  source,
  onClick,
  selected,
  onToggleSelect,
}: {
  source: Source;
  onClick: () => void;
  selected: boolean;
  onToggleSelect: (e: React.MouseEvent) => void;
}) {
  const meta = getSourceCardMeta(source.type);
  const Icon = meta.icon;
  const statusDot = STATUS_DOT[source.status] ?? STATUS_DOT.PENDING;
  const StatusIcon = statusDot.icon;

  return (
    <div
      className={`group relative w-full rounded-2xl border bg-card p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${
        selected
          ? "border-primary/60 ring-1 ring-primary/30 bg-primary/5"
          : "border-border/70 hover:border-primary/40"
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Checkbox overlay */}
      <button
        type="button"
        onClick={onToggleSelect}
        className={`absolute right-3 top-3 z-10 flex size-5 items-center justify-center rounded-md border transition-all ${
          selected
            ? "border-primary bg-primary text-white opacity-100"
            : "border-border/60 bg-background/80 opacity-0 group-hover:opacity-100"
        }`}
        aria-label={selected ? "Deselect source" : "Select source"}
      >
        {selected && <CheckSquare className="size-3.5" />}
      </button>

      <div className="flex items-start gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
          <Icon className={`size-4 ${meta.color}`} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13px] font-medium transition-colors group-hover:text-primary">
            {source.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5">
            <StatusIcon
              className={`size-3 shrink-0 ${statusDot.cls} ${
                source.status === "PROCESSING" ? "animate-spin" : ""
              }`}
            />
            <p className="text-[11px] text-muted-foreground">
              {meta.label} · {source.status.charAt(0) + source.status.slice(1).toLowerCase()}
            </p>
          </div>
          {source.url ? (
            <p className="mt-1.5 truncate text-[11px] text-muted-foreground/60">
              {source.url}
            </p>
          ) : source.content ? (
            <p className="mt-1.5 line-clamp-1 text-[11.5px] text-muted-foreground/70">
              {source.content}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────── */

function OptionalTitleInput({
  disabled,
  onChange,
  placeholder,
  value,
}: {
  disabled: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="source-title-optional" className="text-[12px] font-medium text-muted-foreground">
        Title <span className="text-muted-foreground/50">(optional)</span>
      </Label>
      <Input
        className="text-[13px]"
        disabled={disabled}
        id="source-title-optional"
        maxLength={200}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
}
