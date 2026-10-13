"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ApiError } from "@/shared/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateArtifact } from "../hooks/use-artifacts";
import { artifactTypeMeta, artifactTypes } from "../lib/artifact-meta";
import type { ArtifactType } from "../lib/types";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export function GenerateArtifactDialog({
  workspaceId,
  open,
  onOpenChange,
}: {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createMutation = useCreateArtifact(workspaceId);
  const [type, setType] = useState<ArtifactType>("SUMMARY");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createMutation.mutateAsync({ type });
      onOpenChange(false);
    } catch {
      // error rendered in the form
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border/70 px-6 py-4">
          <DialogTitle className="text-[15px]">Generate learning tool</DialogTitle>
        </DialogHeader>

        <form className="grid gap-5 px-6 py-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-2">
            {artifactTypes.map((artifactType) => {
              const meta = artifactTypeMeta[artifactType];
              const Icon = meta.icon;
              const selected = type === artifactType;

              return (
                <button
                  key={artifactType}
                  type="button"
                  onClick={() => setType(artifactType)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-all ${
                    selected
                      ? `${meta.bg} border-primary/60`
                      : "border-border/60 bg-muted/30 hover:border-border hover:bg-muted/60"
                  }`}
                >
                  <span
                    className={`flex size-8 items-center justify-center rounded-lg ${
                      selected ? meta.bg : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`size-4 ${selected ? meta.color : "text-muted-foreground"}`}
                    />
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      selected ? meta.color : "text-muted-foreground"
                    }`}
                  >
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[12px] text-muted-foreground">
            Generates a {artifactTypeMeta[type].label.toLowerCase()} from your
            ready sources. Processing runs in the background.
          </p>

          {createMutation.error && (
            <p className="text-[12px] text-destructive">
              {getErrorMessage(createMutation.error, "Unable to generate.")}
            </p>
          )}

          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[12px]"
              disabled={createMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 text-[12px]"
              disabled={createMutation.isPending}
            >
              <Sparkles className="size-3.5" />
              {createMutation.isPending ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
