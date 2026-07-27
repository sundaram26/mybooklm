import { prisma } from "../../infrastructure/db/prisma";
import { FileStorageFactory } from "../../infrastructure/file_storage/file-storage.factory";
import { ParserFactory } from "./parsers/parser.factory";
import { EmbeddingService } from "../embedding/embedding.service";
import { QdrantDatabase } from "../../infrastructure/vector_db/qdrant.database";
import cryptoModule from "crypto";
import { Worker } from "bullmq";
import { ingestionQueue, redisConnection } from "./queue";
import { YoutubeParser } from "./parsers/youtube.parser";
import { DocumentType } from "../../../generated/prisma/client";

export class IngestionProcessor {
    private static qdrant = new QdrantDatabase();
    private static COLLECTION_NAME = "notebook_chunks";

    /**
     * Queues a document for background ingestion.
     */
    static async queueIngestion(documentId: string): Promise<void> {
        console.log(`[Ingestion] Enqueuing document ${documentId} in BullMQ`);
        await ingestionQueue.add("ingest", { documentId });
    }

    /**
     * Scans for any documents that got stuck in PENDING or PROCESSING states (e.g. server crash)
     * and queues them again. Triggered at app startup.
     */
    static async recoverQueue(): Promise<void> {
        try {
            console.log("[Ingestion] Scanning for stuck or pending ingestion tasks...");
            const stuckDocs = await prisma.notebookDocument.findMany({
                where: {
                    status: {
                        in: ["PENDING", "PROCESSING"]
                    }
                },
                select: { id: true }
            });

            if (stuckDocs.length > 0) {
                console.log(`[Ingestion] Found ${stuckDocs.length} documents to recover.`);
                for (const doc of stuckDocs) {
                    await this.queueIngestion(doc.id);
                }
            } else {
                console.log("[Ingestion] No stuck documents found.");
            }
        } catch (error) {
            console.error("[Ingestion] Failed to recover queue:", error);
        }
    }

