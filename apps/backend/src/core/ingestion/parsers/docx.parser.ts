import * as mammothModule from "mammoth";
import fs from "fs/promises";
import type { IDocumentParser, ParsedDocument, ParsedChunk } from "./parser.interface";

const mammoth = (mammothModule as any).default || mammothModule;
import { RecursiveCharacterTextSplitter } from "../chunking/text-splitter";

export class DocxParser implements IDocumentParser {
    async parse(source: string | Buffer): Promise<ParsedDocument> {
        const buffer = typeof source === "string" ? await fs.readFile(source) : source;
        
        const result = await mammoth.extractRawText({ buffer });
        const rawText = result.value;

        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
        const textChunks = await splitter.splitText(rawText);

        const chunks: ParsedChunk[] = textChunks.map(text => ({
            text,
            metadata: {}
        }));

        return { rawText, chunks };
    }
}
