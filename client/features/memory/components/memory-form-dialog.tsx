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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UserMemory } from "../lib/types";

type MemoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memory: UserMemory | null;
  onSubmit: (values: { memory: string }) => Promise<void>;
  isPending: boolean;
};

export function MemoryFormDialog({
  open,
  onOpenChange,
  memory,
  onSubmit,
  isPending,
}: MemoryFormDialogProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(memory?.memory ?? "");
  }, [memory]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;

    await onSubmit({ memory: value });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {memory ? "Edit memory" : "Add memory"}
          </DialogTitle>
          <DialogDescription>
            {memory
              ? "Update the text for this memory."
              : "Add a fact you want remembered across conversations."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div className="grid gap-2">
            <Label htmlFor="memory-text">Memory</Label>
            <Textarea
              id="memory-text"
              maxLength={2000}
              onChange={(event) => setText(event.target.value)}
              placeholder="e.g. I prefer summaries in bullet points"
              rows={4}
              required
              value={text}
            />
            <p className="text-right text-[11.5px] text-muted-foreground/60">
              {text.length}/2000
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit" size="sm">
              {isPending ? "Saving…" : memory ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
