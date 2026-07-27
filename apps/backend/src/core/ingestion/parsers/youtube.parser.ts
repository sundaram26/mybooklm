import { YoutubeTranscript } from "youtube-transcript";
import type { IDocumentParser, ParsedDocument, ParsedChunk } from "./parser.interface";

export class YoutubeParser implements IDocumentParser {
    
    extractVideoId(url: string): string | null {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2]?.length === 11) ? match[2] : null;
    }

    extractPlaylistId(url: string): string | null {
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

    async getPlaylistDetails(url: string): Promise<{ videoIds: string[], title: string }> {
        const playlistId = this.extractPlaylistId(url);
        if (!playlistId) throw new Error("Invalid playlist URL");

        const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
        try {
            const response = await fetch(playlistUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
            });
            const html = await response.text();
            
            const videoIds = new Set<string>();
            const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
            let match;
            while ((match = regex.exec(html)) !== null) {
                if (match[1]) videoIds.add(match[1]);
            }

            const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/);
            const title = titleMatch ? titleMatch[1] : `YouTube Playlist (${playlistId})`;

            return { videoIds: Array.from(videoIds), title: title || `YouTube Playlist (${playlistId})` };
        } catch (error) {
            console.error(`Failed to fetch playlist details:`, error);
            return { videoIds: [], title: `YouTube Playlist (${playlistId})` };
        }
    }

    async getVideoTitle(videoId: string): Promise<string> {
        try {
            const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
            });
            const html = await response.text();
            const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/);
            return titleMatch ? titleMatch[1]! : `YouTube Video (${videoId})`;
        } catch (error) {
            return `YouTube Video (${videoId})`;
        }
    }

    async parse(source: string, options?: Record<string, any>): Promise<ParsedDocument> {
        const onProgress = options?.onProgress as ((progress: number, message: string) => void) | undefined;
        const reportProgress = (progress: number, message: string) => {
            if (onProgress) {
                try { onProgress(progress, message); } catch (e) { /* ignore */ }
            }
        };

        const playlistId = this.extractPlaylistId(source);
        let videoIds: string[] = [];

        if (playlistId) {
            // Note: Since we are exploding playlists in IngestionProcessor, this block shouldn't ideally be hit for playlists anymore.
            // But we keep it for backward compatibility or direct calls.
            reportProgress(5, `Extracting videos from YouTube playlist...`);
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
        const totalVideos = videoIds.length;

        for (let idx = 0; idx < totalVideos; idx++) {
            const videoId = videoIds[idx]!;
            try {
                const progressPct = Math.round(10 + (idx / totalVideos) * 70); // 10% to 80% for fetching transcripts
                reportProgress(progressPct, `Fetching transcript for video ${idx + 1} of ${totalVideos}...`);
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
        
        let parsedTitle = "";
        if (totalVideos === 1) {
            parsedTitle = await this.getVideoTitle(videoIds[0]!);
        }
        
        reportProgress(85, "Finished fetching transcripts.");

        return {
            rawText: totalRawText,
            chunks: allChunks,
            metadata: {
                title: parsedTitle || undefined
            }
        };
    }
}
