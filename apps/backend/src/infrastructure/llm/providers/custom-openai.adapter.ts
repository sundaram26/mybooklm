import OpenAI from "openai";
import type { ILLMProvider, ChatMessage } from "../interfaces/provider.interface";

export class CustomOpenAIAdapter implements ILLMProvider {
    private client: OpenAI;

    constructor(apiKey?: string, baseUrl?: string) {
        // Default to OpenRouter if no baseUrl is provided
        const finalBaseUrl = baseUrl || "https://openrouter.ai/api/v1";
        const finalApiKey = apiKey || "";

        this.client = new OpenAI({
            apiKey: finalApiKey,
            baseURL: finalBaseUrl,
            defaultHeaders: {
                "HTTP-Referer": "https://notebooklm.dev", // Helpful for tracking requests on OpenRouter
                "X-Title": "NotebookLM Clone",
            }
        });
    }

    async generateText(modelId: string, messages: ChatMessage[]): Promise<string> {
        const response = await this.client.chat.completions.create({
            model: modelId,
            messages: messages as any,
        });
        
        return response.choices[0]?.message?.content || "";
    }

    async *streamText(modelId: string, messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
        const stream = await this.client.chat.completions.create({
            model: modelId,
            messages: messages as any,
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                yield content;
            }
        }
    }
}
