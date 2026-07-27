export interface ParsedChunk {
    text: string;
    metadata: Record<string, any>;
}

export interface ParsedDocument {
    rawText: string;
    chunks: ParsedChunk[];
    metadata?: Record<string, any>;
}

export interface IDocumentParser {
    /**
     * Parses the document from a local file path or buffer and returns clean text and chunks with metadata.
     * @param source File path or buffer to read from
     * @param options Custom arguments (e.g. video IDs, mimeTypes)
     */
    parse(source: string | Buffer, options?: Record<string, any>): Promise<ParsedDocument>;
}
