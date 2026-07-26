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

        // Ensure we aren't using dummy/sample keys
        const isOpenAIConfigured = openaiKey && !openaiKey.includes("sample-openai");
        const isGeminiConfigured = geminiKey && !geminiKey.includes("sample-gemini");

        if (isOpenAIConfigured) {
            try {
                const openai = new OpenAI({ apiKey: openaiKey });
                const response = await openai.embeddings.create({
                    model: "text-embedding-3-small",
                    input: text,
                });
                const vector = response.data[0]?.embedding;
                if (vector) return vector;
            } catch (error) {
                console.error("OpenAI embedding generation failed, falling back if possible:", error);
            }
        }

        if (isGeminiConfigured) {
            try {
                const genAI = new GoogleGenerativeAI(geminiKey!);
                const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
                const result = await model.embedContent(text);
                const vector = result.embedding.values;
                if (vector) return vector;
            } catch (error) {
                console.error("Gemini embedding generation failed:", error);
            }
        }

        // Mock embedding for local offline testing (OpenAI size = 1536 dimensions)
        console.warn("⚠️ API keys not configured. Falling back to mock embeddings (1536 dimensions) for local testing.");
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
        return Array.from({ length: 1536 }, () => rand() * 2 - 1);
    }

    /**
     * Generates numerical vector embeddings for an array of texts.
     * Batch processes using OpenAI/Gemini APIs for performance.
     */
    static async getEmbeddings(texts: string[]): Promise<number[][]> {
        if (texts.length === 0) return [];

        const openaiKey = env.OPENAI_API_KEY;
        const geminiKey = env.GEMINI_API_KEY;

        const isOpenAIConfigured = openaiKey && !openaiKey.includes("sample-openai");
        const isGeminiConfigured = geminiKey && !geminiKey.includes("sample-gemini");

        if (isOpenAIConfigured) {
            try {
                const openai = new OpenAI({ apiKey: openaiKey });
                const response = await openai.embeddings.create({
                    model: "text-embedding-3-small",
                    input: texts,
                });
                return response.data.map(item => item.embedding);
            } catch (error) {
                console.error("OpenAI batch embedding generation failed, falling back if possible:", error);
            }
        }

        if (isGeminiConfigured) {
            try {
                const genAI = new GoogleGenerativeAI(geminiKey!);
                const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
                
                const requests = texts.map(text => ({
                    content: { role: "user", parts: [{ text }] }
                }));

                const result = await model.batchEmbedContents({ requests });
                return result.embeddings.map(e => e.values);
            } catch (error) {
                console.error("Gemini batch embedding generation failed:", error);
            }
        }

        // Mock batch embeddings for local testing
        console.warn("⚠️ API keys not configured. Falling back to mock batch embeddings (1536 dimensions) for local testing.");
        const results: number[][] = [];
        for (const text of texts) {
            results.push(await this.getEmbedding(text));
        }
        return results;
    }

    /**
     * Returns the default vector dimension size based on configured providers.
     */
    static getDimensionSize(): number {
        const openaiKey = env.OPENAI_API_KEY;
        const isOpenAIConfigured = openaiKey && !openaiKey.includes("sample-openai");
        
        // OpenAI text-embedding-3-small yields 1536. Gemini text-embedding-004 yields 768.
        if (isOpenAIConfigured) return 1536;
        if (env.GEMINI_API_KEY && !env.GEMINI_API_KEY.includes("sample-gemini")) return 768;
        return 1536; // Default mock dimension size
    }
}
