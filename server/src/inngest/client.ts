import { Inngest } from "inngest";

const isProduction = process.env.NODE_ENV === "production";
if (isProduction && !process.env.INNGEST_EVENT_KEY) {
    throw new Error(
        "INNGEST_EVENT_KEY is required in production to enqueue background jobs",
    );
}

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "querypad",
    isDev: !isProduction,
});

// Event payload types (used for type-safe event sends)
export type SourceCreatedEvent = {
    name: "source/created";
    data: {
        sourceId: string;
        workspaceId: string;
    };
};