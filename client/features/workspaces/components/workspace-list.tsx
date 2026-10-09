"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ApiError } from "@/shared/lib/api";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateWorkspace,
  useDeleteWorkspace,
  useUpdateWorkspace,
  useWorkspaces,
} from "../hooks/use-workspaces";
import { workspaceRoutes } from "../lib/routes";
import type { Workspace } from "../lib/types";
import { WorkspaceCard } from "./workspace-card";
import { WorkspaceFormDialog } from "./workspace-form-dialog";
import { useState } from "react";

export function WorkspaceList() {
  const router = useRouter();
  const { data: workspaces, error, isLoading } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(
    null,
  );
  const [deletingWorkspace, setDeletingWorkspace] =
    useState<Workspace | null>(null);
  const updateWorkspace = useUpdateWorkspace(editingWorkspace?.id ?? "");

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton className="h-52 rounded-3xl" key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Could not load workspaces</EmptyTitle>
          <EmptyDescription>
            {error instanceof ApiError
              ? error.message
              : "Please try again in a moment."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  async function handleDelete(workspace: Workspace) {
    if (!window.confirm(`Delete "${workspace.title}"?`)) {
      return;
    }

    await deleteWorkspace.mutateAsync(workspace.id);
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">
            Your workspaces
          </h2>
          <p className="text-sm text-muted-foreground">
            Create notebooks to organize sources and chats.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          New workspace
        </Button>
      </div>

      {workspaces?.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              onDelete={(selected) => void handleDelete(selected)}
              onEdit={setEditingWorkspace}
              workspace={workspace}
            />
          ))}
        </div>
      ) : (
        <Empty className="mt-6 border">
          <EmptyHeader>
            <EmptyTitle>No workspaces yet</EmptyTitle>
            <EmptyDescription>
              Create your first notebook to organize sources and chats.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus />
              Create workspace
            </Button>
          </EmptyContent>
        </Empty>
      )}

      <WorkspaceFormDialog
        isPending={createWorkspace.isPending}
        onOpenChange={setCreateOpen}
        onSubmit={async (values) => {
          const workspace = await createWorkspace.mutateAsync(values);
          router.push(workspaceRoutes.detail(workspace.id));
        }}
        open={createOpen}
      />
      <WorkspaceFormDialog
        isPending={updateWorkspace.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setEditingWorkspace(null);
          }
        }}
        onSubmit={async (values) => {
          await updateWorkspace.mutateAsync(values);
          setEditingWorkspace(null);
        }}
        open={Boolean(editingWorkspace)}
        workspace={editingWorkspace}
      />
    </>
  );
}
