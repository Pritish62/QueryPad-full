"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSource,
  deleteSource,
  getSource,
  listSources,
} from "../lib/api";
import type { CreateSourceInput, SourceFilters } from "../lib/types";

export const sourceKeys = {
  all: (workspaceId: string) => ["sources", workspaceId] as const,
  list: (workspaceId: string, filters: SourceFilters = {}) =>
    ["sources", workspaceId, "list", filters] as const,
  detail: (workspaceId: string, sourceId: string) =>
    ["sources", workspaceId, sourceId] as const,
};

export function useSources(
  workspaceId: string,
  filters: SourceFilters = {},
) {
  return useQuery({
    queryKey: sourceKeys.list(workspaceId, filters),
    queryFn: () => listSources(workspaceId, filters),
    enabled: Boolean(workspaceId),
  });
}

export function useSource(workspaceId: string, sourceId: string) {
  return useQuery({
    queryKey: sourceKeys.detail(workspaceId, sourceId),
    queryFn: () => getSource(workspaceId, sourceId),
    enabled: Boolean(workspaceId && sourceId),
  });
}

export function useCreateSource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSourceInput) =>
      createSource(workspaceId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: sourceKeys.all(workspaceId),
      });
    },
  });
}

export function useDeleteSource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) => deleteSource(workspaceId, sourceId),
    onSuccess: (_, sourceId) => {
      queryClient.removeQueries({
        queryKey: sourceKeys.detail(workspaceId, sourceId),
      });
      void queryClient.invalidateQueries({
        queryKey: sourceKeys.all(workspaceId),
      });
    },
  });
}
