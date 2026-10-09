/**
 * Inngest event helpers for background source processing (RAG indexing).
 */

import { inngest } from "../../inngest/client.js";

export async function enqueueSourceProcessing(input: {
    sourceId: string;
    workspaceId: string;
}) {
    await inngest.send({
        name: "source/created",
        data: input,
    });
}