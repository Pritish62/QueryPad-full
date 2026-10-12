import { apiFetch } from "@/shared/lib/api";
import type {
  Conversation,
  CreateConversationInput,
  Message,
} from "./types";

const base = (workspaceId: string) =>
  `api/workspaces/${workspaceId}/conversations`;

export async function listConversations(
  workspaceId: string,
): Promise<Conversation[]> {
  return apiFetch<Conversation[]>(base(workspaceId));
}

export async function createConversation(
  workspaceId: string,
  input: CreateConversationInput = {},
): Promise<Conversation> {
  return apiFetch<Conversation>(base(workspaceId), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteConversation(
  workspaceId: string,
  conversationId: string,
): Promise<void> {
  return apiFetch<void>(`${base(workspaceId)}/${conversationId}`, {
    method: "DELETE",
  });
}

export async function listMessages(
  workspaceId: string,
  conversationId: string,
): Promise<Message[]> {
  return apiFetch<Message[]>(
    `${base(workspaceId)}/${conversationId}/messages`,
  );
}

/** Returns the URL for the streaming chat endpoint */
export function getChatStreamUrl(workspaceId: string): string {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";
  return `${apiBase.replace(/\/$/, "")}/api/workspaces/${workspaceId}/chat`;
}
