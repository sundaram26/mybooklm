import type { ILLMProvider } from "../interfaces/provider.interface";
import { SUPPORTED_MODELS } from "../../../config/models";
import { OpenAIAdapter } from "./openai.adapter";
import { AnthropicAdapter } from "./anthropic.adapter";
import { GeminiAdapter } from "./gemini.adapter";

export class ProviderFactory {
    static getProvider(modelId: string, customApiKey?: string): ILLMProvider {
        const modelConfig = SUPPORTED_MODELS[modelId];
        
        if (!modelConfig) {
            throw new Error(`Model ${modelId} is not supported or not found in registry.`);
        }

        switch (modelConfig.provider) {
            case "openai":
                return new OpenAIAdapter(customApiKey);
            case "anthropic":
                return new AnthropicAdapter(customApiKey);
            case "google":
                return new GeminiAdapter(customApiKey);
            default:
                const _exhaustiveCheck: never = modelConfig.provider as never;
                throw new Error(`Provider ${modelConfig.provider} is not implemented.`);
        }
    }
}
