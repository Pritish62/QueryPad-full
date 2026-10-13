"use client";

import { useState } from "react";
import { AlertCircle, GraduationCap, RefreshCw, Sparkles } from "lucide-react";
import { ApiError } from "@/shared/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useArtifacts } from "../hooks/use-artifacts";
import { ArtifactCard } from "./artifact-card";
import { ArtifactDetail } from "./artifact-detail";
import { GenerateArtifactDialog } from "./generate-artifact-dialog";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export function LearningTools({ workspaceId }: { workspaceId: string }) {
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);

  if (activeArtifactId) {
    return (
      <ArtifactDetail
        workspaceId={workspaceId}
        artifactId={activeArtifactId}
        onBack={() => setActiveArtifactId(null)}
      />
    );
  }

  return (
    <>
      <LearningToolsPanel
        workspaceId={workspaceId}
        onSelect={setActiveArtifactId}
        onGenerate={() => setGenerateOpen(true)}
      />
      <GenerateArtifactDialog
        workspaceId={workspaceId}
        open={generateOpen}
        onOpenChange={setGenerateOpen}
      />
    </>
  );
}

function LearningToolsPanel({
  workspaceId,
  onSelect,
  onGenerate,
}: {
  workspaceId: string;
  onSelect: (artifactId: string) => void;
  onGenerate: () => void;
}) {
  const { data: artifacts, error, isError, isLoading, refetch } =
    useArtifacts(workspaceId);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Learning
          </p>
          <h2 className="mt-1 text-[17px] font-semibold tracking-tight">
            Learning tools
          </h2>
        </div>
        <Button
          size="sm"
          className="hidden gap-1.5 text-[12px] sm:inline-flex"
          onClick={onGenerate}
        >
          <Sparkles className="size-3.5" />
          Generate
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Could not load learning tools</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>{getErrorMessage(error, "Unable to load learning tools.")}</span>
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
      ) : artifacts?.length ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {artifacts.map((artifact) => (
            <ArtifactCard
              key={artifact.id}
              artifact={artifact}
              onClick={() => onSelect(artifact.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/50 px-6 py-14 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
            <GraduationCap className="size-5 text-muted-foreground/60" />
          </div>
          <h3 className="mt-4 text-[14px] font-medium">No learning tools yet</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] text-muted-foreground">
            Generate summaries, key takeaways, flashcards, quizzes, and mind maps
            from your ready sources.
          </p>
          <Button className="mt-5 gap-1.5" size="sm" onClick={onGenerate}>
            <Sparkles className="size-3.5" />
            Generate
          </Button>
        </div>
      )}
    </section>
  );
}
