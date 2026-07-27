import { ProviderFactory } from "./providers/provider.factory";
import { env } from "../../config/env.config";

export interface TierConfig {
    provider: "google" | "openai" | "anthropic" | "other" | "default";
    apiKey?: string;
    modelId?: string;
    baseUrl?: string;
}

export interface LLMConfig {
    mini?: TierConfig;
    medium?: TierConfig;
    high?: TierConfig;
}

export class LLMManager {
    /**
     * Resolves the configured LLM provider and model based on custom user settings or server defaults
     * for a given task tier.
     * 
     * @param settings User's tier-based custom configurations
     * @param tier The task tier: "mini" (small tasks), "medium" (grounded chat), or "high" (studio generation)
     */
    static getLLM(settings?: LLMConfig, tier: "mini" | "medium" | "high" = "medium") {
        const tierConfig = settings?.[tier];
        const provider = tierConfig?.provider || "default";

        // 1. Resolve custom user configuration if set for this tier
        if (provider === "google") {
            const modelId = tierConfig?.modelId || "gemini-2.0-flash";
            return {
                provider: ProviderFactory.getProvider(modelId, tierConfig?.apiKey, "google"),
                modelId
            };
        }

        if (provider === "openai") {
            const modelId = tierConfig?.modelId || "gpt-4o-mini";
            return {
                provider: ProviderFactory.getProvider(modelId, tierConfig?.apiKey, "openai"),
                modelId
            };
        }

        if (provider === "anthropic") {
            const modelId = tierConfig?.modelId || "claude-3-5-haiku-20241022";
            return {
                provider: ProviderFactory.getProvider(modelId, tierConfig?.apiKey, "anthropic"),
                modelId
            };
        }

        if (provider === "other") {
            const modelId = tierConfig?.modelId || "meta-llama/llama-3-8b-instruct";
            return {
                provider: ProviderFactory.getProvider(modelId, tierConfig?.apiKey, "other", tierConfig?.baseUrl),
                modelId
            };
        }

        // 2. Fallback to server-side tier-specific defaults
        let defaultProvider = "default";
        let defaultModelId = "";
        let defaultBaseUrl = "";
        let defaultApiKey = "";

        if (tier === "mini") {
            defaultProvider = env.MINI_PROVIDER || "default";
            defaultModelId = env.MINI_MODEL || "";
        } else if (tier === "medium") {
            defaultProvider = env.MEDIUM_PROVIDER || "default";
            defaultModelId = env.MEDIUM_MODEL || "";
        } else if (tier === "high") {
            defaultProvider = env.HIGH_PROVIDER || "default";
            defaultModelId = env.HIGH_MODEL || "";
        }

        // If the tier-specific provider is "default", resolve the first available configured API key
        if (defaultProvider === "default") {
            const geminiKey = env.GEMINI_API_KEY;
            const openaiKey = env.OPENAI_API_KEY;
            const anthropicKey = env.ANTHROPIC_API_KEY;

            const isGeminiConfigured = geminiKey && !geminiKey.includes("sample-gemini");
            const isOpenAIConfigured = openaiKey && !openaiKey.includes("sample-openai");
            const isAnthropicConfigured = anthropicKey && !anthropicKey.includes("sample-anthropic");

            if (isGeminiConfigured) {
                defaultProvider = "google";
                defaultModelId = defaultModelId || (tier === "high" ? "gemini-2.0-pro" : "gemini-2.0-flash");
                defaultApiKey = geminiKey!;
            } else if (isOpenAIConfigured) {
                defaultProvider = "openai";
                defaultModelId = defaultModelId || (tier === "high" ? "gpt-4o" : "gpt-4o-mini");
                defaultApiKey = openaiKey!;
            } else if (isAnthropicConfigured) {
                defaultProvider = "anthropic";
                defaultModelId = defaultModelId || (tier === "high" ? "claude-3-5-sonnet-20241022" : "claude-3-5-haiku-20241022");
                defaultApiKey = anthropicKey!;
            } else {
                // Fallback default if absolutely nothing is set
                return {
                    provider: ProviderFactory.getProvider("gemini-2.0-flash", undefined, "google"),
                    modelId: "gemini-2.0-flash"
                };
            }
        } else {
            // Retrieve key matching the chosen provider
            if (defaultProvider === "google") {
                defaultApiKey = env.GEMINI_API_KEY || "";
                defaultModelId = defaultModelId || "gemini-2.0-flash";
            } else if (defaultProvider === "openai") {
                defaultApiKey = env.OPENAI_API_KEY || "";
                defaultModelId = defaultModelId || "gpt-4o-mini";
            } else if (defaultProvider === "anthropic") {
                defaultApiKey = env.ANTHROPIC_API_KEY || "";
                defaultModelId = defaultModelId || "claude-3-5-haiku-20241022";
            } else if (defaultProvider === "other") {
                defaultApiKey = env.OPENROUTER_API_KEY || env.OPENAI_API_KEY || "";
                defaultBaseUrl = env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
                defaultModelId = defaultModelId || "meta-llama/llama-3-8b-instruct";
            }
        }

        const resolvedProvider = defaultProvider === "google" ? "google" :
                                 defaultProvider === "openai" ? "openai" :
                                 defaultProvider === "anthropic" ? "anthropic" : "other";

        return {
            provider: ProviderFactory.getProvider(defaultModelId, defaultApiKey, resolvedProvider, defaultBaseUrl),
            modelId: defaultModelId
        };
    }
}
