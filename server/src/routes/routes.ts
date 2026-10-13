import type { Express } from "express"; 
import { WorkspaceRoutes } from "./wrokspace.routes.js";
import { conversationRoutes, chatRoutes } from "./chat.routes.js";
import { memoryRoutes } from "./memory.routes.js";

export function registerRoutes(app: Express): void {
    app.use("/api/workspaces", WorkspaceRoutes);
    app.use("/api/memory", memoryRoutes);
    // Conversation CRUD: /api/workspaces/:workspaceId/conversations
    app.use("/api/workspaces/:workspaceId/conversations", conversationRoutes);
    // Streaming chat: /api/workspaces/:workspaceId/chat
    app.use("/api/workspaces/:workspaceId/chat", chatRoutes);
}