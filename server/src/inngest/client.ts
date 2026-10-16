import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "querypad",
    isDev: process.env.NODE_ENV !== "production",
});

// Event payload types (used for type-safe event sends)
export type SourceCreatedEvent = {
    name: "source/created";
    data: {
        sourceId: string;
        workspaceId: string;
    };
};