import { ProviderFactory } from "./providers/provider.factory";
import { env } from "../../config/env.config";
import { SUPPORTED_MODELS } from "../../config/models";

export class LLMManager {
    static getLLM(tier: "mini" | "medium" | "high" = "medium", selectedModelId?: string) {


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

        // 3. User Override
        if (tier !== "mini" && selectedModelId && SUPPORTED_MODELS[selectedModelId]) {
            defaultProvider = SUPPORTED_MODELS[selectedModelId].provider;
            defaultModelId = selectedModelId;
        }

        // 4. Resolve Provider Credentials
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
