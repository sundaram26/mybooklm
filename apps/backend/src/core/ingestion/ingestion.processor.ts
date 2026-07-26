import { prisma } from "../../infrastructure/db/prisma";
import { FileStorageFactory } from "../../infrastructure/file_storage/file-storage.factory";
import { ParserFactory } from "./parsers/parser.factory";
import { EmbeddingService } from "../embedding/embedding.service";
import { QdrantDatabase } from "../../infrastructure/vector_db/qdrant.database";
import cryptoModule from "crypto";

export class IngestionProcessor {
    private static qdrant = new QdrantDatabase();
    private static COLLECTION_NAME = "notebook_chunks";
    private static queue: string[] = [];
    private static activeWorkers = 0;
    private static MAX_CONCURRENT_WORKERS = 2;

    /**
     * Queues a document for background ingestion.
     */
    static queueIngestion(documentId: string): void {
        this.queue.push(documentId);
        this.processQueue();
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
                    this.queueIngestion(doc.id);
                }
            } else {
                console.log("[Ingestion] No stuck documents found.");
            }
        } catch (error) {
            console.error("[Ingestion] Failed to recover queue:", error);
        }
    }

    private static async processQueue(): Promise<void> {
        if (this.activeWorkers >= this.MAX_CONCURRENT_WORKERS || this.queue.length === 0) {
            return;
        }

        const documentId = this.queue.shift()!;
        this.activeWorkers++;
        
        try {
            await this.processDocument(documentId);
        } catch (error) {
            console.error(`Queue worker failed for document ${documentId}:`, error);
        } finally {
            this.activeWorkers--;
            // Recursively process next item in the queue
            this.processQueue();
        }
    }

    private static async processDocument(documentId: string): Promise<void> {
        try {
            console.log(`[Ingestion] Starting ingestion for document: ${documentId}`);
            
            // 1. Fetch document from database
            const document = await prisma.notebookDocument.findUnique({
                where: { id: documentId }
            });

            if (!document) {
                console.error(`[Ingestion] Document ${documentId} not found in database.`);
                return;
            }

            // Update status to PROCESSING
            await prisma.notebookDocument.update({
                where: { id: documentId },
                data: { status: "PROCESSING" }
            });

            // 2. Parse source
            let source: string | Buffer = "";
            let parserSource = "";
            
            if (document.type === "FILE" || document.type === "IMAGE") {
                if (!document.url) {
                    throw new Error("No URL / file path found for file document.");
                }
                
                // Upload raw file to persistent storage (Local or S3)
                const storage = FileStorageFactory.getStorage();
                const fileBaseName = document.url.split(/[/\\]/).pop() || "uploaded-file";
                const destKey = `${document.notebookId}/${documentId}-${fileBaseName}`;
                
                console.log(`[Ingestion] Uploading raw file to storage: ${destKey}`);
                await storage.uploadFile(document.url, destKey);
                
                // Save the provider-agnostic storage uri to document URL
                await prisma.notebookDocument.update({
                    where: { id: documentId },
                    data: { url: `storage://${destKey}` }
                });

                source = document.url; // Use local path for parser to read
                parserSource = document.url;
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
            const parsed = await parser.parse(source);

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
            await prisma.notebookDocument.update({
                where: { id: documentId },
                data: {
                    status: "COMPLETED",
                    errorMessage: null
                }
            });
            console.log(`[Ingestion] Successfully ingested document: ${documentId}`);

        } catch (error: any) {
            console.error(`[Ingestion] Ingestion failed for document ${documentId}:`, error);
            try {
                await prisma.notebookDocument.update({
                    where: { id: documentId },
                    data: {
                        status: "FAILED",
                        errorMessage: error.message || String(error)
                    }
                });
            } catch (dbError) {
                console.error("[Ingestion] Failed to write error status to DB:", dbError);
            }
        }
    }
}
