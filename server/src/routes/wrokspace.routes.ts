import { Router } from "express";

import { requireAuth } from "../middleware/requir-auth-middleware.js";
import {
    createWorkspace,
    deleteWorkspace,
    getWorkspace,
    listWorkspaces,
    updateWorkspace,
} from "../controllers/wrokspace.controller.js";

import { asyncHandler } from "../utils/async-handler.js";

export const WorkspaceRoutes = Router();

WorkspaceRoutes.use(requireAuth);

WorkspaceRoutes.get("/", asyncHandler(listWorkspaces));
WorkspaceRoutes.post("/", asyncHandler(createWorkspace));
WorkspaceRoutes.get("/:workspaceId", asyncHandler(getWorkspace));
WorkspaceRoutes.patch("/:workspaceId", asyncHandler(updateWorkspace));
WorkspaceRoutes.delete("/:workspaceId", asyncHandler(deleteWorkspace));