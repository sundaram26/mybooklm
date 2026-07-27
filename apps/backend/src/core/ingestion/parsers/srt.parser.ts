import fs from "fs/promises";
import type { IDocumentParser, ParsedDocument, ParsedChunk } from "./parser.interface";

export class SrtParser implements IDocumentParser {
    
    private parseTimestampToSeconds(ts: string): number {
        // Strip out styling attributes or positioning info from WebVTT timestamp tokens
        // e.g. "00:01:20.450 align:start line:0%" -> "00:01:20.450"
        const cleanTs = ts.split(/\s+/)[0] || "";
        const clean = cleanTs.replace(",", ".").trim();
        const parts = clean.split(":");
        if (parts.length === 2) {
            const mins = parseFloat(parts[0] || "0");
            const secs = parseFloat(parts[1] || "0");
            return (mins * 60) + secs;
        } else if (parts.length === 3) {
            const hrs = parseFloat(parts[0] || "0");
            const mins = parseFloat(parts[1] || "0");
            const secs = parseFloat(parts[2] || "0");
            return (hrs * 3600) + (mins * 60) + secs;
        }
        return 0;
    }

    async parse(source: string | Buffer): Promise<ParsedDocument> {
        let contentStr = "";
        
        if (typeof source === "string") {
            try {
                // Try reading file if source is a path, otherwise use it directly as content
                contentStr = await fs.readFile(source, "utf-8");
            } catch {
                contentStr = source;
            }
        } else {
            contentStr = source.toString("utf-8");
        }
            
        const lines = contentStr.split(/\r?\n/);
        const allChunks: ParsedChunk[] = [];
        let totalRawText = "";
        
        let currentChunkText = "";
        let currentChunkStart = 0;
        let lastTimestamp = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]!.trim();
            if (!line) continue;
            
            // Check if line represents timestamps
            if (line.includes("-->")) {
                const parts = line.split("-->").map(p => p.trim());
                if (parts.length >= 2) {
                    const start = this.parseTimestampToSeconds(parts[0]!);
                    const end = this.parseTimestampToSeconds(parts[1]!);
                    lastTimestamp = start;
                    
                    // Read following subtitle content lines
                    let subtext = "";
                    while (i + 1 < lines.length) {
                        const nextLine = lines[i + 1]!.trim();
                        // Stop if next line contains "-->" or is a simple numeric index line
                        if (nextLine.includes("-->") || /^\d+$/.test(nextLine)) {
                            break;
                        }
                        if (nextLine) {
                            subtext += (subtext ? " " : "") + nextLine;
                        }
                        i++;
                    }
                    
                    if (subtext) {
                        totalRawText += (totalRawText ? " " : "") + subtext;
                        
                        if (currentChunkText.length + subtext.length > 800) {
                            allChunks.push({
                                text: currentChunkText.trim(),
                                metadata: {
                                    startTimestamp: Math.round(currentChunkStart),
                                    endTimestamp: Math.round(lastTimestamp)
                                }
                            });
                            currentChunkText = subtext;
                            currentChunkStart = start;
                        } else {
                            if (!currentChunkText) {
                                currentChunkStart = start;
                            }
                            currentChunkText += (currentChunkText ? " " : "") + subtext;
                        }
                    }
                }
            }
        }
        
        if (currentChunkText) {
            allChunks.push({
                text: currentChunkText.trim(),
                metadata: {
                    startTimestamp: Math.round(currentChunkStart),
                    endTimestamp: Math.round(lastTimestamp)
                }
            });
        }

        // Fallback for files that don't have standard subtitles timestamps but were named .srt/.vtt
        if (allChunks.length === 0 && totalRawText === "") {
            console.warn("SrtParser failed to find any --> timestamps. Falling back to plain text chunking.");
            // Filter out any numeric lines at the beginning of sections if we want, or just chunk the entire text
            const fullText = lines.filter(l => !/^\d+$/.test(l.trim())).join("\n").trim();
            if (fullText) {
                const splitter = new (await import("../chunking/text-splitter")).RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
                const textChunks = await splitter.splitText(fullText);
                return {
                    rawText: fullText,
                    chunks: textChunks.map((c: string) => ({ text: c, metadata: {} }))
                };
            }
        }
        
        return {
            rawText: totalRawText,
            chunks: allChunks
        };
    }
}
