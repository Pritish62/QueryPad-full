import { Router } from "express";
import {
    createConversation,
    deleteConversation,
    listConversationMessages,
    listConversations,
    streamChat,
} from "../controllers/chat.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { requireAuth } from "../middleware/requir-auth-middleware.js";

export const conversationRoutes = Router({ mergeParams: true });

conversationRoutes.use(requireAuth);
conversationRoutes.get("/", asyncHandler(listConversations));
conversationRoutes.post("/", asyncHandler(createConversation));
conversationRoutes.get(
    "/:conversationId/messages",
    asyncHandler(listConversationMessages),
);
conversationRoutes.delete(
    "/:conversationId",
    asyncHandler(deleteConversation),
);

export const chatRoutes = Router({ mergeParams: true });

chatRoutes.use(requireAuth);
chatRoutes.post("/", asyncHandler(streamChat));