"use client";

import { BookOpen, Sparkles } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { WorkspaceList } from "./workspace-list";

export function DashboardHome() {
  return (
    <main className="min-h-svh bg-muted/30">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </span>
            <span className="font-heading text-lg font-semibold">QueryPad</span>
          </div>
          <ModeToggle />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10 md:px-8 md:py-14">
        <section className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Your personal research space
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Organize your knowledge.
          </h1>
          <p className="text-muted-foreground">
            Create a workspace, add sources, and build a focused place to
            explore your ideas.
          </p>
        </section>
        <WorkspaceList />
      </div>
    </main>
  );
}
