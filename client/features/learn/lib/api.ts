import { apiFetch } from "@/shared/lib/api";
import type { Artifact, CreateArtifactInput } from "./types";

function artifactsPath(workspaceId: string) {
  return `/api/workspaces/${workspaceId}/artifacts`;
}

export function listArtifacts(workspaceId: string) {
  return apiFetch<Artifact[]>(artifactsPath(workspaceId));
}

export function getArtifact(workspaceId: string, artifactId: string) {
  return apiFetch<Artifact>(`${artifactsPath(workspaceId)}/${artifactId}`);
}

export function createArtifact(
  workspaceId: string,
  input: CreateArtifactInput,
) {
  return apiFetch<Artifact>(artifactsPath(workspaceId), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteArtifact(workspaceId: string, artifactId: string) {
  return apiFetch<void>(`${artifactsPath(workspaceId)}/${artifactId}`, {
    method: "DELETE",
  });
}
