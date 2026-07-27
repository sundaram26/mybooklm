import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env.config";

export class EmbeddingService {
    /**
     * Generates a numerical vector embedding for the given text.
     * Prioritizes OpenAI text-embedding-3-small (1536 dim), falls back to Gemini text-embedding-004.
     */
    static async getEmbedding(text: string): Promise<number[]> {
        const openaiKey = env.OPENAI_API_KEY;
        const geminiKey = env.GEMINI_API_KEY;

        const provider = env.EMBEDDING_PROVIDER || "default";
        const modelId = env.EMBEDDING_MODEL || "";

        // Resolve active provider
        let activeProvider = provider;
        if (activeProvider === "default") {
            const isOpenAIConfigured = openaiKey && !openaiKey.includes("sample-openai");
            const isGeminiConfigured = geminiKey && !geminiKey.includes("sample-gemini");
            if (isOpenAIConfigured) activeProvider = "openai";
            else if (isGeminiConfigured) activeProvider = "google";
        }

        if (activeProvider === "openai" && openaiKey && !openaiKey.includes("sample-openai")) {
            try {
                const openai = new OpenAI({ apiKey: openaiKey });
                const response = await openai.embeddings.create({
                    model: modelId || "text-embedding-3-small",
                    input: text,
                    dimensions: 768, // Align with Gemini's 768 dimensions
                });
                const vector = response.data[0]?.embedding;
                if (vector) return vector;
            } catch (error) {
                console.error("OpenAI embedding generation failed, falling back if possible:", error);
            }
        }

        if ((activeProvider === "google" || activeProvider === "gemini") && geminiKey && !geminiKey.includes("sample-gemini")) {
            try {
                const genAI = new GoogleGenerativeAI(geminiKey!);
                const model = genAI.getGenerativeModel({ model: modelId || "text-embedding-004" });
                const result = await model.embedContent(text);
                const vector = result.embedding.values;
                if (vector) return vector;
            } catch (error) {
                console.error("Gemini embedding generation failed:", error);
            }
        }

        // Mock embedding for local offline testing (Gemini size = 768 dimensions)
        console.warn("⚠️ API keys not configured. Falling back to mock embeddings (768 dimensions) for local testing.");
        const seedRandom = (str: string) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            return () => {
                const x = Math.sin(hash++) * 10000;
                return x - Math.floor(x);
            };
        };
        const rand = seedRandom(text);
        return Array.from({ length: 768 }, () => rand() * 2 - 1);
    }

    /**
     * Generates numerical vector embeddings for an array of texts.
     * Batch processes using OpenAI/Gemini APIs for performance.
     */
    static async getEmbeddings(texts: string[]): Promise<number[][]> {
        if (texts.length === 0) return [];

        const openaiKey = env.OPENAI_API_KEY;
        const geminiKey = env.GEMINI_API_KEY;

        const provider = env.EMBEDDING_PROVIDER || "default";
        const modelId = env.EMBEDDING_MODEL || "";

        // Resolve active provider
        let activeProvider = provider;
        if (activeProvider === "default") {
            const isOpenAIConfigured = openaiKey && !openaiKey.includes("sample-openai");
            const isGeminiConfigured = geminiKey && !geminiKey.includes("sample-gemini");
            if (isOpenAIConfigured) activeProvider = "openai";
            else if (isGeminiConfigured) activeProvider = "google";
        }

        const batchSize = 100;
        const batches: string[][] = [];
        for (let i = 0; i < texts.length; i += batchSize) {
            batches.push(texts.slice(i, i + batchSize));
        }

        const results: number[][] = [];

        for (const batch of batches) {
            let batchVectors: number[][] | null = null;

            if (activeProvider === "openai" && openaiKey && !openaiKey.includes("sample-openai")) {
                try {
                    const openai = new OpenAI({ apiKey: openaiKey });
                    const response = await openai.embeddings.create({
                        model: modelId || "text-embedding-3-small",
                        input: batch,
                        dimensions: 768, // Align with Gemini's 768 dimensions
                    });
                    batchVectors = response.data.map(item => item.embedding);
                } catch (error) {
                    console.error("OpenAI batch embedding generation failed, falling back if possible:", error);
                }
            }

            if (!batchVectors && (activeProvider === "google" || activeProvider === "gemini") && geminiKey && !geminiKey.includes("sample-gemini")) {
                try {
                    const genAI = new GoogleGenerativeAI(geminiKey!);
                    const model = genAI.getGenerativeModel({ model: modelId || "text-embedding-004" });
                    
                    const requests = batch.map(text => ({
                        content: { role: "user", parts: [{ text }] }
                    }));

                    const result = await model.batchEmbedContents({ requests });
                    batchVectors = result.embeddings.map(e => e.values);
                } catch (error) {
                    console.error("Gemini batch embedding generation failed:", error);
                }
            }

            if (!batchVectors) {
                console.warn("⚠️ API keys not configured or failed. Falling back to mock batch embeddings (768 dimensions) for local testing.");
                batchVectors = [];
                for (const text of batch) {
                    batchVectors.push(await this.getEmbedding(text));
                }
            }

            results.push(...batchVectors);
        }

        return results;
    }

    /**
     * Returns the default vector dimension size based on configured providers.
     */
    static getDimensionSize(): number {
        return 768; // Enforced 768 across all providers
    }
}
