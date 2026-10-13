"use client";

import { useState } from "react";
import {
  BrainIcon,
  Edit,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { ApiError } from "@/shared/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateMemory,
  useDeleteMemory,
  useMemories,
  useUpdateMemory,
} from "../hooks/use-memory";
import type { UserMemory } from "../lib/types";
import { MemoryFormDialog } from "./memory-form-dialog";

export function MemorySettings() {
  const { data: memories, error, isLoading, isError, refetch } = useMemories();
  const createMemory = useCreateMemory();
  const updateMemory = useUpdateMemory();
  const deleteMemory = useDeleteMemory();

  const [editingMemory, setEditingMemory] = useState<UserMemory | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  async function handleDelete(memory: UserMemory) {
    try {
      await deleteMemory.mutateAsync(memory.id);
    } catch {}
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </section>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <XCircle className="size-4" />
        <AlertTitle>Could not load memories</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <span>
            {error instanceof ApiError
              ? error.message
              : "Please try again in a moment."}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="w-fit gap-1.5"
            onClick={() => void refetch()}
          >
            <RefreshCw className="size-3.5" />
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 py-2">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BrainIcon className="size-5" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-semibold">
            My memories
          </h2>
          <p className="text-sm text-muted-foreground">
            {memories?.length
              ? `${memories.length} memory${memories.length === 1 ? "" : "s"} saved`
              : "No memories saved yet"}
          </p>
        </div>
      </div>

      {memories?.length ? (
        <div className="space-y-3">
          {memories.map((memory) => (
            <MemoryRow
              key={memory.id}
              memory={memory}
              isDeleting={deleteMemory.isPending}
              onEdit={() => setEditingMemory(memory)}
              onDelete={() => void handleDelete(memory)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card p-8 text-center">
          <BrainIcon className="mx-auto size-8 text-muted-foreground/40" />
          <h3 className="mt-4 text-[14px] font-medium">No memories yet</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] text-muted-foreground">
            These are facts you explicitly save to remember across
            conversations in this workspace.
          </p>
          <Button className="mt-5 gap-1.5 text-[12px]" size="sm">
            <Plus className="size-3.5" />
            Add memory
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          className="gap-1.5"
          disabled={createMemory.isPending}
          onClick={() => {
            setEditingMemory(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-3.5" />
          Add memory
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => void refetch()}
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>

      <MemoryFormDialog
        isPending={
          createMemory.isPending ||
          updateMemory.isPending ||
          (editingMemory !== null && updateMemory.isPending)
        }
        memory={editingMemory}
        onOpenChange={(open) => {
          if (!open) {
            setEditingMemory(null);
          }
          setFormOpen(open);
        }}
        open={formOpen}
        onSubmit={async (values) => {
          if (editingMemory) {
            await updateMemory.mutateAsync({
              memoryId: editingMemory.id,
              input: values,
            });
          } else {
            await createMemory.mutateAsync(values);
          }
          setEditingMemory(null);
        }}
      />
    </div>
  );
}

function MemoryRow({
  memory,
  isDeleting,
  onEdit,
  onDelete,
}: {
  memory: UserMemory;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const badge =
    memory.source === "manual"
      ? "Manual"
      : memory.categories?.length
        ? memory.categories.join(", ")
        : "Learned";

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3.5 shadow-sm">
      <BrainIcon className="mt-0.5 size-4 text-muted-foreground/60" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-foreground break-words">
          {memory.memory}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10.5px]">
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground">
            {badge}
          </span>
          <span className="text-muted-foreground/50">
            Updated {new Date(memory.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="xs"
          aria-label="Edit memory"
          onClick={onEdit}
        >
          <Edit className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="xs"
          aria-label="Delete memory"
          disabled={isDeleting}
          onClick={onDelete}
        >
          <Trash2 className="size-3 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
