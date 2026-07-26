import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { optionalAuth } from "../middlewares/auth.middleware";

export const chatRoutes: Router = Router();

chatRoutes.use(optionalAuth);

// Session management
chatRoutes.post("/:notebookId/chats", ChatController.createSession);
chatRoutes.get("/:notebookId/chats", ChatController.getSessions);

// Messages
chatRoutes.get("/:notebookId/chats/:sessionId/messages", ChatController.getMessages);
chatRoutes.post("/:notebookId/chats/:sessionId/messages", ChatController.sendMessage);

// Branching: get replies to a specific message (for rendering a branched conversation tree)
chatRoutes.get("/:notebookId/chats/:sessionId/messages/:messageId/replies", ChatController.getMessageReplies);
