import { RetrievalService, type RetrievalResult } from "../retrieval/retrieval.service";
import { ProviderFactory } from "../../infrastructure/llm/providers/provider.factory";
import type { ChatMessage, ChatRole } from "../../infrastructure/llm/interfaces/provider.interface";
import { env } from "../../config/env.config";
import { SUPPORTED_MODELS } from "../../config/models";

export interface SynthesisResponse {
    text: string;
    sources: RetrievalResult[];
}

export interface SynthesisOptions {
    useHyde?: boolean;
    limit?: number;
    /**
     * User's personal API key. Must be paired with modelId to route to the correct provider.
     */
    customApiKey?: string;
    /**
     * Model ID to use (e.g. "gpt-4o", "gemini-2.0-flash").
     * When paired with customApiKey, bypasses server-side key detection entirely.
     */
    modelId?: string;
}

export class SynthesisService {

    /**
     * Selects the LLM provider.
     * Priority order:
     *   1. If customApiKey + modelId are both given → use that exact model with the user's key.
     *   2. If only customApiKey is given (no modelId) → treat it as a Gemini key (most common use-case).
     *   3. Fall back to server-side configured keys (Gemini > OpenAI > Anthropic).
     */
    private static getLLM(customApiKey?: string, modelId?: string) {
        // Case 1: User supplied both a key and a model — route directly, no server keys used
        if (customApiKey && modelId) {
            const modelConfig = SUPPORTED_MODELS[modelId];
            if (modelConfig) {
                return {
                    provider: ProviderFactory.getProvider(modelId, customApiKey),
                    modelId
                };
            }
        }

        // Case 2: User supplied only a key — treat as Gemini (most common)
        if (customApiKey) {
            return {
                provider: ProviderFactory.getProvider(env.GEMINI_MODEL, customApiKey),
                modelId: env.GEMINI_MODEL
            };
        }

        // Case 3: Use server-configured keys
        const geminiKey = env.GEMINI_API_KEY;
        const openaiKey = env.OPENAI_API_KEY;
        const anthropicKey = env.ANTHROPIC_API_KEY;

        if (geminiKey && !geminiKey.includes("sample-gemini")) {
            return {
                provider: ProviderFactory.getProvider(env.GEMINI_MODEL),
                modelId: env.GEMINI_MODEL
            };
        }
        if (openaiKey && !openaiKey.includes("sample-openai")) {
            return {
                provider: ProviderFactory.getProvider(env.OPENAI_MODEL),
                modelId: env.OPENAI_MODEL
            };
        }
        if (anthropicKey && !anthropicKey.includes("sample-anthropic")) {
            return {
                provider: ProviderFactory.getProvider(env.ANTHROPIC_MODEL),
                modelId: env.ANTHROPIC_MODEL
            };
        }

        // Fallback default (will fail gracefully at the provider level if no key)
        return {
            provider: ProviderFactory.getProvider(env.GEMINI_MODEL),
            modelId: env.GEMINI_MODEL
        };
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
2. Cite your sources inline using [1], [2], etc., corresponding to the sources list below. Never invent citations.
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

        // 3. Call LLM — pass both customApiKey and modelId so provider routing is correct
        const llm = this.getLLM(options.customApiKey, options.modelId);
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

        // 3. Stream from LLM — pass both customApiKey and modelId so provider routing is correct
        const llm = this.getLLM(options.customApiKey, options.modelId);
        console.log(`[Synthesis] Streaming grounded answer from LLM: ${llm.modelId}`);
        const textStream = llm.provider.streamText(llm.modelId, messages);

        for await (const chunk of textStream) {
            yield { chunk };
        }
    }
}
