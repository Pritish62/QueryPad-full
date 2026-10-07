"use client";

import { useParams, useRouter } from "next/navigation";
import { ApiError } from "@/shared/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceLibrary } from "@/features/sources/components/source-library";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspaces";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 404) {
    return "This workspace could not be found.";
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  return "Unable to load this workspace. Please try again.";
}

export default function WorkspacePage() {
  const params = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const workspaceId = params.workspaceId;
  const { data: workspace, error, isError, isLoading, refetch } =
    useWorkspace(workspaceId);

  if (isLoading) {
    return (
      <main className="min-h-svh bg-muted/30 px-6 py-10 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96 max-w-full" />
          <Skeleton className="h-80" />
        </div>
      </main>
    );
  }

  if (isError || !workspace) {
    return (
      <main className="min-h-svh bg-muted/30 px-6 py-10 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <Alert variant="destructive">
            <AlertTitle>Could not load workspace</AlertTitle>
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
          <div>
            <Button onClick={() => void refetch()} variant="outline">
              Try again
            </Button>
            <Button className="ml-2" onClick={() => router.push("/dashboard")}>
              Back to dashboard
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-muted/30 px-6 py-10 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Button
            className="w-fit"
            onClick={() => router.push("/dashboard")}
            variant="ghost"
          >
            ← All workspaces
          </Button>
          <div>
            <p className="text-sm font-medium text-primary">Workspace</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {workspace.icon ? `${workspace.icon} ` : ""}
              {workspace.title}
            </h1>
            {workspace.description ? (
              <p className="mt-2 text-muted-foreground">
                {workspace.description}
              </p>
            ) : null}
          </div>
        </header>
        <SourceLibrary workspaceId={workspace.id} />
      </div>
    </main>
  );
}
