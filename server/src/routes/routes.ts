import type { Express } from "express"; 
import { WorkspaceRoutes } from "./wrokspace.routes.js";



export function registerRoutes(app: Express): void {
    app.use("/api/:workspaces", WorkspaceRoutes);
}