import { apiFetch } from "@/shared/lib/api";
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  Workspace,
} from "./types";

export function listWorkspaces() {
  return apiFetch<Workspace[]>("/api/workspaces");
}

export function getWorkspace(workspaceId: string) {
  return apiFetch<Workspace>(`/api/workspaces/${workspaceId}`);
}

export function createWorkspace(input: CreateWorkspaceInput) {
  return apiFetch<Workspace>("/api/workspaces", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateWorkspace(
  workspaceId: string,
  input: UpdateWorkspaceInput,
) {
  return apiFetch<Workspace>(`/api/workspaces/${workspaceId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteWorkspace(workspaceId: string) {
  return apiFetch<void>(`/api/workspaces/${workspaceId}`, {
    method: "DELETE",
  });
}
