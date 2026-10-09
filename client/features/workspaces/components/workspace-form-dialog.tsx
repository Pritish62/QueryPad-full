"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { Workspace } from "../lib/types";

const iconOptions = ["📚", "📖", "📝", "🎓", "💡", "🔬", "🧠", "✨"];

type WorkspaceFormDialogProps = {
  open: boolean;
  workspace?: Workspace | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    title: string;
    description?: string;
    icon?: string;
  }) => Promise<void>;
};

export function WorkspaceFormDialog({
  open,
  workspace,
  isPending,
  onOpenChange,
  onSubmit,
}: WorkspaceFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📚");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(workspace?.title ?? "");
      setDescription(workspace?.description ?? "");
      setIcon(workspace?.icon ?? "📚");
      setError(null);
    }
  }, [open, workspace]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    setError(null);

    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim() || undefined,
        icon,
      });
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save workspace.",
      );
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {workspace ? "Edit workspace" : "Create workspace"}
          </DialogTitle>
          <DialogDescription>
            {workspace
              ? "Update your workspace details."
              : "Create a notebook for your sources and chats."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((option) => (
                <button
                  aria-label={`Select ${option} icon`}
                  className={`flex size-10 items-center justify-center rounded-xl border text-lg transition-colors ${
                    icon === option
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                  key={option}
                  onClick={() => setIcon(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="workspace-dialog-title">Title</Label>
            <Input
              disabled={isPending}
              id="workspace-dialog-title"
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="My research notebook"
              value={title}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="workspace-dialog-description">Description</Label>
            <Textarea
              disabled={isPending}
              id="workspace-dialog-description"
              maxLength={500}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this workspace about?"
              rows={3}
              value={description}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? <Spinner /> : null}
              {workspace ? "Save changes" : "Create workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
