export interface SplitOptions {
    chunkSize?: number;
    chunkOverlap?: number;
    separators?: string[];
}

export class RecursiveCharacterTextSplitter {
    private chunkSize: number;
    private chunkOverlap: number;
    private separators: string[];

    constructor(options: SplitOptions = {}) {
        this.chunkSize = options.chunkSize ?? 1000;
        this.chunkOverlap = options.chunkOverlap ?? 200;
        this.separators = options.separators ?? ["\n\n", "\n", " ", ""];
    }

    async splitText(text: string): Promise<string[]> {
        return this.split(text, this.separators);
    }

    private split(text: string, separators: string[]): string[] {
        if (text.length <= this.chunkSize) {
            return [text];
        }

        let separator = separators[separators.length - 1]!;
        let indexOfSeparator = separators.length - 1;
        
        for (let i = 0; i < separators.length; i++) {
            if (text.includes(separators[i]!)) {
                separator = separators[i]!;
                indexOfSeparator = i;
                break;
            }
        }

        const splits = text.split(separator);
        const finalChunks: string[] = [];
        let currentChunk = "";

        for (const split of splits) {
            if ((currentChunk + (currentChunk ? separator : "") + split).length <= this.chunkSize) {
                currentChunk += (currentChunk ? separator : "") + split;
            } else {
                if (currentChunk) {
                    finalChunks.push(currentChunk);
                }
                
                if (split.length > this.chunkSize) {
                    const subChunks = this.split(split, separators.slice(indexOfSeparator + 1));
                    finalChunks.push(...subChunks);
                    currentChunk = "";
                } else {
                    currentChunk = split;
                }
            }
        }

        if (currentChunk) {
            finalChunks.push(currentChunk);
        }

        return this.mergeWithOverlap(finalChunks);
    }

    private mergeWithOverlap(chunks: string[]): string[] {
        if (chunks.length <= 1) return chunks;
        
        const merged: string[] = [];
        let currentMerged = chunks[0]!;

        for (let i = 1; i < chunks.length; i++) {
            const next = chunks[i]!;
            
            if (currentMerged.length + next.length < this.chunkSize) {
                currentMerged += " " + next;
            } else {
                merged.push(currentMerged);
                
                // Construct overlap from the end of the current chunk
                const overlapStart = Math.max(0, currentMerged.length - this.chunkOverlap);
                const overlapText = currentMerged.substring(overlapStart);
                
                currentMerged = (overlapText + " " + next).substring(0, this.chunkSize);
            }
        }
        
        if (currentMerged) {
            merged.push(currentMerged);
        }
        
        return merged;
    }
}
