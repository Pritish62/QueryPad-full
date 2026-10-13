import type { ElementType } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Layers,
  ListChecks,
  Loader2,
  Network,
  XCircle,
} from "lucide-react";
import type { ArtifactStatus, ArtifactType } from "./types";

export const artifactTypes: readonly ArtifactType[] = [
  "SUMMARY",
  "TAKEAWAYS",
  "FLASHCARDS",
  "QUIZ",
  "MINDMAP",
  "REPORT",
];

export const artifactTypeMeta: Record<
  ArtifactType,
  { label: string; icon: ElementType; color: string; bg: string }
> = {
  SUMMARY: { label: "Summary", icon: FileText, color: "text-sky-400", bg: "bg-sky-400/10" },
  TAKEAWAYS: { label: "Key Takeaways", icon: ListChecks, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  FLASHCARDS: { label: "Flashcards", icon: Layers, color: "text-amber-400", bg: "bg-amber-400/10" },
  QUIZ: { label: "Quiz", icon: HelpCircle, color: "text-violet-400", bg: "bg-violet-400/10" },
  MINDMAP: { label: "Mind Map", icon: Network, color: "text-rose-400", bg: "bg-rose-400/10" },
  REPORT: { label: "Report", icon: BookOpen, color: "text-indigo-400", bg: "bg-indigo-400/10" },
};

export const artifactStatusMeta: Record<
  ArtifactStatus,
  { label: string; icon: ElementType; cls: string }
> = {
  READY: { label: "Ready", icon: CheckCircle2, cls: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
  PROCESSING: { label: "Processing", icon: Loader2, cls: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
  PENDING: { label: "Pending", icon: Clock, cls: "text-sky-500 bg-sky-500/10 border-sky-500/30" },
  FAILED: { label: "Failed", icon: XCircle, cls: "text-destructive bg-destructive/10 border-destructive/30" },
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
