import * as pdfModule from "pdf-parse";
import fs from "fs/promises";
import type { IDocumentParser, ParsedDocument, ParsedChunk } from "./parser.interface";

const pdf = (pdfModule as any).default || pdfModule;
import { RecursiveCharacterTextSplitter } from "../chunking/text-splitter";

export class PDFParser implements IDocumentParser {
    async parse(source: string | Buffer): Promise<ParsedDocument> {
        const buffer = typeof source === "string" ? await fs.readFile(source) : source;
        const pageTexts: string[] = [];

        // pdf-parse callback to capture page-by-page text
        const renderPage = (pageData: any) => {
            return pageData.getTextContent().then((textContent: any) => {
                let lastY, text = "";
                for (const item of textContent.items) {
                    if (lastY === undefined || lastY === item.transform[5]) {
                        text += item.str;
                    } else {
                        text += "\n" + item.str;
                    }
                    lastY = item.transform[5];
                }
                pageTexts[pageData.pageIndex] = text;
                return text;
            });
        };

        const data = await pdf(buffer, { pagerender: renderPage });
        const rawText = data.text;

        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
        const chunks: ParsedChunk[] = [];

        // Split text page-by-page to record page number metadata
        const totalPages = pageTexts.length;
        for (let i = 0; i < totalPages; i++) {
            const pageText = pageTexts[i];
            if (!pageText || !pageText.trim()) continue;

            const pageNum = i + 1;
            const pageSplitChunks = await splitter.splitText(pageText);

            for (const chunkText of pageSplitChunks) {
                chunks.push({
                    text: chunkText,
                    metadata: {
                        pageNumber: pageNum,
                        totalPages: totalPages
                    }
                });
            }
        }

        // Fallback if page rendering did not return text but pdf-parse did
        if (chunks.length === 0 && rawText.trim()) {
            const allChunks = await splitter.splitText(rawText);
            for (const chunkText of allChunks) {
                chunks.push({
                    text: chunkText,
                    metadata: {
                        pageNumber: 1,
                        totalPages: 1
                    }
                });
            }
        }

        return { rawText, chunks };
    }
}