    static async processDocument(documentId: string): Promise<void> {
        try {
            console.log(`[Ingestion] Starting ingestion for document: ${documentId}`);
            
            // 1. Fetch document from database
            const document = await prisma.notebookDocument.findUnique({
                where: { id: documentId }
            });

            const reportProgress = async (progress: number, message: string) => {
                try {
                    const currentDoc = await prisma.notebookDocument.findUnique({
                        where: { id: documentId },
                        select: { metadata: true }
                    });
                    if (currentDoc) {
                        const meta = (currentDoc.metadata as Record<string, any>) || {};
                        await prisma.notebookDocument.update({
                            where: { id: documentId },
                            data: {
                                metadata: {
                                    ...meta,
                                    progress,
                                    progressMessage: message
                                }
                            }
                        });
                    }
                } catch (e) {
                    console.error("[Ingestion] Failed to update progress:", e);
                }
            };

            if (!document) {
                console.error(`[Ingestion] Document ${documentId} not found in database.`);
                return;
            }

            // Update status to PROCESSING
            await prisma.notebookDocument.update({
                where: { id: documentId },
                data: { status: "PROCESSING" }
            });

            // 2. Intercept YouTube playlists and explode them into individual documents
            if (document.type === "LINK" && (document.metadata as any)?.provider === "youtube-playlist") {
                await reportProgress(10, "Fetching playlist details...");
                
                const ytParser = new YoutubeParser();
                if (!document.url) throw new Error("No URL found for playlist");
                
                const { videoIds, title } = await ytParser.getPlaylistDetails(document.url);
                await reportProgress(30, `Found ${videoIds.length} videos. Creating documents...`);
                
                for (let i = 0; i < videoIds.length; i++) {
                    const vid = videoIds[i]!;
                    await reportProgress(30 + Math.round((i/videoIds.length)*60), `Queueing video ${i+1}/${videoIds.length}...`);
                    
                    const newDoc = await prisma.notebookDocument.create({
                        data: {
                            notebookId: document.notebookId,
                            type: DocumentType.LINK,
                            url: `https://youtube.com/watch?v=${vid}`,
                            metadata: {
                                provider: "youtube-video",
                                title: `YouTube Video (${vid})`, // Title will be updated by parser during ingestion
                                relativePath: title, // Group by playlist title
                                fileSize: 0
                            }
                        }
                    });
                    
                    await IngestionProcessor.queueIngestion(newDoc.id);
                }
                
                // Delete original playlist document container
                await prisma.notebookDocument.delete({ where: { id: documentId } });
                console.log(`[Ingestion] Exploded playlist ${documentId} into ${videoIds.length} documents and deleted container.`);
                return;
            }

            // Intercept Studio documents so they don't get chunked/embedded
            if (document.type === "TEXT" && (document.metadata as any)?.studioFeature) {
                await prisma.notebookDocument.update({
                    where: { id: documentId },
                    data: { status: "COMPLETED" }
                });
                console.log(`[Ingestion] Studio document ${documentId} (${(document.metadata as any).studioFeature}) marked COMPLETED instantly.`);
                return;
            }

            // 3. Parse source
            let source: string | Buffer = "";
            let parserSource = "";
            
            if (document.type === "FILE" || document.type === "IMAGE") {
                if (!document.url) {
                    throw new Error("No URL / storage path found for document.");
                }
                
                if (document.url.startsWith("storage://")) {
                    const destKey = document.url.replace("storage://", "");
                    const storage = FileStorageFactory.getStorage();
                    
                    console.log(`[Ingestion] Downloading source buffer from storage: ${destKey}`);
                    await reportProgress(5, "Downloading file...");
                    const fileBuffer = await storage.downloadFile(destKey);
                    
                    source = fileBuffer;
                    parserSource = destKey;
                } else {
                    // Fallback to legacy filepath if needed
                    source = document.url;
                    parserSource = document.url;
                }
            } else if (document.type === "LINK") {
                if (!document.url) {
                    throw new Error("No URL found for link document.");
                }
                source = document.url;
                parserSource = document.url;
            } else {
                // TEXT document
                source = document.content || "";
                parserSource = "raw-text";
            }

            // 3. Resolve parser and parse
            if (document.type === "OTHER") {
                throw new Error("Ingestion of 'OTHER' document type is not supported.");
            }
            const docMetadata = (document.metadata as Record<string, any>) || {};
            const parser = ParserFactory.getParser(document.type as "LINK" | "FILE" | "TEXT" | "IMAGE", parserSource, docMetadata.mimeType);
            
            console.log(`[Ingestion] Parsing content using parser: ${parser.constructor.name}`);
            await reportProgress(10, "Starting to parse content...");
            const parsed = await parser.parse(source, { onProgress: reportProgress });

            // 4. Save rawText back to Postgres content field
            await prisma.notebookDocument.update({
                where: { id: documentId },
                data: { content: parsed.rawText }
            });

            // 5. Initialize vector collection
            const dimension = EmbeddingService.getDimensionSize();
            await this.qdrant.createCollection(this.COLLECTION_NAME, dimension);

            // 6. Generate embeddings in batch and upsert to Qdrant
            console.log(`[Ingestion] Generating batch embeddings and upserting ${parsed.chunks.length} chunks...`);
            await reportProgress(90, "Generating embeddings...");
            const texts = parsed.chunks.map(c => c.text);
            const vectors = await EmbeddingService.getEmbeddings(texts);
            
            const points = [];
            for (let i = 0; i < parsed.chunks.length; i++) {
                const chunk = parsed.chunks[i]!;
                const vector = vectors[i] || [];
                const pointId = cryptoModule.randomUUID();
                
                points.push({
                    id: pointId,
                    vector,
                    payload: {
                        documentId,
                        notebookId: document.notebookId,
                        text: chunk.text,
                        chunkIndex: i,
                        ...chunk.metadata,
                        sourceUrl: document.url || source
                    }
                });
            }

            if (points.length > 0) {
                await this.qdrant.upsertPoints(this.COLLECTION_NAME, points);
            }

            // 7. Update status to COMPLETED
            const finalDoc = await prisma.notebookDocument.findUnique({ where: { id: documentId }});
            const finalMeta = (finalDoc?.metadata as Record<string, any>) || {};
            delete finalMeta.progress;
            delete finalMeta.progressMessage;
            if (parsed.metadata?.title && finalMeta.title?.startsWith("YouTube Video (")) {
                finalMeta.title = parsed.metadata.title;
            }

            await prisma.notebookDocument.update({
                where: { id: documentId },
                data: {
                    status: "COMPLETED",
                    errorMessage: null,
                    metadata: finalMeta
                }
            });
            console.log(`[Ingestion] Successfully ingested document: ${documentId}`);

        } catch (error: any) {
            console.error(`[Ingestion] Ingestion failed for document ${documentId}:`, error);
            try {
                const currentDoc = await prisma.notebookDocument.findUnique({
                    where: { id: documentId },
                    select: { metadata: true, url: true }
                });
                const currentMeta = (currentDoc?.metadata as Record<string, any>) || {};
                
                if (currentMeta.title?.startsWith("YouTube Video (") && currentDoc?.url) {
                    try {
                        const ytParser = new YoutubeParser();
                        const vid = ytParser.extractVideoId(currentDoc.url);
                        if (vid) {
                            const realTitle = await ytParser.getVideoTitle(vid);
                            if (realTitle && !realTitle.startsWith("YouTube Video (")) {
                                currentMeta.title = realTitle;
                            }
                        }
                    } catch (titleErr) {
                        // ignore title fetch error
                    }
                }

                await prisma.notebookDocument.update({
                    where: { id: documentId },
                    data: {
                        status: "FAILED",
                        errorMessage: error.message || String(error),
                        metadata: currentMeta
                    }
                });
            } catch (dbError) {
                console.error("[Ingestion] Failed to write error status to DB:", dbError);
            }
        }
    }
}

export const ingestionWorker = new Worker(
    "ingestion-queue",
    async (job) => {
        const { documentId } = job.data;
        console.log(`[Ingestion Worker] Processing job ${job.id} for document ${documentId}`);
        await IngestionProcessor.processDocument(documentId);
    },
    {
        connection: redisConnection,
        concurrency: 2
    }
);

ingestionWorker.on("completed", (job) => {
    console.log(`[Ingestion Worker] Job ${job.id} completed successfully`);
});

ingestionWorker.on("failed", (job, err) => {
    console.error(`[Ingestion Worker] Job ${job?.id} failed with error:`, err);
});
