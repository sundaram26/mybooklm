import type { IDocumentParser, ParsedDocument } from "./parser.interface";
import { PDFParser } from "./pdf.parser";
import { DocxParser } from "./docx.parser";
import { YoutubeParser } from "./youtube.parser";
import { WebParser } from "./web.parser";
import { SrtParser } from "./srt.parser";
import { ImageParser } from "./image.parser";
import { RecursiveCharacterTextSplitter } from "../chunking/text-splitter";
import path from "path";
import fs from "fs/promises";

export class PlainTextFileParser implements IDocumentParser {
    async parse(source: string | Buffer): Promise<ParsedDocument> {
        const text = typeof source === "string" ? await fs.readFile(source, "utf-8") : source.toString("utf-8");
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
        const textChunks = await splitter.splitText(text);
        return {
            rawText: text,
            chunks: textChunks.map(c => ({ text: c, metadata: {} }))
        };
    }
}

export class ParserFactory {
    static getParser(type: "LINK" | "FILE" | "TEXT" | "IMAGE", source: string, mimeType?: string): IDocumentParser {
        if (type === "LINK") {
            if (source.includes("youtube.com") || source.includes("youtu.be")) {
                return new YoutubeParser();
            }
            return new WebParser();
        }
        
        if (type === "IMAGE") {
            return new ImageParser();
        }

        if (type === "FILE") {
            const ext = path.extname(source).toLowerCase();
            if (ext === ".pdf" || mimeType === "application/pdf") {
                return new PDFParser();
            }
            if (ext === ".docx" || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                return new DocxParser();
            }
            if (ext === ".srt" || ext === ".vtt" || mimeType === "text/srt" || mimeType === "text/vtt") {
                return new SrtParser();
            }
            if (ext === ".txt" || ext === ".md" || ext === ".csv" || mimeType === "text/plain") {
                return new PlainTextFileParser();
            }
            
            // Plain text files fallback
            return new PlainTextFileParser();
        }

        // TEXT type parser with chunking
        return {
            parse: async (src) => {
                const text = typeof src === "string" ? src : src.toString("utf-8");
                const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
                const textChunks = await splitter.splitText(text);
                return {
                    rawText: text,
                    chunks: textChunks.map(c => ({ text: c, metadata: {} }))
                };
            }
        };
    }
}
