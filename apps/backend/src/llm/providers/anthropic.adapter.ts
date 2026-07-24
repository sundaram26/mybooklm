import Anthropic from "@anthropic-ai/sdk";
import type { ILLMProvider, ChatMessage } from "../interfaces/provider.interface";

export class AnthropicAdapter implements ILLMProvider {
    private client: Anthropic;

    constructor(apiKey?: string) {
        this.client = new Anthropic({ apiKey });
    }

    private formatMessages(messages: ChatMessage[]) {
        // Anthropic requires specific message mapping and separates system prompts
        const systemMessage = messages.find(m => m.role === "system")?.content;
        const chatMessages = messages
            .filter(m => m.role !== "system")
            .map(m => ({
                role: m.role as "user" | "assistant",
                content: m.content
            }));
            
        return { systemMessage, chatMessages };
    }

    async generateText(modelId: string, messages: ChatMessage[]): Promise<string> {
        const { systemMessage, chatMessages } = this.formatMessages(messages);
        
        const response = await this.client.messages.create({
            model: modelId,
            max_tokens: 4096,
            ...(systemMessage && { system: systemMessage }),
            messages: chatMessages,
        });
        
        const block = response.content[0];
        if (block?.type === 'text') {
            return block.text;
        }
        return "";
    }

    async *streamText(modelId: string, messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
        const { systemMessage, chatMessages } = this.formatMessages(messages);
        
        const stream = await this.client.messages.create({
            model: modelId,
            max_tokens: 4096,
            ...(systemMessage && { system: systemMessage }),
            messages: chatMessages,
            stream: true,
        });

        for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
                yield chunk.delta.text;
            }
        }
    }
}
