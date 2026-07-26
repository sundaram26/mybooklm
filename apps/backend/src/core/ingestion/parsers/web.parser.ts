import * as cheerio from "cheerio";
import type { IDocumentParser, ParsedDocument, ParsedChunk } from "./parser.interface";
import { RecursiveCharacterTextSplitter } from "../chunking/text-splitter";

export class WebParser implements IDocumentParser {
    async parse(source: string): Promise<ParsedDocument> {
        const response = await fetch(source, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch website at ${source}: ${response.statusText}`);
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Strip out noise tags (scripts, styles, headers, footers, etc.)
        $("script, style, iframe, nav, footer, header, noscript, svg, link").remove();
        
        const textSegments: string[] = [];
        $("h1, h2, h3, h4, h5, h6, p, li, article, td").each((_, element) => {
            const txt = $(element).text().replace(/\s+/g, " ").trim();
            if (txt && txt.length > 5) {
                textSegments.push(txt);
            }
        });
        
        const rawText = textSegments.join("\n\n");
        if (!rawText.trim()) {
            throw new Error("No readable text found on the website.");
        }
        
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
        const textChunks = await splitter.splitText(rawText);
        
        const chunks: ParsedChunk[] = textChunks.map(text => ({
            text,
            metadata: {
                sourceUrl: source
            }
        }));
        
        return { rawText, chunks };
    }
}
