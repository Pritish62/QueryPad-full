export type Conversation = {
  id: string;
  workspaceId: string;
  title: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CitationSource = {
  sourceId?: string;
  sourceTitle: string;
  sourceType: string;
  chunkId?: string;
  chunkIndex?: number;
  page?: number | null;
  excerpt: string;
  score?: number;
  url?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  citations: CitationSource[] | null;
  createdAt: string;
};

export type CreateConversationInput = {
  title?: string;
};

export type ChatModel = "gpt-4o-mini" | "gpt-4o";
