"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useArtifact } from "../hooks/use-artifacts";
import { artifactTypeMeta } from "../lib/artifact-meta";
import type {
  Artifact,
  ArtifactStatus,
  FlashcardsContent,
  MindMapContent,
  QuizContent,
  ReportContent,
  SummaryContent,
  TakeawaysContent,
} from "../lib/types";
import { ArtifactStatusBadge } from "./artifact-status-badge";
import { FlashcardsView } from "./flashcards-view";
import { MindMapView } from "./mind-map-view";
import { QuizView } from "./quiz-view";
import { ReportView } from "./report-view";
import { SummaryView } from "./summary-view";

type ArtifactDetailProps = {
  workspaceId: string;
  artifactId: string;
  onBack: () => void;
};

export function ArtifactDetail({
  workspaceId,
  artifactId,
  onBack,
}: ArtifactDetailProps) {
  const { data: artifact, isLoading, isError, refetch } = useArtifact(
    workspaceId,
    artifactId,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 p-1">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !artifact) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <XCircle className="size-10 text-destructive/60" />
        <p className="text-[13px] text-muted-foreground">
          Could not load this learning tool.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-[12px]"
          onClick={() => void refetch()}
        >
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  return <ArtifactDetailView artifact={artifact} onBack={onBack} />;
}

function ArtifactDetailView({
  artifact,
  onBack,
}: {
  artifact: Artifact;
  onBack: () => void;
}) {
  const meta = artifactTypeMeta[artifact.type];
  const Icon = meta.icon;

  return (
    <div className="flex flex-col gap-4">
      {/* ── UNIFIED COMPACT TOP HEADER CARD ─────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-3 sm:p-3.5 shadow-sm">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">All learning tools</span>
          </button>

          <span className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
            <Icon className={`size-4 ${meta.color}`} />
          </span>

          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <h2 className="truncate text-[14.5px] font-semibold text-foreground max-w-[260px] sm:max-w-md">
              {artifact.title}
            </h2>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.bg} ${meta.color} border-current/20`}>
              <Icon className="size-2.5" />
              {meta.label}
            </span>
            <ArtifactStatusBadge status={artifact.status} />
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              {new Date(artifact.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <StatusBanner status={artifact.status} metadata={artifact.metadata} />

      {artifact.status === "READY" && artifact.content ? (
        <ArtifactContent artifact={artifact} />
      ) : null}
    </div>
  );
}

function StatusBanner({
  status,
  metadata,
}: {
  status: ArtifactStatus;
  metadata: Record<string, unknown> | null;
}) {
  if (status === "READY") return null;

  if (status === "FAILED") {
    const error =
      typeof metadata?.processingError === "string"
        ? metadata.processingError
        : "Something went wrong while generating this learning tool.";
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4">
        <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div>
          <p className="text-[13px] font-medium text-destructive">Generation failed</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const processing = status === "PROCESSING";
  const Icon = processing ? Loader2 : Clock;

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-5 py-4 ${
        processing
          ? "border-amber-400/30 bg-amber-400/5"
          : "border-sky-400/30 bg-sky-400/5"
      }`}
    >
      <Icon
        className={`mt-0.5 size-4 shrink-0 ${processing ? "animate-spin text-amber-500" : "text-sky-500"}`}
      />
      <div>
        <p
          className={`text-[13px] font-medium ${
            processing
              ? "text-amber-600 dark:text-amber-400"
              : "text-sky-600 dark:text-sky-400"
          }`}
        >
          {processing ? "Generating your learning tool" : "Queued for generation"}
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          This runs in the background and updates automatically.
        </p>
      </div>
    </div>
  );
}

function ArtifactContent({ artifact }: { artifact: Artifact }) {
  switch (artifact.type) {
    case "SUMMARY":
      return <SummaryView content={artifact.content as SummaryContent} />;
    case "TAKEAWAYS":
      return <TakeawaysView content={artifact.content as TakeawaysContent} />;
    case "FLASHCARDS":
      return <FlashcardsView content={artifact.content as FlashcardsContent} />;
    case "QUIZ":
      return <QuizView content={artifact.content as QuizContent} />;
    case "MINDMAP":
      return <MindMapView content={artifact.content as MindMapContent} />;
    case "REPORT":
      return <ReportView content={artifact.content as ReportContent} />;
    default:
      return null;
  }
}



function TakeawaysView({ content }: { content: TakeawaysContent }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <ul className="space-y-2.5">
        {content.items.map((item, index) => (
          <li key={index} className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span className="text-[13px] leading-relaxed text-foreground/85">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}






