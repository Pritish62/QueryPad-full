import { z } from "zod";

export const sourceTypeSchema = z.enum([
    "PDF",
    "WEBSITE",
    "YOUTUBE",
    "TEXT",
    "MARKDOWN",
]);

export const sourceStatusSchema = z.enum([
    "PENDING",
    "PROCESSING",
    "READY",
    "FAILED",
]);

export const workspaceIdParamSchema = z.object({
    workspaceId: z.string().trim().min(1),
});

export const sourceIdParamSchema = z.object({
    workspaceId: z.string().trim().min(1),
    sourceId: z.string().trim().min(1),
});

export const listSourcesQuerySchema = z.object({
    q: z.string().trim().optional(),
    type: sourceTypeSchema.optional(),
    status: sourceStatusSchema.optional(),
});

export const createTextSourceSchema = z.object({
    type: z.literal("TEXT"),
    title: z.string().trim().min(1, "Title is required").max(200),
    content: z.string().trim().min(1, "Content is required"),
});

export const createMarkdownSourceSchema = z.object({
    type: z.literal("MARKDOWN"),
    title: z.string().trim().min(1, "Title is required").max(200),
    content: z.string().trim().min(1, "Content is required"),
});

export const createSourceSchema = z.discriminatedUnion("type", [
    createTextSourceSchema,
    createMarkdownSourceSchema,
]);




//TODO: Add validation for other source types (PDF, WEBSITE, YOUTUBE) when they are implemented


export const bulkDeleteSourcesSchema = z.object({
    sourceIds: z.array(z.string().trim().min(1)).min(1),
});

export const reprocessSourcesSchema = z.object({
    sourceIds: z.array(z.string().trim().min(1)).optional(),
});

export type ListSourcesQuery = z.infer<typeof listSourcesQuerySchema>;
export type CreateTextSource = z.infer<typeof createTextSourceSchema>;
export type CreateMarkdownSource = z.infer<typeof createMarkdownSourceSchema>;
export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type BulkDeleteSourcesInput = z.infer<typeof bulkDeleteSourcesSchema>;
export type ReprocessSourcesInput = z.infer<typeof reprocessSourcesSchema>;



