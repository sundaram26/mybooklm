import { YoutubeTranscript } from "youtube-transcript";
import type { IDocumentParser, ParsedDocument, ParsedChunk } from "./parser.interface";

export class YoutubeParser implements IDocumentParser {
    
    private extractVideoId(url: string): string | null {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2]?.length === 11) ? match[2] : null;
    }

    private extractPlaylistId(url: string): string | null {
        const regExp = /[?&]list=([^#\&\?]+)/;
        const match = url.match(regExp);
        return match ? match[1] || null : null;
    }

    private async getVideoIdsFromPlaylist(playlistId: string): Promise<string[]> {
        const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
        try {
            const response = await fetch(playlistUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
            });
            const html = await response.text();
            
            const videoIds = new Set<string>();
            // Youtube embeds videoIds in the page source inside JSON structures: "videoId":"XXXXXXXXXXX"
            const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
            let match;
            while ((match = regex.exec(html)) !== null) {
                if (match[1]) {
                    videoIds.add(match[1]);
                }
            }
            return Array.from(videoIds);
        } catch (error) {
            console.error(`Failed to extract videos from playlist ${playlistId}:`, error);
            return [];
        }
    }

    async parse(source: string): Promise<ParsedDocument> {
        const playlistId = this.extractPlaylistId(source);
        let videoIds: string[] = [];

        if (playlistId) {
            console.log(`Processing YouTube playlist ID: ${playlistId}`);
            videoIds = await this.getVideoIdsFromPlaylist(playlistId);
        } else {
            const videoId = this.extractVideoId(source);
            if (videoId) {
                videoIds = [videoId];
            }
        }

        if (videoIds.length === 0) {
            throw new Error(`Could not extract any valid YouTube video ID from URL: ${source}`);
        }

        let totalRawText = "";
        const allChunks: ParsedChunk[] = [];

        for (const videoId of videoIds) {
            try {
                console.log(`Fetching transcript for YouTube video: ${videoId}`);
                const transcript = await YoutubeTranscript.fetchTranscript(videoId);
                
                if (!transcript || transcript.length === 0) {
                    continue;
                }

                let currentChunkText = "";
                let startTimestamp = transcript[0]!.offset / 1000; // standardise to seconds
                
                for (let i = 0; i < transcript.length; i++) {
                    const item = transcript[i]!;
                    const text = item.text.replace(/&amp;#39;/g, "'").replace(/&amp;quot;/g, '"');
                    
                    if (currentChunkText.length + text.length > 800) {
                        allChunks.push({
                            text: currentChunkText.trim(),
                            metadata: {
                                videoId,
                                startTimestamp: Math.round(startTimestamp),
                                sourceUrl: `https://www.youtube.com/watch?v=${videoId}&t=${Math.round(startTimestamp)}s`
                            }
                        });
                        currentChunkText = text;
                        startTimestamp = item.offset / 1000;
                    } else {
                        currentChunkText += (currentChunkText ? " " : "") + text;
                    }
                }

                if (currentChunkText) {
                    allChunks.push({
                        text: currentChunkText.trim(),
                        metadata: {
                            videoId,
                            startTimestamp: Math.round(startTimestamp),
                            sourceUrl: `https://www.youtube.com/watch?v=${videoId}&t=${Math.round(startTimestamp)}s`
                        }
                    });
                }

                const fullVideoText = transcript.map(t => t.text).join(" ");
                totalRawText += (totalRawText ? "\n\n" : "") + `[Video ID: ${videoId}]\n` + fullVideoText;

            } catch (error) {
                console.error(`Error processing video transcript for ID ${videoId}:`, error);
            }
        }

        if (allChunks.length === 0) {
            throw new Error(`Failed to load transcripts for YouTube URL: ${source}`);
        }

        return {
            rawText: totalRawText,
            chunks: allChunks
        };
    }
}
