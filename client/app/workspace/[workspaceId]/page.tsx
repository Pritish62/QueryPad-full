"use client";

import { useParams, useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceShell } from "@/features/workspaces/components/workspace-shell";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspaces";
import { ApiError } from "@/shared/lib/api";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 404) {
    return "This workspace could not be found.";
  }
  return error instanceof ApiError
    ? error.message
    : "Unable to load this workspace. Please try again.";
}

export default function WorkspacePage() {
  const params = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const { data: workspace, error, isError, isLoading, refetch } =
    useWorkspace(params.workspaceId);

  if (isLoading) {
    return (
      <main className="min-h-svh bg-muted/30 p-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </main>
    );
  }

  if (isError || !workspace) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
        <div className="w-full max-w-lg space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Could not load workspace</AlertTitle>
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={() => void refetch()} variant="outline">
              Try again
            </Button>
            <Button onClick={() => router.push("/dashboard")}>
              Back to dashboard
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return <WorkspaceShell workspace={workspace} />;
}
