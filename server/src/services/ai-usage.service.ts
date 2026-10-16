import { randomUUID } from "node:crypto";
import { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/db.js";
import { RateLimitError } from "../types/app-error.js";

export const AI_REQUEST_LIMIT = 20;

/**
 * Reserves one lifetime AI request for a user.
 *
 * The conditional upsert is atomic in PostgreSQL, so concurrent requests
 * cannot reserve more than the configured limit.
 */
export async function reserveAiRequest(userId: string): Promise<void> {
    const reserved = await prisma.$queryRaw<Array<{ id: string }>>(
        Prisma.sql`
            INSERT INTO "ai_usage" ("id", "user_id", "request_count", "created_at", "updated_at")
            VALUES (${randomUUID()}, ${userId}, 1, NOW(), NOW())
            ON CONFLICT ("user_id")
            DO UPDATE SET
                "request_count" = "ai_usage"."request_count" + 1,
                "updated_at" = NOW()
            WHERE "ai_usage"."request_count" < ${AI_REQUEST_LIMIT}
            RETURNING "id"
        `,
    );

    if (reserved.length === 0) {
        throw new RateLimitError(
            `You have used all ${AI_REQUEST_LIMIT} AI requests available for this account.`,
        );
    }
}
