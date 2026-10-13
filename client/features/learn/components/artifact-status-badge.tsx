"use client";

import { artifactStatusMeta } from "../lib/artifact-meta";
import type { ArtifactStatus } from "../lib/types";

export function ArtifactStatusBadge({ status }: { status: ArtifactStatus }) {
  const meta = artifactStatusMeta[status] ?? artifactStatusMeta.PENDING;
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.cls}`}
    >
      <Icon className={`size-3 ${status === "PROCESSING" ? "animate-spin" : ""}`} />
      {meta.label}
    </span>
  );
}
