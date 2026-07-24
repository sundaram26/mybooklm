export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
    role: ChatRole;
    content: string;
}

export interface ILLMProvider {
    /**
     * Generates a complete text response from the LLM.
     * @param modelId The exact model string expected by the provider (e.g., 'gpt-4o')
     * @param messages The standard array of chat messages
     */
    generateText(modelId: string, messages: ChatMessage[]): Promise<string>;
    
    /**
     * Streams the text response chunk by chunk.
     * @param modelId The exact model string expected by the provider
     * @param messages The standard array of chat messages
     */
    streamText(modelId: string, messages: ChatMessage[]): AsyncGenerator<string, void, unknown>;
}
