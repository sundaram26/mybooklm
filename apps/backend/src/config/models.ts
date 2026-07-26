export type ProviderName = "openai" | "anthropic" | "google";

export interface ModelConfig {
    id: string;
    provider: ProviderName;
    name: string;
}

export const SUPPORTED_MODELS: Record<string, ModelConfig> = {
    // OpenAI Models
    "gpt-4o": { id: "gpt-4o", provider: "openai", name: "GPT-4o" },
    "gpt-4o-mini": { id: "gpt-4o-mini", provider: "openai", name: "GPT-4o Mini" },
    
    // Anthropic Models
    "claude-3-5-sonnet-20241022": { id: "claude-3-5-sonnet-20241022", provider: "anthropic", name: "Claude 3.5 Sonnet (Latest)" },
    "claude-3-5-haiku-20241022": { id: "claude-3-5-haiku-20241022", provider: "anthropic", name: "Claude 3.5 Haiku" },
    "claude-3-haiku-20240307": { id: "claude-3-haiku-20240307", provider: "anthropic", name: "Claude 3 Haiku" },
    
    // Google Gemini Models
    "gemini-2.0-flash": { id: "gemini-2.0-flash", provider: "google", name: "Gemini 2.0 Flash" },
    "gemini-1.5-pro": { id: "gemini-1.5-pro", provider: "google", name: "Gemini 1.5 Pro" },
    "gemini-1.5-flash": { id: "gemini-1.5-flash", provider: "google", name: "Gemini 1.5 Flash" },
};
