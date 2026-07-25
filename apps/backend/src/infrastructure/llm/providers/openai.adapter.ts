import OpenAI from "openai";
import type { ILLMProvider, ChatMessage } from "../interfaces/provider.interface";

export class OpenAIAdapter implements ILLMProvider {
    private client: OpenAI;

    constructor(apiKey?: string) {
        // If apiKey is not provided, OpenAI SDK automatically picks up process.env.OPENAI_API_KEY
        this.client = new OpenAI({ apiKey });
    }

    async generateText(modelId: string, messages: ChatMessage[]): Promise<string> {
        const response = await this.client.chat.completions.create({
            model: modelId,
            messages: messages as any, // Roles standardly match user/assistant/system
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
