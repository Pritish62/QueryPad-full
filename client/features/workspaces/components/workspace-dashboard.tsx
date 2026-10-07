"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/shared/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateWorkspace, useWorkspaces } from "../hooks/use-workspaces";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Your session has expired. Please sign in again.";
    }
    return error.message;
  }

  return "Unable to load workspaces. Please try again.";
}

export function WorkspaceDashboard() {
  const router = useRouter();
  const { data: workspaces, error, isLoading, isError, refetch } = useWorkspaces();
  const createMutation = useCreateWorkspace();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleCreateWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: trimmedTitle,
        description: description.trim() || undefined,
      });
      setTitle("");
      setDescription("");
    } catch {
      // The mutation error is rendered below the form.
    }
  }

  return (
    <main className="min-h-svh bg-muted/30 px-6 py-10 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-primary">QueryPad</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Your workspaces
          </h1>
          <p className="text-muted-foreground">
            Create a workspace to organize the sources you want to explore.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card>
            <CardHeader>
              <CardTitle>Workspaces</CardTitle>
              <CardDescription>
                Select a workspace to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                </div>
              ) : isError ? (
                <Alert variant="destructive">
                  <AlertTitle>Could not load workspaces</AlertTitle>
                  <AlertDescription className="flex flex-col gap-3">
                    <span>{getErrorMessage(error)}</span>
                    <Button
                      className="w-fit"
                      onClick={() => void refetch()}
                      variant="outline"
                    >
                      Try again
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : workspaces?.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {workspaces.map((workspace) => (
                    <button
                      className="rounded-2xl border bg-background p-4 text-left transition-colors hover:bg-muted"
                      key={workspace.id}
                      onClick={() => router.push(`/workspace/${workspace.id}`)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="truncate font-medium">
                            {workspace.icon ? `${workspace.icon} ` : ""}
                            {workspace.title}
                          </h2>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {workspace.description || "No description yet."}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Open
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed p-8 text-center">
                  <h2 className="font-medium">No workspaces yet</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first workspace using the form.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create workspace</CardTitle>
              <CardDescription>
                Give your workspace a name and optional description.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" onSubmit={handleCreateWorkspace}>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="workspace-title">Title</Label>
                  <Input
                    id="workspace-title"
                    maxLength={120}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="My research"
                    required
                    value={title}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="workspace-description">Description</Label>
                  <Input
                    id="workspace-description"
                    maxLength={500}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What is this workspace about?"
                    value={description}
                  />
                </div>
                {createMutation.isError ? (
                  <p className="text-sm text-destructive">
                    {getErrorMessage(createMutation.error)}
                  </p>
                ) : null}
                <Button disabled={createMutation.isPending} type="submit">
                  {createMutation.isPending ? "Creating..." : "Create workspace"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
