import { apiFetch } from "@/shared/lib/api";
import type { CreateSourceInput, Source, SourceFilters } from "./types";

function buildSourcesPath(workspaceId: string, filters?: SourceFilters) {
  const params = new URLSearchParams();

  if (filters?.q) {
    params.set("q", filters.q);
  }
  if (filters?.type) {
    params.set("type", filters.type);
  }
  if (filters?.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();
  return `/api/workspaces/${workspaceId}/sources${query ? `?${query}` : ""}`;
}

export function listSources(workspaceId: string, filters?: SourceFilters) {
  return apiFetch<Source[]>(buildSourcesPath(workspaceId, filters));
}

export function getSource(workspaceId: string, sourceId: string) {
  return apiFetch<Source>(
    `/api/workspaces/${workspaceId}/sources/${sourceId}`,
  );
}

export function createSource(workspaceId: string, input: CreateSourceInput) {
  return apiFetch<Source>(`/api/workspaces/${workspaceId}/sources`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteSource(workspaceId: string, sourceId: string) {
  return apiFetch<void>(
    `/api/workspaces/${workspaceId}/sources/${sourceId}`,
    { method: "DELETE" },
  );
}

export function bulkDeleteSources(
  workspaceId: string,
  sourceIds: string[],
) {
  return apiFetch<void>(
    `/api/workspaces/${workspaceId}/sources/bulk-delete`,
    {
      method: "POST",
      body: JSON.stringify({ sourceIds }),
    },
  );
}
