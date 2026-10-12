import type { Express } from "express"; 
import { WorkspaceRoutes } from "./wrokspace.routes.js";
import { conversationRoutes, chatRoutes } from "./chat.routes.js";

export function registerRoutes(app: Express): void {
    app.use("/api/workspaces", WorkspaceRoutes);
    // Conversation CRUD: /api/workspaces/:workspaceId/conversations
    app.use("/api/workspaces/:workspaceId/conversations", conversationRoutes);
    // Streaming chat: /api/workspaces/:workspaceId/chat
    app.use("/api/workspaces/:workspaceId/chat", chatRoutes);
}