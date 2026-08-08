import fs from "fs";
import path from "path";
import { prisma } from "../../infrastructure/db/prisma";
import { DocumentService } from "../ingestion/document.service";
import { ProviderFactory } from "../../infrastructure/llm/providers/provider.factory";
import { SUPPORTED_MODELS } from "../../config/models";
import { env } from "../../config/env.config";
import { LLMManager } from "../../infrastructure/llm/llm-manager";
import { RetrievalService } from "../retrieval/retrieval.service";

export interface StudioOptions {
    customParams?: Record<string, any> | undefined;
    selectedModelId?: string;
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
    
    private static getLLM(selectedModelId?: string) {
        return LLMManager.getLLM("high", selectedModelId);
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

        // 1. Fetch all documents for this notebook that have been successfully parsed to ensure there's content
        const documentCount = await prisma.notebookDocument.count({
            where: {
                notebookId,
                status: "COMPLETED"
            }
        });

        if (documentCount === 0) {
            throw new Error("No source documents are uploaded or ready in this notebook yet. Please upload files to start.");
        }

        // 2. Fetch the top 20 most relevant chunks for this feature
        // This avoids token limit errors (429 Request too large) on massive workspaces
        const customParams = options.customParams || {};
        const queryTopic = customParams.topic || customParams.focus || title;

        console.log(`[Studio] Retrieving top chunks for feature: ${title} using search query: ${queryTopic}`);
        const chunks = await RetrievalService.retrieve(notebookId, queryTopic, { limit: 20, useHyde: true });
        
        let context = "";
        if (chunks.length > 0) {
            context = chunks.map((chunk: any, idx: number) => {
                const docTitle = chunk.metadata?.title || chunk.metadata?.originalName || chunk.metadata?.sourceUrl || `Source ${idx + 1}`;
                return `--- START OF EXCERPT [${idx + 1}]: ${docTitle} ---\n${chunk.text}\n--- END OF EXCERPT [${idx + 1}] ---`;
            }).join("\n\n");
        } else {
            context = "No relevant text chunks could be found in the workspace for this feature.";
        }

        // 3. Read prompt content from .md file
        const promptFilePath = path.join(process.cwd(), "src/prompts/studio", `${feature}.md`);
        if (!fs.existsSync(promptFilePath)) {
            throw new Error(`Prompt template for ${feature} not found on server.`);
        }
        const systemPrompt = fs.readFileSync(promptFilePath, "utf-8");

        const jsonInstructions: Record<string, string> = {
            "quiz": `You MUST return the output ONLY as a valid JSON object matching the following structure. Generate at least 10 structured questions. Do not wrap in markdown blocks, do not return any other text:
{
  "type": "quiz",
  "title": "${title}",
  "questions": [
    {
      "id": 1,
      "type": "multiple-choice", // or "true-false" or "short-answer"
      "question": "Question text...",
      "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"], // For true-false: ["True", "False"]. Absent for short-answer.
      "correctAnswer": "A", // "True", "False", or exact phrase for short-answer
      "explanation": "Explanation..."
    }
  ]
}`,
            "flashcards": `You MUST return the output ONLY as a valid JSON object matching the following structure. Generate at least 10 cards. Do not wrap in markdown blocks, do not return any other text:
{
  "type": "flashcards",
  "title": "${title}",
  "cards": [
    { "front": "Concept...", "back": "Definition..." }
  ]
}`,
            "reports": `You MUST return the output ONLY as a valid JSON object matching the following structure. Do not wrap in markdown blocks, do not return any other text:
{
  "type": "reports",
  "title": "${title}",
  "sections": [
    { "heading": "Heading...", "content": "Markdown formatted section content..." }
  ]
}`,
            "audio-overview": `You MUST return the output ONLY as a valid JSON object matching the following structure. Do not wrap in markdown blocks, do not return any other text:
{
  "type": "audio-overview",
  "title": "${title}",
  "hosts": ["Host A", "Host B"],
  "transcript": [
    { "speaker": "Host A", "text": "Script..." }
  ]
}`,
            "slide-deck": `You MUST return the output ONLY as a valid JSON object matching the following structure. Do not wrap in markdown blocks, do not return any other text:
{
  "type": "slide-deck",
  "title": "${title}",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "bulletPoints": ["Point 1", "Point 2"],
      "notes": "Speaker notes..."
    }
  ]
}`,
            "video-overview": `You MUST return the output ONLY as a valid JSON object matching the following structure. Do not wrap in markdown blocks, do not return any other text:
{
  "type": "video-overview",
  "title": "${title}",
  "scenes": [
    { "sceneNumber": 1, "visual": "Visual description...", "audio": "Voiceover/Audio..." }
  ]
}`,
            "mind-map": `You MUST return the output ONLY as a valid JSON object matching the following structure. Do not wrap in markdown blocks, do not return any other text:
{
  "type": "mind-map",
  "title": "${title}",
  "nodes": [
    { "id": "1", "label": "Main Topic" },
    { "id": "2", "label": "Subtopic A", "parentId": "1" }
  ]
}`,
            "infographic": `You MUST return the output ONLY as a valid JSON object matching the following structure. Do not wrap in markdown blocks, do not return any other text:
{
  "type": "infographic",
  "title": "${title}",
  "sections": [
    { "title": "Section Title", "dataPoint": "Stat or Key Fact", "visualIdea": "Icon/illustration idea" }
  ]
}`,
            "data-table": `You MUST return the output ONLY as a valid JSON object matching the following structure. Do not wrap in markdown blocks, do not return any other text:
{
  "type": "data-table",
  "title": "${title}",
  "headers": ["Header 1", "Header 2"],
  "rows": [
    ["Val 1", "Val 2"]
  ]
}`
        };

        // 4. Instantiate LLM provider
        const llm = this.getLLM(options.selectedModelId);
        
        // Build Customization instructions
        let customInstruction = "";
        
        if (feature === "quiz") {
            const numQ = customParams.numQuestions === "fewer" ? "5" : (customParams.numQuestions === "more" ? "15" : "10");
            const diff = customParams.difficulty || "medium";
            const topic = customParams.topic || "";
            customInstruction = `\n\nCustomization requirements:\n- Number of questions: Generate exactly ${numQ} questions.\n- Level of difficulty: ${diff}.\n${topic ? `- Focus topic: The quiz must focus specifically on: "${topic}"` : ""}`;
        } else if (feature === "audio-overview") {
            const format = customParams.format || "deep-dive";
            const lang = customParams.language || "english";
            const length = customParams.length || "default";
            const focus = customParams.focus || "";
            customInstruction = `\n\nCustomization requirements:\n- Format: Generate in the style of a "${format}" (Deep Dive: conversation unpacking/connecting ideas, Brief: bite-sized summary, Critique: expert review with feedback, Debate: debate highlighting different perspectives).\n- Language: The entire overview must be written in the "${lang}" language.\n- Length: ${length === "short" ? "Short (brief transcript)" : (length === "long" ? "Long (detailed transcript)" : "Standard length")}.\n${focus ? `- Focus: The hosts should focus specifically on: "${focus}"` : ""}`;
        } else if (customParams.topic) {
            customInstruction = `\n\nCustomization requirements:\n- Focus topic: Focus specifically on: "${customParams.topic}"`;
        }

        // 5. Build prompt payload
        const userPrompt = `The following is the aggregated context from the documents in the workspace. Please generate the corresponding ${title}.${customInstruction}\n\nOutput Format Rules:\n${jsonInstructions[feature] || ""}\n\nContext:\n${context}`;
        const messages = [
            { role: "system" as const, content: systemPrompt },
            { role: "user" as const, content: userPrompt }
        ];

        console.log(`[Studio] Generating ${feature} using LLM ${llm.modelId} for notebook ${notebookId}`);
        const generatedText = await llm.provider.generateText(llm.modelId, messages);

        // Parse and validate JSON
        let parsedData: any = null;
        try {
            const cleanJson = generatedText
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
            parsedData = JSON.parse(cleanJson);
        } catch (e) {
            console.error("[Studio] Failed to parse generated text as JSON. Storing as fallback markdown object.", e);
            parsedData = {
                type: feature,
                title,
                rawMarkdown: generatedText
            };
        }

        // 6. Save generated output back to DB as a text document so it appears in the source list
        console.log(`[Studio] Saving generated ${feature} as text document in database`);
        const savedDoc = await DocumentService.createTextDocument(
            notebookId, 
            JSON.stringify(parsedData), 
            title,
            { studioFeature: feature }
        );

        return savedDoc;
    }
}
