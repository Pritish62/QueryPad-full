"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createConversation,
  deleteConversation,
  listConversations,
  listMessages,
} from "../lib/api";
import { useChatStore } from "../store/chat-store";

export const conversationKeys = {
  all: (workspaceId: string) => ["conversations", workspaceId] as const,
  messages: (workspaceId: string, conversationId: string) =>
    ["conversations", workspaceId, conversationId, "messages"] as const,
};

/** Fetches conversations and syncs them into the Zustand store */
export function useConversations(workspaceId: string) {
  const setConversations = useChatStore((s) => s.setConversations);

  const query = useQuery({
    queryKey: conversationKeys.all(workspaceId),
    queryFn: () => listConversations(workspaceId),
    enabled: Boolean(workspaceId),
  });

  useEffect(() => {
    if (query.data) {
      setConversations(query.data);
    }
  }, [query.data, setConversations]);

  return query;
}

/** Fetches messages for a specific conversation */
export function useMessages(
  workspaceId: string,
  conversationId: string | null,
) {
  return useQuery({
    queryKey: conversationKeys.messages(workspaceId, conversationId ?? ""),
    queryFn: () => listMessages(workspaceId, conversationId!),
    enabled: Boolean(workspaceId && conversationId),
  });
}

/** Creates a new conversation */
export function useCreateConversation(workspaceId: string) {
  const queryClient = useQueryClient();
  const { addConversation, setActiveConversation } = useChatStore();

  return useMutation({
    mutationFn: (title?: string) =>
      createConversation(workspaceId, title ? { title } : {}),
    onSuccess: (conv) => {
      addConversation(conv);
      setActiveConversation(conv.id);
      void queryClient.invalidateQueries({
        queryKey: conversationKeys.all(workspaceId),
      });
    },
  });
}

/** Deletes a conversation */
export function useDeleteConversation(workspaceId: string) {
  const queryClient = useQueryClient();
  const removeConversation = useChatStore((s) => s.removeConversation);

  return useMutation({
    mutationFn: (conversationId: string) =>
      deleteConversation(workspaceId, conversationId),
    onSuccess: (_, conversationId) => {
      removeConversation(conversationId);
      void queryClient.invalidateQueries({
        queryKey: conversationKeys.all(workspaceId),
      });
    },
  });
}
