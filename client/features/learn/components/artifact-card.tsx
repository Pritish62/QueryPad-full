"use client";

import { artifactTypeMeta, formatDate } from "../lib/artifact-meta";
import type { Artifact } from "../lib/types";
import { ArtifactStatusBadge } from "./artifact-status-badge";

export function ArtifactCard({
  artifact,
  onClick,
}: {
  artifact: Artifact;
  onClick: () => void;
}) {
  const meta = artifactTypeMeta[artifact.type];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-border/70 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
          <Icon className={`size-4 ${meta.color}`} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13px] font-medium transition-colors group-hover:text-primary">
            {artifact.title}
          </h3>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            {meta.label}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
        <span className="text-[11px] text-muted-foreground/70">
          {formatDate(artifact.createdAt)}
        </span>
        <ArtifactStatusBadge status={artifact.status} />
      </div>
    </button>
  );
}
