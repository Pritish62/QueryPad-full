import { create } from "zustand";
import type { Conversation } from "../lib/types";

type ChatModel = "gpt-4o-mini" | "gpt-4o";

type ChatStore = {
  /** Currently selected conversation id */
  activeConversationId: string | null;
  /** Optimistic conversation list (set by the hook) */
  conversations: Conversation[];
  /** Selected AI model */
  model: ChatModel;
  /** Web search toggle */
  webSearch: boolean;

  setActiveConversation: (id: string | null) => void;
  setConversations: (convs: Conversation[]) => void;
  addConversation: (conv: Conversation) => void;
  removeConversation: (id: string) => void;
  setModel: (model: ChatModel) => void;
  setWebSearch: (enabled: boolean) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  activeConversationId: null,
  conversations: [],
  model: "gpt-4o-mini",
  webSearch: false,

  setActiveConversation: (id) => set({ activeConversationId: id }),
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conv) =>
    set((s) => ({ conversations: [conv, ...s.conversations] })),
  removeConversation: (id) =>
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
      activeConversationId:
        s.activeConversationId === id ? null : s.activeConversationId,
    })),
  setModel: (model) => set({ model }),
  setWebSearch: (webSearch) => set({ webSearch }),
}));
