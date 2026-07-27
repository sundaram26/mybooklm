import { QdrantDatabase } from "../../infrastructure/vector_db/qdrant.database";
import { EmbeddingService } from "../embedding/embedding.service";
import { ProviderFactory } from "../../infrastructure/llm/providers/provider.factory";
import { env } from "../../config/env.config";
import { LLMManager } from "../../infrastructure/llm/llm-manager";
import type { LLMConfig } from "../../infrastructure/llm/llm-manager";

export interface RetrievalOptions {
    useHyde?: boolean | undefined;
    limit?: number | undefined;
    llmSettings?: LLMConfig | undefined;
}

export interface RetrievalResult {
    text: string;
    score: number;
    metadata: Record<string, any>;
}

export class RetrievalService {
    private static qdrant = new QdrantDatabase();
    private static COLLECTION_NAME = "notebook_chunks";

    private static getLLM(settings?: LLMConfig) {
        return LLMManager.getLLM(settings, "mini");
    }

    /**
     * Retrieves the most semantically relevant chunks for a given user query and notebook.
     * Incorporates Query Optimization, HyDE, Vector Search, and LLM Reranking.
     */
    static async retrieve(
        notebookId: string,
        query: string,
        options: RetrievalOptions = {}
    ): Promise<RetrievalResult[]> {
        const useHyde = options.useHyde ?? false;
        const limit = options.limit ?? 5;
        
        let targetSearchText = query;
        const llm = this.getLLM(options.llmSettings);

        if (llm) {
            try {
                // 1. Query Optimization
                console.log("[Retrieval] Optimizing user query...");
                const optPrompt = `You are a search query optimizer. Given a user query, rewrite it to be clean, clear, and ideal for semantic vector search. Do NOT include any conversation or explanation. Just output the query.
Query: "${query}"
Optimized Query:`;
                
                const optimizedQuery = await llm.provider.generateText(llm.modelId, [
                    { role: "user", content: optPrompt }
                ]);
                
                const optClean = optimizedQuery.trim();
                if (optClean) {
                    targetSearchText = optClean;
                    console.log(`[Retrieval] Optimized Query: "${targetSearchText}"`);
                }

                // 2. HyDE (Hypothetical Document Embedding)
                if (useHyde) {
                    console.log("[Retrieval] Generating HyDE hypothetical document...");
                    const hydePrompt = `Write a plausible, brief hypothetical answer paragraph that directly answers the query. Do not worry about factual correctness, write what would be a helpful answer structure.
Query: "${targetSearchText}"
Hypothetical Answer:`;
                    
                    const hydeAnswer = await llm.provider.generateText(llm.modelId, [
                        { role: "user", content: hydePrompt }
                    ]);
                    if (hydeAnswer.trim()) {
                        targetSearchText = hydeAnswer.trim();
                        console.log(`[Retrieval] HyDE Paragraph: "${targetSearchText.substring(0, 150)}..."`);
                    }
                }
            } catch (err) {
                console.error("[Retrieval] LLM preprocessing failed, using raw query:", err);
                targetSearchText = query;
            }
        }

        // 3. Vector Search (Recall phase - retrieve top 30 chunks)
        console.log(`[Retrieval] Querying vector storage for Top 30 candidate chunks with notebookId filter: ${notebookId}`);
        const queryVector = await EmbeddingService.getEmbedding(targetSearchText);
        
        let candidates;
        try {
            candidates = await this.qdrant.search(
                this.COLLECTION_NAME,
                queryVector,
                30,
                { notebookId }
            );
        } catch (searchError) {
            console.error("[Retrieval] Vector database search failed:", searchError);
            return [];
        }

        if (candidates.length === 0) {
            return [];
        }

        let finalResults: RetrievalResult[] = candidates.map(c => ({
            text: c.payload.text || "",
            score: c.score,
            metadata: c.payload
        }));

        // 4. Reranking (Precision phase - score candidates using LLM)
        if (llm && finalResults.length > 1) {
            try {
                console.log(`[Retrieval] Reranking ${finalResults.length} chunks via LLM...`);
                
                const chunkListString = finalResults
                    .map((item, idx) => `[Index ${idx}]: ${item.text.substring(0, 300)}...`)
                    .join("\n\n");
                    
                const rerankPrompt = `Given the user query and a list of text chunks, rate each chunk's relevance to the query on a scale of 0 to 10 (where 10 is highly relevant, and 0 is completely irrelevant).
Respond with a JSON array of objects containing the index of the chunk and its relevance score. Example output format:
[
  { "index": 0, "score": 8.5 },
  { "index": 1, "score": 2.0 }
]
Do NOT return any markdown code blocks, text, or warnings. Return ONLY the raw JSON string array.

Query: "${query}"

Chunks:
${chunkListString}

JSON Response:`;

                const scoreResponseStr = await llm.provider.generateText(llm.modelId, [
                    { role: "user", content: rerankPrompt }
                ]);
                
                // Clean response of potential markdown wrapping
                const cleanJson = scoreResponseStr
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .trim();
                    
                const scoresList = JSON.parse(cleanJson) as Array<{ index: number; score: number }>;
                
                // Assign scores back
                // Set all scores to 0 first to prevent mixing 0-1 cosine similarity scores with 0-10 LLM scores
                for (const item of finalResults) {
                    item.score = 0;
                }

                for (const scoreObj of scoresList) {
                    if (finalResults[scoreObj.index]) {
                        finalResults[scoreObj.index]!.score = scoreObj.score;
                    }
                }
                
                // Sort by rerank score descending
                finalResults.sort((a, b) => b.score - a.score);
                
            } catch (err) {
                console.error("[Retrieval] LLM reranking failed, keeping vector search similarity order:", err);
                finalResults.sort((a, b) => b.score - a.score);
            }
        }

        // Return top results up to limit
        return finalResults.slice(0, limit);
    }
}
