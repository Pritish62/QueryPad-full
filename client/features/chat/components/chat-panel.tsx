"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import {
  Bot,
  Check,
  ChevronDown,
  Globe,
  MessageSquare,
  PanelLeft,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatStore } from "../store/chat-store";
import {
  useConversations,
  useDeleteConversation,
  useMessages,
} from "../hooks/use-chat";
import { getChatStreamUrl } from "../lib/api";
import type { CitationSource } from "../lib/types";

type ChatPanelProps = {
  workspaceId: string;
};

const MODELS = [
  { value: "gpt-4o-mini" as const, label: "GPT-4o Mini", badge: "Fast", desc: "Faster, efficient" },
  { value: "gpt-4o" as const, label: "GPT-4o", badge: "Smart", desc: "More capable" },
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

  const deleteConvMutation = useDeleteConversation(workspaceId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showConvDropdown, setShowConvDropdown] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);
  const convDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setShowModelPicker(false);
      }
      if (convDropdownRef.current && !convDropdownRef.current.contains(e.target as Node)) {
        setShowConvDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const chatTransport = useMemo(
    () =>
      new DefaultChatTransport({
        api: getChatStreamUrl(workspaceId),
        credentials: "include",
        body: {
          conversationId: activeConversationId ?? undefined,
          model,
          webSearch,
        },
        fetch: async (input, init) => {
          const response = await fetch(input, init);
          const convId = response.headers.get("X-Conversation-Id");
          if (convId && !activeConversationId) {
            setActiveConversation(convId);
          }
          return response;
        },
      }),
    [activeConversationId, model, setActiveConversation, webSearch, workspaceId],
  );

  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: chatTransport,
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
    setSidebarOpen(false);
    setShowConvDropdown(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleSend() {
    const text = inputValue.trim();
    if (!text || isStreaming) return;
    setInputValue("");
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

  function handleDeleteCurrentConversation() {
    if (!activeConversationId) return;
    deleteConvMutation.mutate(activeConversationId);
  }

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  const activeLabel = activeConversation?.title ?? "New conversation";
  const currentModel = MODELS.find((m) => m.value === model) ?? MODELS[0];

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] overflow-hidden">

      {/* ── Collapsible Left Sidebar ───────────────────────────── */}
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`absolute z-30 flex h-full flex-col border-r border-border/60 bg-card/95 backdrop-blur-sm transition-all duration-300 ease-in-out lg:relative lg:z-auto ${
          sidebarOpen ? "w-64 translate-x-0 shadow-2xl" : "w-0 -translate-x-full lg:hidden"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/60 px-3">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Conversations
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* New chat button in sidebar */}
        <div className="border-b border-border/60 p-2.5">
          <button
            type="button"
            onClick={handleNewChat}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="size-3.5" />
            New conversation
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2">
          {convsLoading ? (
            <>
              <Skeleton className="h-9 rounded-xl" />
              <Skeleton className="h-9 rounded-xl" />
              <Skeleton className="h-9 rounded-xl" />
            </>
          ) : conversations.length === 0 ? (
            <p className="px-3 pt-3 text-[11px] text-muted-foreground/50">
              No conversations yet.
            </p>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-1 rounded-xl px-2 py-1.5 transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => {
                      setActiveConversation(conv.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="block truncate text-[12px] font-medium">
                      {conv.title ?? "New conversation"}
                    </span>
                    <span className="block truncate text-[10px] text-muted-foreground/50">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                  <button
                    type="button"
                    title="Delete conversation"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConvMutation.mutate(conv.id);
                    }}
                    className="hidden size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:flex"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Main Chat Area ───────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ── Top toolbar ──────────────────────────────── */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/60 px-3 gap-2">

          {/* LEFT: Sidebar toggle + Conversation selector + New + Delete */}
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Sidebar toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen((p) => !p)}
              title="Toggle conversation list"
              className={`flex size-8 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                sidebarOpen
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              <PanelLeft className="size-4" />
            </button>

            {/* Conversation dropdown — hidden when sidebar is open */}
            {!sidebarOpen && (
              <div className="relative min-w-0" ref={convDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowConvDropdown((p) => !p)}
                  className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-2.5 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted max-w-[160px] sm:max-w-[240px]"
                >
                  <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{activeLabel}</span>
                  <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
                </button>

                {showConvDropdown && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-2xl border border-border/70 bg-card shadow-xl overflow-hidden">
                    <div className="border-b border-border/60 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        Past conversations
                      </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                      {convsLoading ? (
                        <div className="space-y-1 p-2">
                          <Skeleton className="h-8 rounded-xl" />
                          <Skeleton className="h-8 rounded-xl" />
                        </div>
                      ) : conversations.length === 0 ? (
                        <p className="px-3 py-3 text-[11px] text-muted-foreground/60">
                          No past conversations.
                        </p>
                      ) : (
                        conversations.map((conv) => {
                          const isActive = conv.id === activeConversationId;
                          return (
                            <div
                              key={conv.id}
                              className={`group flex items-center gap-2 mx-1 rounded-xl px-2.5 py-2 transition-colors cursor-pointer ${
                                isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/60"
                              }`}
                            >
                              <button
                                type="button"
                                className="min-w-0 flex-1 text-left"
                                onClick={() => {
                                  setActiveConversation(conv.id);
                                  setShowConvDropdown(false);
                                }}
                              >
                                <span className="block truncate text-[12.5px] font-medium">
                                  {conv.title ?? "New conversation"}
                                </span>
                                <span className="block text-[10px] text-muted-foreground/60">
                                  {new Date(conv.updatedAt).toLocaleDateString()}
                                </span>
                              </button>
                              {isActive && (
                                <Check className="size-3.5 shrink-0 text-primary" />
                              )}
                              <button
                                type="button"
                                title="Delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConvMutation.mutate(conv.id);
                                }}
                                className="hidden size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive group-hover:flex"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* New chat button — hidden when sidebar open */}
            {!sidebarOpen && (
              <button
                type="button"
                onClick={handleNewChat}
                title="New conversation"
                className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Plus className="size-4" />
              </button>
            )}

            {/* Delete current conversation — hidden when sidebar open */}
            {!sidebarOpen && activeConversationId && (
              <button
                type="button"
                onClick={handleDeleteCurrentConversation}
                title="Delete current conversation"
                className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border/60 text-muted-foreground/60 transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>

          {/* RIGHT: Web search + Model picker */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Web search toggle */}
            <button
              type="button"
              onClick={() => setWebSearch(!webSearch)}
              title="Toggle web search"
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors ${
                webSearch
                  ? "border-sky-400/60 bg-sky-400/10 text-sky-400"
                  : "border-border/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Globe className="size-3.5" />
              <span className="hidden sm:inline">Web</span>
            </button>

            {/* Model picker */}
            <div className="relative" ref={modelPickerRef}>
              <button
                type="button"
                onClick={() => setShowModelPicker((p) => !p)}
                className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-2.5 py-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                <Zap className="size-3.5" />
                <span className="hidden sm:inline">{currentModel.label}</span>
                <span className="inline sm:hidden">{currentModel.badge}</span>
                <ChevronDown className="size-3" />
              </button>
              {showModelPicker && (
                <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-2xl border border-border/70 bg-card shadow-xl overflow-hidden">
                  <div className="border-b border-border/60 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                      AI Model
                    </p>
                  </div>
                  {MODELS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setModel(m.value);
                        setShowModelPicker(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2.5 text-[12.5px] transition-colors hover:bg-muted ${
                        model === m.value ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <div className="text-left">
                        <span className="block font-medium">{m.label}</span>
                        <span className="text-[10.5px] text-muted-foreground">{m.desc}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                          {m.badge}
                        </span>
                        {model === m.value && (
                          <Check className="size-3.5 text-primary" />
                        )}
                      </div>
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
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
                        <Bot className="size-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] space-y-2 flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border/60 text-foreground"
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
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
                    <Bot className="size-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
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
        <div className="border-t border-border/60 bg-background/80 px-4 py-3 backdrop-blur-sm md:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative flex items-end gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-md focus-within:shadow-primary/5">
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
              Answers grounded in your workspace sources · Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────── */

function getMessageText(msg: UIMessage): string {
  const content = (msg as { content?: unknown }).content;
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(msg.parts)) {
    const parts = msg.parts as Array<{ type?: string; text?: string }>;
    return parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
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
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] text-muted-foreground/50 mr-0.5">Sources used:</span>
      {visible.map((c, i) => (
        <CitationChip key={i} citation={c} />
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

function CitationChip({ citation: c }: { citation: CitationSource }) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="relative">
      <span
        onMouseEnter={() => setShowPopup(true)}
        onMouseLeave={() => setShowPopup(false)}
        className="inline-flex cursor-default items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        <Sparkles className="size-2.5 text-primary/60" />
        {c.sourceTitle}
        {c.page != null && ` · p.${c.page}`}
      </span>

      {showPopup && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-2xl border border-border/70 bg-card p-3 shadow-xl">
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-border/70 bg-card" />
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary/60" />
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-semibold text-foreground">{c.sourceTitle}</p>
              {c.sourceType && (
                <p className="mt-0.5 text-[10px] text-muted-foreground/60 uppercase tracking-wide">
                  {c.sourceType}
                </p>
              )}
              {c.page != null && (
                <p className="mt-0.5 text-[10px] text-muted-foreground">Page {c.page}</p>
              )}
              {c.excerpt && (
                <p className="mt-2 line-clamp-4 text-[11px] leading-relaxed text-muted-foreground/80 border-t border-border/60 pt-2">
                  {c.excerpt}
                </p>
              )}
              {c.url && (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 block truncate text-[10px] text-primary hover:underline"
                >
                  {c.url}
                </a>
              )}
              {c.score != null && (
                <p className="mt-1 text-[10px] text-muted-foreground/50">
                  Relevance: {(c.score * 100).toFixed(0)}%
                </p>
              )}
            </div>
          </div>
        </div>
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
      <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
        <Bot className="size-6" />
      </div>
      <div className="text-center">
        <h2 className="text-[16px] font-semibold tracking-tight">Chat with your sources</h2>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Ask anything — answers are grounded in what you&apos;ve added.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 w-full max-w-lg">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestion(s)}
            className="rounded-2xl border border-border/60 bg-card px-4 py-3 text-left text-[12px] text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground hover:-translate-y-0.5 hover:shadow-sm"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
