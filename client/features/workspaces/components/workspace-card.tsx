"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { workspaceRoutes } from "../lib/routes";
import { getWorkspaceGradient } from "../lib/workspace-gradients";
import type { Workspace } from "../lib/types";

type WorkspaceCardProps = {
  workspace: Workspace;
  onEdit: (workspace: Workspace) => void;
  onDelete: (workspace: Workspace) => void;
};

export function WorkspaceCard({
  workspace,
  onEdit,
  onDelete,
}: WorkspaceCardProps) {
  return (
    <article className="group relative min-h-52 overflow-hidden rounded-3xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <Link
        aria-label={`Open ${workspace.title}`}
        className={cn(
          "absolute inset-0 bg-linear-to-br focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          getWorkspaceGradient(workspace.id),
        )}
        href={workspaceRoutes.detail(workspace.id)}
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-black/5 to-white/10" />
      <div className="pointer-events-none relative flex min-h-52 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">
            {workspace.icon || "📚"}
          </span>
          <div
            className="pointer-events-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    aria-label={`Actions for ${workspace.title}`}
                    className="size-8 bg-black/15 text-white hover:bg-black/25 hover:text-white"
                    size="icon-sm"
                    variant="ghost"
                  />
                }
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(workspace)}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(workspace)}
                  variant="destructive"
                >
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-auto space-y-1.5 pt-8 text-white">
          <h2 className="line-clamp-2 font-heading text-lg font-semibold leading-snug">
            {workspace.title}
          </h2>
          {workspace.description ? (
            <p className="line-clamp-2 text-sm text-white/85">
              {workspace.description}
            </p>
          ) : null}
          <p className="text-xs text-white/75">
            Updated{" "}
            {formatDistanceToNow(new Date(workspace.updatedAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </article>
  );
}
