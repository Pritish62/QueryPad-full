"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { useCreateSource, useSources } from "../hooks/use-sources";
import type { CreateSourceInput } from "../lib/types";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

function sourceTypeLabel(type: string) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export function SourceLibrary({ workspaceId }: { workspaceId: string }) {
  const { data: sources, error, isError, isLoading, refetch } =
    useSources(workspaceId);
  const createMutation = useCreateSource(workspaceId);
  const [type, setType] = useState<CreateSourceInput["type"]>("TEXT");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function handleCreateSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        type,
        title: trimmedTitle,
        content: trimmedContent,
      });
      setTitle("");
      setContent("");
    } catch {
      // The mutation error is rendered below the form.
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card>
        <CardHeader>
          <CardTitle>Sources</CardTitle>
          <CardDescription>
            Text and Markdown sources saved in this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load sources</AlertTitle>
              <AlertDescription className="flex flex-col gap-3">
                <span>
                  {getErrorMessage(
                    error,
                    "Unable to load sources. Please try again.",
                  )}
                </span>
                <Button
                  className="w-fit"
                  onClick={() => void refetch()}
                  variant="outline"
                >
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          ) : sources?.length ? (
            <div className="flex flex-col gap-3">
              {sources.map((source) => (
                <article
                  className="rounded-2xl border bg-background p-4"
                  key={source.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate font-medium">{source.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {sourceTypeLabel(source.type)} · {source.status}
                      </p>
                    </div>
                    <time
                      className="shrink-0 text-xs text-muted-foreground"
                      dateTime={source.createdAt}
                    >
                      {new Date(source.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  {source.content ? (
                    <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                      {source.content}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <h2 className="font-medium">No sources yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add text or Markdown content using the form.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add source</CardTitle>
          <CardDescription>
            Create a text or Markdown source for this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleCreateSource}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="source-type">Type</Label>
              <select
                className="h-8 rounded-2xl border border-transparent bg-input/50 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                id="source-type"
                onChange={(event) =>
                  setType(event.target.value as CreateSourceInput["type"])
                }
                value={type}
              >
                <option value="TEXT">Text</option>
                <option value="MARKDOWN">Markdown</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="source-title">Title</Label>
              <Input
                id="source-title"
                maxLength={200}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="A useful note"
                required
                value={title}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="source-content">Content</Label>
              <Textarea
                className="min-h-32"
                id="source-content"
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write or paste your source content..."
                required
                value={content}
              />
            </div>
            {createMutation.isError ? (
              <p className="text-sm text-destructive">
                {getErrorMessage(
                  createMutation.error,
                  "Unable to create source. Please try again.",
                )}
              </p>
            ) : null}
            <Button disabled={createMutation.isPending} type="submit">
              {createMutation.isPending ? "Adding..." : "Add source"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
