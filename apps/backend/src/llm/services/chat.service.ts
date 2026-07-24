import type { ChatMessage } from "../interfaces/provider.interface";
import { ProviderFactory } from "../providers/provider.factory";

export class ChatService {
    /**
     * Generates a single complete text response.
     * @param modelId The ID of the model from our registry (e.g., 'gpt-4o')
     * @param messages The chat history
     * @param userApiKey Optional user-provided API key for "Bring Your Own Key" support
     */
    static async generate(modelId: string, messages: ChatMessage[], userApiKey?: string): Promise<string> {
        const provider = ProviderFactory.getProvider(modelId, userApiKey);
        return await provider.generateText(modelId, messages);
    }
    
    /**
     * Streams the text response chunk by chunk.
     * @param modelId The ID of the model from our registry
     * @param messages The chat history
     * @param userApiKey Optional user-provided API key
     */
    static stream(modelId: string, messages: ChatMessage[], userApiKey?: string): AsyncGenerator<string, void, unknown> {
        const provider = ProviderFactory.getProvider(modelId, userApiKey);
        return provider.streamText(modelId, messages);
    }
}
