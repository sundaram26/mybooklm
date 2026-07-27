import type { ILLMProvider } from "../interfaces/provider.interface";
import { SUPPORTED_MODELS } from "../../../config/models";
import { OpenAIAdapter } from "./openai.adapter";
import { AnthropicAdapter } from "./anthropic.adapter";
import { GeminiAdapter } from "./gemini.adapter";
import { CustomOpenAIAdapter } from "./custom-openai.adapter";

export class ProviderFactory {
    static getProvider(
        modelId: string, 
        customApiKey?: string, 
        providerOverride?: "google" | "openai" | "anthropic" | "other",
        customBaseUrl?: string
    ): ILLMProvider {
        // 1. Check if there is an explicit provider override
        if (providerOverride === "other") {
            return new CustomOpenAIAdapter(customApiKey, customBaseUrl);
        }
        if (providerOverride === "google") {
            return new GeminiAdapter(customApiKey);
        }
        if (providerOverride === "openai") {
            return new OpenAIAdapter(customApiKey);
        }
        if (providerOverride === "anthropic") {
            return new AnthropicAdapter(customApiKey);
        }

        // 2. Lookup in the static list of supported configurations
        const modelConfig = SUPPORTED_MODELS[modelId];
        if (modelConfig) {
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

        // 3. Fallback: Guess the provider name based on common prefix patterns
        const idLower = modelId.toLowerCase();
        if (idLower.includes("gemini")) {
            return new GeminiAdapter(customApiKey);
        }
        if (idLower.includes("claude")) {
            return new AnthropicAdapter(customApiKey);
        }
        if (idLower.includes("gpt") || idLower.startsWith("o1-") || idLower.startsWith("o3-")) {
            return new OpenAIAdapter(customApiKey);
        }

        // 4. Default fallback: use CustomOpenAIAdapter for custom/unregistered providers
        return new CustomOpenAIAdapter(customApiKey, customBaseUrl);
    }
}
