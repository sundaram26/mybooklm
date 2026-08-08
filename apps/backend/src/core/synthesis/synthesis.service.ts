import { RetrievalService, type RetrievalResult } from "../retrieval/retrieval.service";
import { ProviderFactory } from "../../infrastructure/llm/providers/provider.factory";
import type { ChatMessage, ChatRole } from "../../infrastructure/llm/interfaces/provider.interface";
import { env } from "../../config/env.config";
import { SUPPORTED_MODELS } from "../../config/models";
import { LLMManager } from "../../infrastructure/llm/llm-manager";


export interface SynthesisResponse {
    text: string;
    sources: RetrievalResult[];
}

export interface SynthesisOptions {
    useHyde?: boolean;
    limit?: number;
    selectedModelId?: string;
}

export class SynthesisService {

    private static getLLM(selectedModelId?: string) {
        return LLMManager.getLLM("medium", selectedModelId);
    }

    /**
     * Prepares chat history + grounded system prompt.
     */
    private static prepareMessages(
        query: string,
        history: ChatMessage[],
        sources: RetrievalResult[]
    ): ChatMessage[] {
        // Format sources inline
        const formattedSources = sources.map((s, idx) => {
            const meta = s.metadata || {};
            const sourceName = meta.originalName || meta.sourceUrl || "Source Document";
            let locator = "";
            if (meta.pageNumber) {
                locator = ` (Page ${meta.pageNumber})`;
            } else if (meta.startTimestamp !== undefined) {
                locator = ` (Timestamp ${meta.startTimestamp}s)`;
            }
            return `[Source ${idx + 1}] ${sourceName}${locator}:\n${s.text}`;
        }).join("\n\n");

        const systemPrompt = `You are a helpful AI research assistant, simulating the grounding and synthesis experience of NotebookLM. 
Your goal is to answer the user's query using ONLY the provided source chunks.

CRITICAL RULES:
1. Base your answer strictly on the provided source chunks. Do not assume or extrapolate. If the context does not contain the answer, say "I cannot find the answer in the provided documents."
2. Cite your sources inline. In your inline citations, you MUST include the exact source locator if present (e.g. "[1 (Timestamp 45s)]" or "[2 (Page 4)]" or "[3]") so the user knows exactly where in the file or video the information resides.
3. Every claim you make MUST be backed by a source citation.
4. Keep your formatting clean, readable, and professional.

Sources:
${formattedSources}
`;

        const messages: ChatMessage[] = [
            { role: "system" as ChatRole, content: systemPrompt },
            ...history,
            { role: "user" as ChatRole, content: query }
        ];

        return messages;
    }

    /**
     * Non-streaming synthesis.
     */
    static async synthesize(
        notebookId: string,
        query: string,
        history: ChatMessage[] = [],
        options: SynthesisOptions = {}
    ): Promise<SynthesisResponse> {
        const limit = options.limit ?? 5;
        console.log(`[Synthesis] Retrieving sources for RAG chat session in notebook: ${notebookId}`);
        const sources = await RetrievalService.retrieve(notebookId, query, {
            useHyde: options.useHyde,
            limit
        });

        if (sources.length === 0) {
            return {
                text: "No source documents are uploaded to this notebook yet. Please upload files to start chatting.",
                sources: []
            };
        }

        // 2. Prepare grounded messages list
        const messages = this.prepareMessages(query, history, sources);

        // 3. Call LLM
        const llm = this.getLLM(options.selectedModelId);
        console.log(`[Synthesis] Generating grounded answer using LLM: ${llm.modelId}`);
        const responseText = await llm.provider.generateText(llm.modelId, messages);

        return {
            text: responseText,
            sources
        };
    }

    /**
     * Streaming synthesis.
     */
    static async *streamSynthesize(
        notebookId: string,
        query: string,
        history: ChatMessage[] = [],
        options: SynthesisOptions = {}
    ): AsyncGenerator<{ chunk?: string; sources?: RetrievalResult[] }, void, unknown> {
        const limit = options.limit ?? 5;
        console.log(`[Synthesis] Retrieving sources for streaming RAG in notebook: ${notebookId}`);
        const sources = await RetrievalService.retrieve(notebookId, query, {
            useHyde: options.useHyde,
            limit
        });

        if (sources.length === 0) {
            yield {
                chunk: "No source documents are uploaded to this notebook yet. Please upload files to start chatting.",
                sources: []
            };
            return;
        }

        // Yield sources first so the UI can render them instantly
        yield { sources };

        // 2. Prepare grounded messages list
        const messages = this.prepareMessages(query, history, sources);

        // 3. Stream from LLM
        const llm = this.getLLM(options.selectedModelId);
        console.log(`[Synthesis] Streaming grounded answer from LLM: ${llm.modelId}`);
        const textStream = llm.provider.streamText(llm.modelId, messages);

        for await (const chunk of textStream) {
            yield { chunk };
        }
    }
}
