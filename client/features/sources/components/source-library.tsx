"use client";

import { useRef, useState } from "react";
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
import {
  useCreateSource,
  useImportWebsite,
  useImportYoutube,
  useSources,
  useUploadPdf,
} from "../hooks/use-sources";
import type { CreateSourceInput } from "../lib/types";

type SourceMode = CreateSourceInput["type"] | "WEBSITE" | "YOUTUBE" | "PDF";

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
  const websiteMutation = useImportWebsite(workspaceId);
  const youtubeMutation = useImportYoutube(workspaceId);
  const pdfMutation = useUploadPdf(workspaceId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<SourceMode>("TEXT");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const isPending =
    createMutation.isPending ||
    websiteMutation.isPending ||
    youtubeMutation.isPending ||
    pdfMutation.isPending;

  function resetForm() {
    setTitle("");
    setContent("");
    setUrl("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleCreateSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedUrl = url.trim();

    try {
      if (mode === "PDF") {
        if (!file || file.type !== "application/pdf") {
          return;
        }
        await pdfMutation.mutateAsync(file);
      } else if (mode === "WEBSITE") {
        if (!trimmedUrl) {
          return;
        }
        await websiteMutation.mutateAsync({
          url: trimmedUrl,
          title: trimmedTitle || undefined,
        });
      } else if (mode === "YOUTUBE") {
        if (!trimmedUrl) {
          return;
        }
        await youtubeMutation.mutateAsync({
          url: trimmedUrl,
          title: trimmedTitle || undefined,
        });
      } else {
        if (!trimmedTitle || !trimmedContent) {
          return;
        }
        await createMutation.mutateAsync({
          type: mode,
          title: trimmedTitle,
          content: trimmedContent,
        });
      }

      resetForm();
    } catch {
      // The mutation error is rendered below the form.
    }
  }

  const mutationError =
    createMutation.error ||
    websiteMutation.error ||
    youtubeMutation.error ||
    pdfMutation.error;

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card>
        <CardHeader>
          <CardTitle>Sources</CardTitle>
          <CardDescription>
            Text, links, YouTube videos, and PDF files in this workspace.
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
                  {getErrorMessage(error, "Unable to load sources.")}
                </span>
                <Button className="w-fit" onClick={() => void refetch()} variant="outline">
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          ) : sources?.length ? (
            <div className="flex flex-col gap-3">
              {sources.map((source) => (
                <article className="rounded-2xl border bg-background p-4" key={source.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate font-medium">{source.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {sourceTypeLabel(source.type)} · {source.status}
                      </p>
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground" dateTime={source.createdAt}>
                      {new Date(source.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  {source.url ? (
                    <p className="mt-3 truncate text-sm text-muted-foreground">
                      {source.url}
                    </p>
                  ) : source.content ? (
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
                Add a source using the form.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add source</CardTitle>
          <CardDescription>
            Import content from text, a website, YouTube, or a PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={(event) => void handleCreateSource(event)}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="source-type">Type</Label>
              <select
                className="h-9 rounded-2xl border border-transparent bg-input/50 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                id="source-type"
                onChange={(event) => {
                  setMode(event.target.value as SourceMode);
                  setFile(null);
                }}
                value={mode}
              >
                <option value="TEXT">Text</option>
                <option value="MARKDOWN">Markdown</option>
                <option value="WEBSITE">Website link</option>
                <option value="YOUTUBE">YouTube link</option>
                <option value="PDF">PDF file</option>
              </select>
            </div>

            {mode === "PDF" ? (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="source-file">PDF file</Label>
                  <Input
                    accept="application/pdf,.pdf"
                    id="source-file"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    ref={fileInputRef}
                    required
                    type="file"
                  />
                  <p className="text-xs text-muted-foreground">PDF files up to 25 MB.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="source-title">Title (optional)</Label>
                  <Input
                    id="source-title"
                    maxLength={200}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Use the file name if empty"
                    value={title}
                  />
                </div>
              </>
            ) : mode === "WEBSITE" || mode === "YOUTUBE" ? (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="source-url">
                    {mode === "WEBSITE" ? "Website URL" : "YouTube URL"}
                  </Label>
                  <Input
                    id="source-url"
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder={
                      mode === "WEBSITE"
                        ? "https://example.com/article"
                        : "https://youtube.com/watch?v=..."
                    }
                    required
                    type="url"
                    value={url}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="source-title">Title (optional)</Label>
                  <Input
                    id="source-title"
                    maxLength={200}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Use an imported title if empty"
                    value={title}
                  />
                </div>
              </>
            ) : (
              <>
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
              </>
            )}

            {mutationError ? (
              <p className="text-sm text-destructive">
                {getErrorMessage(mutationError, "Unable to create source.")}
              </p>
            ) : null}
            <Button disabled={isPending} type="submit">
              {isPending ? "Importing..." : "Add source"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
