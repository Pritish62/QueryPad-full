/**
 * Inngest event helpers for background source processing (RAG indexing).
 */

import { inngest } from "../../inngest/client.js";

export async function enqueueSourceProcessing(input: {
    sourceId: string;
    workspaceId: string;
}) {
    try {
        const result = await inngest.send({
            name: "source/created",
            data: input,
        });
        console.info("Queued source processing", {
            sourceId: input.sourceId,
            workspaceId: input.workspaceId,
            eventIds: result.ids,
        });
    } catch (error) {
        console.error("Failed to queue source processing", {
            sourceId: input.sourceId,
            workspaceId: input.workspaceId,
            error,
        });
        throw error;
    }
}