"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Bot,
  FileText,
  Globe,
  GraduationCap,
  Library,
  MessageSquare,
  Play,
  Plus,
  Settings,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatPanel } from "@/features/chat/components/chat-panel";
import { useSources } from "@/features/sources/hooks/use-sources";
import type { Source } from "@/features/sources/lib/types";
import { SourceLibrary } from "@/features/sources/components/source-library";
import type { Workspace } from "../lib/types";

type WorkspaceShellProps = {
  workspace: Workspace;
};

type ActiveTab = "chat" | "learn" | "sources" | "settings";

function getSourceMeta(source: Source) {
  if (source.type === "PDF") return { icon: FileText, color: "text-red-400", bg: "bg-red-400/10" };
  if (source.type === "YOUTUBE") return { icon: Play, color: "text-red-500", bg: "bg-red-500/10" };
  if (source.type === "WEBSITE") return { icon: Globe, color: "text-sky-400", bg: "bg-sky-400/10" };
  if (source.type === "MARKDOWN") return { icon: FileText, color: "text-violet-400", bg: "bg-violet-400/10" };
  return { icon: StickyNote, color: "text-amber-400", bg: "bg-amber-400/10" };
}

export function WorkspaceShell({ workspace }: WorkspaceShellProps) {
  const router = useRouter();
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("sources");
  const { data: sources, isLoading: sourcesLoading } = useSources(workspace.id);

  const navItems: {
    id: ActiveTab;
    icon: React.ElementType;
    label: string;
    implemented: boolean;
  }[] = [
    { id: "chat", icon: MessageSquare, label: "Chat", implemented: true },
    { id: "learn", icon: GraduationCap, label: "Learn", implemented: false },
    { id: "sources", icon: Library, label: "Sources", implemented: true },
    { id: "settings", icon: Settings, label: "Settings", implemented: false },
  ];

  return (
    <div className="flex min-h-svh bg-background">

      {/* ── LEFT SIDEBAR ─────────────────────────── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/70 bg-card lg:flex">

        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border/70 px-4">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <BookOpen className="size-3.5" />
          </div>
          <span className="text-sm font-semibold tracking-tight">QueryPad</span>
        </div>

        {/* Workspace badge */}
        <div className="border-b border-border/70 px-3 py-2.5">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm">
              {workspace.icon || "📚"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium leading-tight">{workspace.title}</p>
              <p className="text-[10px] text-muted-foreground">Workspace</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5 px-2 pt-3 pb-1" aria-label="Workspace navigation">
          {navItems.map(({ id, icon: Icon, label, implemented }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => implemented && setActiveTab(id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : implemented
                    ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                    : "cursor-default text-muted-foreground/40"
                }`}
              >
                <Icon className="size-[15px] shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {!implemented && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/50">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sources list */}
        <div className="flex min-h-0 flex-1 flex-col border-t border-border/70 px-2 py-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Sources
            </span>
            <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
              {sources?.length ?? 0}
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
            {sourcesLoading ? (
              <>
                <Skeleton className="h-7 rounded-lg" />
                <Skeleton className="h-7 rounded-lg" />
                <Skeleton className="h-7 rounded-lg" />
              </>
            ) : sources?.length ? (
              sources.map((source) => {
                const meta = getSourceMeta(source);
                const Icon = meta.icon;
                return (
                  <div
                    key={source.id}
                    title={source.title}
                    className="group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60"
                  >
                    <span className={`flex size-5 shrink-0 items-center justify-center rounded-md ${meta.bg}`}>
                      <Icon className={`size-2.5 ${meta.color}`} />
                    </span>
                    <span className="truncate text-[11.5px] text-muted-foreground group-hover:text-foreground">
                      {source.title}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="px-2 text-[11px] text-muted-foreground/50">No sources yet.</p>
            )}
          </div>

          {/* Inline add source */}
          <button
            type="button"
            onClick={() => setSourceDialogOpen(true)}
            className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-2.5 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="size-3.5" />
            Add source
          </button>
        </div>

        {/* Back */}
        <div className="border-t border-border/70 p-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            All workspaces
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 px-5 md:px-7">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="hidden text-base lg:block">{workspace.icon || "📚"}</span>
            <div className="min-w-0">
              <h1 className="truncate text-[13.5px] font-semibold">{workspace.title}</h1>
              {workspace.description && (
                <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
                  {workspace.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="hidden h-8 gap-1.5 text-xs sm:inline-flex"
              onClick={() => setSourceDialogOpen(true)}
            >
              <Sparkles className="size-3.5" />
              Add source
            </Button>
            <ModeToggle />
          </div>
        </header>

        <div className={`flex-1 overflow-hidden ${activeTab === "chat" ? "" : "overflow-auto p-5 md:p-7"}`}>
          {activeTab === "sources" && (
            <SourceLibrary
              onOpenChange={setSourceDialogOpen}
              open={sourceDialogOpen}
              workspaceId={workspace.id}
            />
          )}
          {activeTab === "chat" && (
            <ChatPanel workspaceId={workspace.id} />
          )}
          {activeTab === "learn" && (
            <ComingSoonPanel
              icon={<GraduationCap className="size-6" />}
              title="Learn"
              description="Artifacts and quizzes generated from your sources are coming soon."
            />
          )}
          {activeTab === "settings" && (
            <ComingSoonPanel
              icon={<Settings className="size-6" />}
              title="Settings"
              description="Workspace settings are coming soon."
            />
          )}
        </div>
      </main>

      {/* Dialog when triggered from non-sources tab or mobile */}
      {activeTab !== "sources" && (
        <SourceLibrary
          onOpenChange={setSourceDialogOpen}
          open={sourceDialogOpen}
          workspaceId={workspace.id}
          dialogOnly
        />
      )}
    </div>
  );
}

function ComingSoonPanel({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <span className="mt-4 inline-block rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
          Coming soon
        </span>
      </div>
    </div>
  );
}
