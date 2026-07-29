import type { Request, Response } from "express";
import { prisma } from "../../infrastructure/db/prisma";
import { SynthesisService } from "../../core/synthesis/synthesis.service";
import { MessageRole } from "../../../generated/prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import type { ChatMessage, ChatRole } from "../../infrastructure/llm/interfaces/provider.interface";

// Maximum prompts allowed for guest (anonymous or unauthenticated) users per notebook
const GUEST_PROMPT_LIMIT = 10;

export class ChatController {

    static createSession = asyncHandler(async (req: Request, res: Response) => {
        const notebookId = req.params.notebookId as string;
        const { title } = req.body;

        const session = await prisma.chatSession.create({
            data: {
                notebookId,
                title: title || "New Chat Session"
            }
        });

        res.status(201).json({ success: true, data: session });
    });

    static getSessions = asyncHandler(async (req: Request, res: Response) => {
        const notebookId = req.params.notebookId as string;

        const sessions = await prisma.chatSession.findMany({
            where: { notebookId },
            orderBy: { updatedAt: "desc" }
        });

        res.status(200).json({ success: true, data: sessions });
    });

    static getMessages = asyncHandler(async (req: Request, res: Response) => {
        const sessionId = req.params.sessionId as string;

        const messages = await prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: "asc" }
        });

        res.status(200).json({ success: true, data: messages });
    });

    /**
     * Builds the conversation thread for a branched message by traversing parentId chain
     * from the branch point back to the root. Returns messages in chronological order.
     */
    private static async buildBranchHistory(parentId: string): Promise<ChatMessage[]> {
        const chain: Array<{ role: string; content: string }> = [];
        let currentId: string | null = parentId;

        // Walk up the parent chain (max 50 hops to prevent infinite loops)
        let hops = 0;
        while (currentId && hops < 50) {
            // Explicit return type annotation prevents 'implicitly any' circular inference
            const msg: { id: string; role: string; content: string; parentId: string | null } | null =
                await prisma.chatMessage.findUnique({
                    where: { id: currentId },
                    select: { id: true, role: true, content: true, parentId: true }
                });
            if (!msg) break;
            chain.unshift({ role: msg.role, content: msg.content }); // prepend to keep chronological order
            currentId = msg.parentId;
            hops++;
        }

        return chain.map(m => ({
            role: m.role.toLowerCase() as ChatRole,
            content: m.content
        }));
    }

    /**
     * Returns true if the current requester is a guest (anonymous better-auth user or unauthenticated).
     */
    private static isGuest(res: Response): boolean {
        const user = res.locals.user;
        if (!user) return true; // No session at all — pure guest
        return user.isAnonymous === true; // better-auth anonymous session
    }

    /**
     * Counts total USER prompts sent across all chat sessions for a given notebook.
     * Used to enforce the guest prompt limit.
     */
    private static async countGuestPrompts(notebookId: string): Promise<number> {
        return await prisma.chatMessage.count({
            where: {
                role: MessageRole.USER,
                session: { notebookId }
            }
        });
    }

    static sendMessage = asyncHandler(async (req: Request, res: Response) => {
        const notebookId = req.params.notebookId as string;
        const sessionId = req.params.sessionId as string;
        const {
            query,
            stream = false,
            useHyde = false,
            parentId,       // Optional: ID of message to branch from
        } = req.body;

        if (!query) {
            res.status(400).json({ success: false, message: "Query string is required." });
            return;
        }

        // --- Guest Prompt Limit ---
        if (ChatController.isGuest(res)) {
            const usedPrompts = await ChatController.countGuestPrompts(notebookId);
            if (usedPrompts >= GUEST_PROMPT_LIMIT) {
                res.status(429).json({
                    success: false,
                    code: "GUEST_LIMIT_REACHED",
                    message: `Guest users are limited to ${GUEST_PROMPT_LIMIT} prompts per notebook. Please sign in to continue.`,
                    used: usedPrompts,
                    limit: GUEST_PROMPT_LIMIT
                });
                return;
            }
        }

        // Validate session exists
        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId }
        });
        if (!session) {
            res.status(404).json({ success: false, message: "Chat session not found." });
            return;
        }

        // --- Build Chat History ---
        // If parentId is provided, traverse the branch tree upward.
        // Otherwise, load the last 10 messages from the session linearly.
        let history: ChatMessage[];

        if (parentId) {
            history = await ChatController.buildBranchHistory(parentId);
        } else {
            const dbHistory = await prisma.chatMessage.findMany({
                where: { sessionId },
                orderBy: { createdAt: "asc" },
                take: 10
            });
            history = dbHistory.map(msg => ({
                role: msg.role.toLowerCase() as ChatRole,
                content: msg.content
            }));
        }

        // Save User Query message in Postgres (with optional parentId for branching)
        const userMsg = await prisma.chatMessage.create({
            data: {
                sessionId,
                role: MessageRole.USER,
                content: query,
                ...(parentId ? { parentId } : {})
            }
        });

        const synthesisOptions: import("../../core/synthesis/synthesis.service").SynthesisOptions = {
            useHyde: useHyde as boolean
        };

        if (stream) {
            // Setup SSE headers
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.flushHeaders();

            let assistantResponseText = "";
            let retrievedSources: any[] = [];

            try {
                const streamGenerator = SynthesisService.streamSynthesize(notebookId, query, history, synthesisOptions);

                for await (const val of streamGenerator) {
                    if (val.sources) {
                        retrievedSources = val.sources;
                        res.write(`data: ${JSON.stringify({ sources: retrievedSources })}\n\n`);
                    }
                    if (val.chunk) {
                        assistantResponseText += val.chunk;
                        res.write(`data: ${JSON.stringify({ chunk: val.chunk })}\n\n`);
                    }
                }

                // Append markdown citations footer to store in the DB
                let finalContentWithCitations = assistantResponseText;
                if (retrievedSources.length > 0) {
                    const citationLines = retrievedSources.map((s, idx) => {
                        const meta = s.metadata || {};
                        const name = meta.originalName || meta.sourceUrl || "Source Document";
                        const locator = meta.pageNumber
                            ? ` (Page ${meta.pageNumber})`
                            : (meta.startTimestamp !== undefined ? ` (Timestamp ${meta.startTimestamp}s)` : "");
                        return `- [${idx + 1}] ${name}${locator}`;
                    }).join("\n");
                    finalContentWithCitations += `\n\n**Sources:**\n${citationLines}`;
                }

                // Save assistant grounded response — branch from the user message we just created
                const assistantMsg = await prisma.chatMessage.create({
                    data: {
                        sessionId,
                        role: MessageRole.ASSISTANT,
                        content: finalContentWithCitations,
                        parentId: userMsg.id // Assistant reply is always a child of the user turn
                    }
                });

                // Touch ChatSession updatedAt so it bubbles to top of sidebar
                await prisma.chatSession.update({
                    where: { id: sessionId },
                    data: { updatedAt: new Date() }
                });

                res.write(`data: ${JSON.stringify({ done: true, messageId: assistantMsg.id, userMessageId: userMsg.id })}\n\n`);
                res.end();

            } catch (streamErr: any) {
                console.error("[ChatController] SSE stream synthesis failed:", streamErr);
                res.write(`data: ${JSON.stringify({ error: streamErr.message || "Streaming synthesis failed." })}\n\n`);
                res.end();
            }

        } else {
            // Non-streaming response
            try {
                const result = await SynthesisService.synthesize(notebookId, query, history, synthesisOptions);

                let finalContentWithCitations = result.text;
                if (result.sources.length > 0) {
                    const citationLines = result.sources.map((s, idx) => {
                        const meta = s.metadata || {};
                        const name = meta.originalName || meta.sourceUrl || "Source Document";
                        const locator = meta.pageNumber
                            ? ` (Page ${meta.pageNumber})`
                            : (meta.startTimestamp !== undefined ? ` (Timestamp ${meta.startTimestamp}s)` : "");
                        return `- [${idx + 1}] ${name}${locator}`;
                    }).join("\n");
                    finalContentWithCitations += `\n\n**Sources:**\n${citationLines}`;
                }

                // Save assistant reply — branch from the user message
                const assistantMsg = await prisma.chatMessage.create({
                    data: {
                        sessionId,
                        role: MessageRole.ASSISTANT,
                        content: finalContentWithCitations,
                        parentId: userMsg.id
                    }
                });

                // Touch ChatSession updatedAt
                await prisma.chatSession.update({
                    where: { id: sessionId },
                    data: { updatedAt: new Date() }
                });

                res.status(200).json({
                    success: true,
                    data: {
                        userMessage: userMsg,
                        assistantMessage: assistantMsg,
                        sources: result.sources,
                        // Inform the client whether they are approaching the guest limit
                        guestPromptsUsed: ChatController.isGuest(res)
                            ? await ChatController.countGuestPrompts(notebookId)
                            : undefined,
                        guestPromptLimit: ChatController.isGuest(res) ? GUEST_PROMPT_LIMIT : undefined
                    }
                });

            } catch (err: any) {
                console.error("[ChatController] Synthesis failed:", err);
                res.status(500).json({ success: false, message: err.message || "Failed to generate answer." });
            }
        }
    });

    /**
     * Returns all direct replies (children) of a message — for rendering branched conversations.
     */
    static getMessageReplies = asyncHandler(async (req: Request, res: Response) => {
        const messageId = req.params.messageId as string;

        const replies = await prisma.chatMessage.findMany({
            where: { parentId: messageId },
            orderBy: { createdAt: "asc" }
        });

        res.status(200).json({ success: true, data: replies });
    });
}
