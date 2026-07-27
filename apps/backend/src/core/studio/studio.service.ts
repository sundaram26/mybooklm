import fs from "fs";
import path from "path";
import { prisma } from "../../infrastructure/db/prisma";
import { DocumentService } from "../ingestion/document.service";
import { ProviderFactory } from "../../infrastructure/llm/providers/provider.factory";
import { SUPPORTED_MODELS } from "../../config/models";
import { env } from "../../config/env.config";
import { LLMManager } from "../../infrastructure/llm/llm-manager";
import type { LLMConfig } from "../../infrastructure/llm/llm-manager";

export interface StudioOptions {
    llmSettings?: LLMConfig | undefined;
}

const FEATURE_TITLES: Record<string, string> = {
    "audio-overview": "Audio Overview Script",
    "slide-deck": "Slide Deck Outline",
    "video-overview": "Video Overview Storyboard",
    "mind-map": "Mind Map Outline",
    "reports": "Briefing Report",
    "flashcards": "Study Flashcards",
    "quiz": "Workspace Quiz",
    "infographic": "Infographic Plan",
    "data-table": "Extracted Data Table"
};

export class StudioService {
    
    private static getLLM(settings?: LLMConfig) {
        return LLMManager.getLLM(settings, "high");
    }

    static async generateStudioOutput(
        notebookId: string,
        feature: string,
        options: StudioOptions = {}
    ) {
        const title = FEATURE_TITLES[feature];
        if (!title) {
            throw new Error(`Unsupported studio feature: ${feature}`);
        }

        // 1. Fetch all documents for this notebook that have been successfully parsed
        const documents = await prisma.notebookDocument.findMany({
            where: {
                notebookId,
                status: "COMPLETED"
            }
        });

        if (documents.length === 0) {
            throw new Error("No source documents are uploaded or ready in this notebook yet. Please upload files to start.");
        }

        // 2. Aggregate the contents of all documents as context
        const context = documents.map((doc, idx) => {
            const docTitle = (doc.metadata as any)?.title || (doc.metadata as any)?.originalName || `Document ${idx + 1}`;
            return `--- START OF DOCUMENT [${idx + 1}]: ${docTitle} ---\n${doc.content || ""}\n--- END OF DOCUMENT [${idx + 1}]: ${docTitle} ---`;
        }).join("\n\n");

        // 3. Read prompt content from .md file
        const promptFilePath = path.join(process.cwd(), "src/prompts/studio", `${feature}.md`);
        if (!fs.existsSync(promptFilePath)) {
            throw new Error(`Prompt template for ${feature} not found on server.`);
        }
        const systemPrompt = fs.readFileSync(promptFilePath, "utf-8");

        // 4. Instantiate LLM provider
        const llm = this.getLLM(options.llmSettings);
        
        // 5. Build prompt payload
        const userPrompt = `The following is the aggregated context from the documents in the workspace. Please generate the corresponding ${title} following the styling and output rules provided:\n\n${context}`;
        const messages = [
            { role: "system" as const, content: systemPrompt },
            { role: "user" as const, content: userPrompt }
        ];

        console.log(`[Studio] Generating ${feature} using LLM ${llm.modelId} for notebook ${notebookId}`);
        const generatedText = await llm.provider.generateText(llm.modelId, messages);

        // 6. Save generated output back to DB as a text document so it appears in the source list
        console.log(`[Studio] Saving generated ${feature} as text document in database`);
        const savedDoc = await DocumentService.createTextDocument(notebookId, generatedText, title);

        return savedDoc;
    }
}
