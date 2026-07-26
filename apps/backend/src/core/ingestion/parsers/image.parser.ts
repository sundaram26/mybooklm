import fs from "fs/promises";
import path from "path";
import type { IDocumentParser, ParsedDocument, ParsedChunk } from "./parser.interface";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { env } from "../../../config/env.config";

export class ImageParser implements IDocumentParser {
    
    private getMimeType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
            case ".png": return "image/png";
            case ".webp": return "image/webp";
            case ".gif": return "image/gif";
            default: return "image/jpeg";
        }
    }

    async parse(source: string | Buffer): Promise<ParsedDocument> {
        const buffer = typeof source === "string" ? await fs.readFile(source) : source;
        const mimeType = typeof source === "string" ? this.getMimeType(source) : "image/jpeg";
        const base64Image = buffer.toString("base64");
        
        let description = "";
        
        // Prioritize Gemini, fallback to OpenAI
        if (env.GEMINI_API_KEY && !env.GEMINI_API_KEY.includes("sample-gemini")) {
            const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent([
                "Provide a highly detailed transcription and description of all text, charts, diagrams, and visual content in this image. Output in clean markdown format.",
                {
                    inlineData: {
                        data: base64Image,
                        mimeType
                    }
                }
            ]);
            description = result.response.text();
        } else if (env.OPENAI_API_KEY && !env.OPENAI_API_KEY.includes("sample-openai")) {
            const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Provide a highly detailed transcription and description of all text, charts, diagrams, and visual content in this image. Output in clean markdown format." },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ]
            });
            description = response.choices[0]?.message?.content || "";
        } else {
            throw new Error("No Gemini or OpenAI API Key configured for Image Vision processing.");
        }

        const rawText = `[Image Content Description]\n\n${description}`;
        
        // Since images are describing visual elements, they are usually treated as a singular chunk of text
        const chunks: ParsedChunk[] = [{
            text: description,
            metadata: {
                isImage: true,
                imageMimeType: mimeType
            }
        }];

        return { rawText, chunks };
    }
}
