import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Content } from "@google/generative-ai";
import type { ILLMProvider, ChatMessage } from "../interfaces/provider.interface";

export class GeminiAdapter implements ILLMProvider {
    private client: GoogleGenerativeAI;

    constructor(apiKey?: string) {
        // Uses provided key, or falls back to env variable
        const key = apiKey || process.env.GEMINI_API_KEY || "";
        this.client = new GoogleGenerativeAI(key);
    }

    private formatHistory(messages: ChatMessage[]) {
        const systemMessage = messages.find(m => m.role === "system")?.content;
        // Gemini expects history in specific format and final message separately
        const userAndAssistantMsgs = messages.filter(m => m.role !== "system");
        
        if (userAndAssistantMsgs.length === 0) {
            return { systemInstruction: systemMessage, history: [], prompt: "" };
        }
        
        const prompt = userAndAssistantMsgs[userAndAssistantMsgs.length - 1]!.content;
        const historyMsgs = userAndAssistantMsgs.slice(0, -1);
        
        const history: Content[] = historyMsgs.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
        }));
        
        return { systemInstruction: systemMessage, history, prompt };
    }

    async generateText(modelId: string, messages: ChatMessage[]): Promise<string> {
        const { systemInstruction, history, prompt } = this.formatHistory(messages);
        
        const model = this.client.getGenerativeModel({ 
            model: modelId,
            ...(systemInstruction && { systemInstruction: { role: "system", parts: [{ text: systemInstruction }]} })
        });
        
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(prompt);
        return result.response.text();
    }

    async *streamText(modelId: string, messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
        const { systemInstruction, history, prompt } = this.formatHistory(messages);
        
        const model = this.client.getGenerativeModel({ 
            model: modelId,
            ...(systemInstruction && { systemInstruction: { role: "system", parts: [{ text: systemInstruction }]} })
        });
        
        const chat = model.startChat({ history });
        const result = await chat.sendMessageStream(prompt);
        
        for await (const chunk of result.stream) {
            yield chunk.text();
        }
    }
}
