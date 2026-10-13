"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createArtifact,
  deleteArtifact,
  getArtifact,
  listArtifacts,
} from "../lib/api";
import type { CreateArtifactInput } from "../lib/types";

export const artifactKeys = {
  all: (workspaceId: string) => ["artifacts", workspaceId] as const,
  detail: (workspaceId: string, artifactId: string) =>
    ["artifacts", workspaceId, artifactId] as const,
};

export function useArtifacts(workspaceId: string) {
  return useQuery({
    queryKey: artifactKeys.all(workspaceId),
    queryFn: () => listArtifacts(workspaceId),
    enabled: Boolean(workspaceId),
    refetchInterval: (query) =>
      query.state.data?.some(
        (artifact) =>
          artifact.status === "PENDING" || artifact.status === "PROCESSING",
      )
        ? 3000
        : false,
  });
}

export function useArtifact(workspaceId: string, artifactId: string) {
  return useQuery({
    queryKey: artifactKeys.detail(workspaceId, artifactId),
    queryFn: () => getArtifact(workspaceId, artifactId),
    enabled: Boolean(workspaceId && artifactId),
    refetchInterval: (query) =>
      query.state.data &&
      (query.state.data.status === "PENDING" ||
        query.state.data.status === "PROCESSING")
        ? 3000
        : false,
  });
}

export function useCreateArtifact(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateArtifactInput) =>
      createArtifact(workspaceId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: artifactKeys.all(workspaceId),
      });
    },
  });
}

export function useDeleteArtifact(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (artifactId: string) => deleteArtifact(workspaceId, artifactId),
    onSuccess: (_, artifactId) => {
      queryClient.removeQueries({
        queryKey: artifactKeys.detail(workspaceId, artifactId),
      });
      void queryClient.invalidateQueries({
        queryKey: artifactKeys.all(workspaceId),
      });
    },
  });
}
