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
import { MindMapView } from "./mind-map-view";

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
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        All learning tools
      </button>

      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
            <Icon className={`size-5 ${meta.color}`} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-semibold leading-snug">{artifact.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold ${meta.bg} ${meta.color} border-current/20`}>
                <Icon className="size-2.5" />
                {meta.label}
              </span>
              <ArtifactStatusBadge status={artifact.status} />
              <span className="text-[11px] text-muted-foreground">
                {new Date(artifact.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
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

function SummaryView({ content }: { content: SummaryContent }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/85">
        {content.markdown}
      </p>
    </div>
  );
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

function FlashcardsView({ content }: { content: FlashcardsContent }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {content.cards.map((card, index) => (
        <FlashcardCard key={index} front={card.front} back={card.back} />
      ))}
    </div>
  );
}

function FlashcardCard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((value) => !value)}
      className="flex min-h-40 flex-col rounded-2xl border border-border/70 bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {flipped ? "Back" : "Front"}
      </span>
      <p className="mt-3 flex-1 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/85">
        {flipped ? back : front}
      </p>
      <span className="mt-3 text-[10px] text-muted-foreground/50">Tap to flip</span>
    </button>
  );
}

function QuizView({ content }: { content: QuizContent }) {
  return (
    <div className="space-y-4">
      {content.questions.map((question, index) => (
        <div key={index} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-[13px] font-medium">
            {index + 1}. {question.question}
          </p>
          <ul className="mt-3 space-y-2">
            {question.options.map((option, optionIndex) => {
              const isCorrect = optionIndex === question.correctIndex;
              return (
                <li
                  key={optionIndex}
                  className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-[12.5px] ${
                    isCorrect
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border/60 text-muted-foreground"
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
                  ) : (
                    <span className="mt-0.5 size-3.5 shrink-0 rounded-full border border-current/30" />
                  )}
                  <span>{option}</span>
                </li>
              );
            })}
          </ul>
          {question.explanation && (
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/80">Explanation: </span>
              {question.explanation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ReportView({ content }: { content: ReportContent }) {
  return (
    <div className="space-y-4">
      {content.sections?.map((section, index) => (
        <div key={index} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h3 className="text-[13px] font-semibold">{section.title}</h3>
          <p className="mt-2 whitespace-pre-wrap text-[12.5px] leading-relaxed text-foreground/80">
            {section.content}
          </p>
        </div>
      ))}
      {content.markdown && (
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-foreground/80">
            {content.markdown}
          </p>
        </div>
      )}
    </div>
  );
}
