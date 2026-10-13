"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  Save,
  Settings,
  Trash2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useDeleteWorkspace,
  useUpdateWorkspace,
} from "../hooks/use-workspaces";
import type { ChatModel, Workspace } from "../lib/types";

const ICON_OPTIONS = ["📚", "📖", "📝", "🎓", "💡", "🔬", "🧠", "✨"];

const CHAT_MODELS: {
  value: ChatModel;
  label: string;
  description: string;
}[] = [
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Fast and efficient for everyday questions.",
  },
  {
    value: "gpt-4o",
    label: "GPT-4o",
    description: "More capable for complex reasoning and long answers.",
  },
];

type WorkspaceSettingsProps = {
  workspace: Workspace;
  onDeleted: () => void;
};

export function WorkspaceSettings({
  workspace,
  onDeleted,
}: WorkspaceSettingsProps) {
  const updateWorkspace = useUpdateWorkspace(workspace.id);
  const deleteWorkspace = useDeleteWorkspace();
  const [title, setTitle] = useState(workspace.title);
  const [description, setDescription] = useState(workspace.description ?? "");
  const [icon, setIcon] = useState(workspace.icon ?? "");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [defaultModel, setDefaultModel] = useState<ChatModel>(
    isChatModel(workspace.defaultModel)
      ? workspace.defaultModel
      : "gpt-4o-mini",
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTitle(workspace.title);
    setDescription(workspace.description ?? "");
    setIcon(workspace.icon ?? "");
    setDefaultModel(
      isChatModel(workspace.defaultModel)
        ? workspace.defaultModel
        : "gpt-4o-mini",
    );
  }, [workspace]);

  const isDirty =
    title !== workspace.title ||
    description !== (workspace.description ?? "") ||
    icon !== (workspace.icon ?? "") ||
    defaultModel !== workspace.defaultModel;

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage("Workspace name is required.");
      return;
    }
    setErrorMessage(null);
    try {
      await updateWorkspace.mutateAsync({
        title: trimmedTitle,
        description: description.trim(),
        icon: icon.trim(),
        defaultModel,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save workspace settings.",
      );
    }
  }

  async function handleDelete() {
    if (deleteConfirmation !== workspace.title) return;
    setErrorMessage(null);
    try {
      await deleteWorkspace.mutateAsync(workspace.id);
      onDeleted();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this workspace.",
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 py-2">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Settings className="size-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Workspace
          </p>
          <h2 className="text-[17px] font-semibold tracking-tight">Settings</h2>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[12.5px] text-destructive"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
        {/* Details card */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-[13px] font-semibold">Workspace details</h3>

          <div className="grid gap-4 sm:grid-cols-[5rem_1fr]">
            {/* Icon */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-medium text-muted-foreground">
                Icon
              </label>
              <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                <PopoverTrigger
                  aria-label="Choose workspace icon"
                  className="flex size-12 items-center justify-center rounded-xl border border-border/70 bg-background/60 text-xl outline-none transition hover:border-primary/50 hover:bg-muted/40 focus-visible:ring-1 focus-visible:ring-primary/30"
                >
                  {icon || "📚"}
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-2">
                  <div className="grid grid-cols-4 gap-1">
                    {ICON_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-label={`Select ${option} icon`}
                        onClick={() => {
                          setIcon(option);
                          setIconPickerOpen(false);
                        }}
                        className={`flex size-9 items-center justify-center rounded-lg text-lg transition-colors ${
                          icon === option
                            ? "bg-primary/10 ring-1 ring-primary/40"
                            : "hover:bg-muted"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <p className="text-[10.5px] text-muted-foreground/60">Emoji</p>
            </div>

            {/* Title + Description */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="workspace-title" className="text-[11.5px] font-medium text-muted-foreground">
                  Name
                </label>
                <input
                  id="workspace-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  required
                  placeholder="My workspace"
                  className="h-10 w-full rounded-xl border border-border/70 bg-background/60 px-3 text-[13px] outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="workspace-description" className="text-[11.5px] font-medium text-muted-foreground">
                  Description{" "}
                  <span className="text-muted-foreground/50">(optional)</span>
                </label>
                <textarea
                  id="workspace-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="What are you working on in this workspace?"
                  className="w-full resize-none rounded-xl border border-border/70 bg-background/60 px-3 py-2.5 text-[13px] outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
                <p className="text-right text-[10.5px] text-muted-foreground/50">
                  {description.length}/500
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Model card */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="size-4 text-muted-foreground" />
            <h3 className="text-[13px] font-semibold">Default model</h3>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {CHAT_MODELS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setDefaultModel(m.value)}
                className={`flex-1 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                  defaultModel === m.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11.5px] text-muted-foreground">
            {CHAT_MODELS.find((m) => m.value === defaultModel)?.description}
          </p>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!isDirty || updateWorkspace.isPending}
            className="gap-1.5 text-[12px]"
          >
            {updateWorkspace.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : saved ? (
              <Check className="size-3.5" />
            ) : (
              <Save className="size-3.5" />
            )}
            {updateWorkspace.isPending
              ? "Saving…"
              : saved
                ? "Saved!"
                : "Save changes"}
          </Button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="rounded-xl border border-destructive/25 bg-destructive/[0.02] p-4">
        <div className="flex items-center gap-2">
          <Trash2 className="size-4 text-destructive" />
          <h3 className="text-[13px] font-semibold text-destructive">
            Delete workspace
          </h3>
        </div>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          This permanently deletes this workspace and all of its sources,
          conversations, and data. This cannot be undone.
        </p>

        <div className="mt-3 flex items-center gap-2">
          <input
            id="delete-workspace"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder={`Type "${workspace.title}" to confirm`}
            className="h-9 min-w-0 flex-1 rounded-lg border border-border/70 bg-background/60 px-3 text-[12.5px] outline-none transition focus:border-destructive focus:ring-1 focus:ring-destructive/30"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="gap-1.5 text-[12px]"
            disabled={
              deleteConfirmation !== workspace.title ||
              deleteWorkspace.isPending
            }
            onClick={() => void handleDelete()}
          >
            {deleteWorkspace.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function isChatModel(value: string): value is ChatModel {
  return value === "gpt-4o-mini" || value === "gpt-4o";
}
