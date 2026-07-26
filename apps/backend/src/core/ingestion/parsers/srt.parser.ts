import fs from "fs/promises";
import type { IDocumentParser, ParsedDocument, ParsedChunk } from "./parser.interface";

export class SrtParser implements IDocumentParser {
    
    private parseTimestampToSeconds(ts: string): number {
        // Handle both SRT "00:01:20,450" and VTT "00:01:20.450"
        const clean = ts.replace(",", ".").trim();
        const parts = clean.split(":");
        if (parts.length < 3) return 0;
        
        const hrs = parseFloat(parts[0] || "0");
        const mins = parseFloat(parts[1] || "0");
        const secs = parseFloat(parts[2] || "0");
        
        return (hrs * 3600) + (mins * 60) + secs;
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
        
        const timeRegex = /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]!.trim();
            if (!line) continue;
            
            // Check if line represents timestamps
            const match = line.match(timeRegex);
            if (match) {
                const start = this.parseTimestampToSeconds(match[1]!);
                const end = this.parseTimestampToSeconds(match[2]!);
                lastTimestamp = start;
                
                // Read following subtitle content lines
                let subtext = "";
                while (i + 1 < lines.length) {
                    const nextLine = lines[i + 1]!.trim();
                    // If next line is a timestamp line or simple counter line, stop reading for this segment
                    if (timeRegex.test(nextLine) || /^\d+$/.test(nextLine)) {
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
        
        if (currentChunkText) {
            allChunks.push({
                text: currentChunkText.trim(),
                metadata: {
                    startTimestamp: Math.round(currentChunkStart),
                    endTimestamp: Math.round(lastTimestamp)
                }
            });
        }
        
        return {
            rawText: totalRawText,
            chunks: allChunks
        };
    }
}
