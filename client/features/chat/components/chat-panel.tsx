"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import {
  Bot,
  ChevronDown,
  Globe,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatStore } from "../store/chat-store";
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useMessages,
} from "../hooks/use-chat";
import { getChatStreamUrl } from "../lib/api";
import type { CitationSource } from "../lib/types";

type ChatPanelProps = {
  workspaceId: string;
};

const MODELS = [
  { value: "gpt-4o-mini" as const, label: "GPT-4o Mini", badge: "Fast" },
  { value: "gpt-4o" as const, label: "GPT-4o", badge: "Smart" },
];

export function ChatPanel({ workspaceId }: ChatPanelProps) {
  const {
    activeConversationId,
    conversations,
    model,
    webSearch,
    setActiveConversation,
    setModel,
    setWebSearch,
  } = useChatStore();

  const { isLoading: convsLoading } = useConversations(workspaceId);
  const { data: existingMessages, isLoading: msgsLoading } = useMessages(
    workspaceId,
    activeConversationId,
  );

  const createConvMutation = useCreateConversation(workspaceId);
  const deleteConvMutation = useDeleteConversation(workspaceId);

  const [showModelPicker, setShowModelPicker] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ai/react v7 useChat
  const { messages, sendMessage, setMessages, status, error } = useChat({
    api: getChatStreamUrl(workspaceId),
    credentials: "include",
    body: {
      conversationId: activeConversationId ?? undefined,
      model,
      webSearch,
    },
    onFinish: (message: UIMessage, { response }: { response: Response }) => {
      // Extract X-Conversation-Id from response headers to persist the conversation
      const convId = response.headers.get("X-Conversation-Id");
      if (convId && !activeConversationId) {
        setActiveConversation(convId);
      }
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  // Populate messages when switching conversations
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    if (existingMessages) {
      setMessages(
        existingMessages.map((m) => ({
          id: m.id,
          role: (m.role === "USER" ? "user" : "assistant") as "user" | "assistant",
          parts: [{ type: "text" as const, text: m.content }],
        })),
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, existingMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  function handleNewChat() {
    setActiveConversation(null);
    setMessages([]);
    setInputValue("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleSend() {
    const text = inputValue.trim();
    if (!text || isStreaming) return;
    setInputValue("");
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    void sendMessage({ role: "user", parts: [{ type: "text", text }] });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Conversation Sidebar ─────────────────── */}
      <aside className="hidden w-52 shrink-0 flex-col border-r border-border/60 bg-card/30 lg:flex">
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Chats
          </span>
          <button
            type="button"
            onClick={handleNewChat}
            title="New chat"
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2">
          {convsLoading ? (
            <>
              <Skeleton className="h-8 rounded-lg" />
              <Skeleton className="h-8 rounded-lg" />
              <Skeleton className="h-8 rounded-lg" />
            </>
          ) : conversations.length === 0 ? (
            <p className="px-2 pt-2 text-[11px] text-muted-foreground/50">
              No conversations yet.
            </p>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setActiveConversation(conv.id)}
                  >
                    <span className="block truncate text-[12px] font-medium">
                      {conv.title ?? "New conversation"}
                    </span>
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    onClick={() => deleteConvMutation.mutate(conv.id)}
                    className="hidden size-5 shrink-0 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:text-destructive group-hover:flex"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-border/60 p-2">
          <button
            type="button"
            onClick={handleNewChat}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="size-3.5" />
            New chat
          </button>
        </div>
      </aside>

      {/* ── Main Chat Area ───────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border/60 px-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-muted-foreground" />
            <span className="text-[13px] font-medium">
              {activeConversation?.title ?? "New conversation"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Web search toggle */}
            <button
              type="button"
              onClick={() => setWebSearch(!webSearch)}
              title="Toggle web search"
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                webSearch
                  ? "border-sky-400/60 bg-sky-400/10 text-sky-400"
                  : "border-border/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Globe className="size-3.5" />
              Web
            </button>

            {/* Model picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelPicker((p) => !p)}
                className="flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                <Zap className="size-3.5" />
                {MODELS.find((m) => m.value === model)?.label ?? model}
                <ChevronDown className="size-3" />
              </button>
              {showModelPicker && (
                <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-border/70 bg-card shadow-lg">
                  {MODELS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setModel(m.value);
                        setShowModelPicker(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-[12px] transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-muted ${
                        model === m.value ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <span>{m.label}</span>
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                        {m.badge}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 md:px-8">
          {msgsLoading && activeConversationId ? (
            <div className="space-y-4">
              <Skeleton className="ml-auto h-10 w-48 rounded-2xl" />
              <Skeleton className="h-20 w-3/4 rounded-2xl" />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState onSuggestion={(s) => { setInputValue(s); inputRef.current?.focus(); }} />
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                const text = getMessageText(msg);
                const citations = extractCitations(msg);
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    {!isUser && (
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Bot className="size-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] space-y-2 flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/60 text-foreground"
                        }`}
                      >
                        {text}
                      </div>
                      {citations.length > 0 && (
                        <CitationRow citations={citations} />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Streaming indicator */}
              {isStreaming && (
                <div className="flex gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="size-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl bg-muted/60 px-4 py-3">
                    <span className="size-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:0ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:150ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-center text-[12px] text-destructive">
                  {error.message ?? "Something went wrong. Try again."}
                </p>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t border-border/60 px-4 py-4 md:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative flex items-end gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm transition-colors focus-within:border-primary/40 focus-within:shadow-md">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your sources…"
                rows={1}
                disabled={isStreaming}
                className="min-h-[1.5rem] max-h-36 flex-1 resize-none bg-transparent text-[13.5px] leading-relaxed outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputValue.trim() || isStreaming}
                className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40"
              >
                <Send className="size-3.5" />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground/40">
              Answers are grounded in your workspace sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────── */

function getMessageText(msg: UIMessage): string {
  if (typeof (msg as { content?: string }).content === "string") {
    return (msg as { content: string }).content;
  }
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p: { type: string }) => p.type === "text")
      .map((p: { text?: string }) => p.text ?? "")
      .join("");
  }
  return "";
}

function extractCitations(msg: UIMessage): CitationSource[] {
  const annotations = (msg as { annotations?: unknown }).annotations;
  if (!Array.isArray(annotations)) return [];
  for (const ann of annotations as unknown[]) {
    if (
      ann &&
      typeof ann === "object" &&
      "citations" in ann &&
      Array.isArray((ann as { citations: unknown }).citations)
    ) {
      return (ann as { citations: CitationSource[] }).citations;
    }
  }
  return [];
}

function CitationRow({ citations }: { citations: CitationSource[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? citations : citations.slice(0, 3);
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((c, i) => (
        <span
          key={i}
          title={c.excerpt}
          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-0.5 text-[10px] text-muted-foreground"
        >
          <Sparkles className="size-2.5 text-primary/60" />
          {c.sourceTitle}
          {c.page != null && ` · p.${c.page}`}
        </span>
      ))}
      {citations.length > 3 && (
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="text-[10px] text-primary/70 underline-offset-2 hover:underline"
        >
          {expanded ? "Show less" : `+${citations.length - 3} more`}
        </button>
      )}
    </div>
  );
}

const SUGGESTIONS = [
  "Summarize the key points from my sources",
  "What are the main themes across documents?",
  "Explain the most important concepts",
  "Create a timeline of events from my sources",
];

function EmptyState({ onSuggestion }: { onSuggestion: (s: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Bot className="size-6" />
      </div>
      <div className="text-center">
        <h2 className="text-[15px] font-semibold">Chat with your sources</h2>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Ask anything — answers are grounded in what you&apos;ve added.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestion(s)}
            className="rounded-xl border border-border/60 bg-card px-4 py-2.5 text-left text-[12px] text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
