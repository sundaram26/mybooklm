import { prisma } from "../../infrastructure/db/prisma";
import { DocumentType } from "../../../generated/prisma/client";
import { IngestionProcessor } from "./ingestion.processor";
import { FileStorageFactory } from "../../infrastructure/file_storage/file-storage.factory";
import { QdrantDatabase } from "../../infrastructure/vector_db/qdrant.database";

export class DocumentService {
    /**
     * Check if a new file will exceed the 1GB limit (1073741824 bytes).
     * Returns true if upload is allowed, false if limit exceeded.
     */
    static async checkStorageLimit(notebookId: string, newFileSize: number): Promise<boolean> {
        const notebook = await prisma.notebook.findUnique({
            where: { id: notebookId },
            select: { userId: true, guestId: true }
        });

        if (!notebook) return false;

        // Find all notebooks owned by this user/guest
        const whereClause = notebook.userId 
            ? { userId: notebook.userId } 
            : { guestId: notebook.guestId };

        const userNotebooks = await prisma.notebook.findMany({
            where: whereClause,
            select: { id: true }
        });

        const notebookIds = userNotebooks.map(n => n.id);

        // Fetch all documents for these notebooks
        const documents = await prisma.notebookDocument.findMany({
            where: { notebookId: { in: notebookIds } },
            select: { metadata: true }
        });

        let totalSize = 0;
        for (const doc of documents) {
            const meta = doc.metadata as any;
            if (meta && meta.fileSize) {
                totalSize += Number(meta.fileSize) || 0;
            }
        }

        const limit = 1073741824; // 1 GB in bytes
        return (totalSize + newFileSize) <= limit;
    }

    /**
     * Store a file document (PDF, Word, TXT, SRT, etc.)
     */
    static async createFileDocument(notebookId: string, filePath: string, originalName: string, mimeType: string, fileSize?: number) {
        const doc = await prisma.notebookDocument.create({
            data: {
                notebookId,
                type: DocumentType.FILE,
                url: filePath,
                metadata: {
                    originalName,
                    mimeType,
                    fileSize: fileSize || 0
                }
            }
        });

        // Trigger background processing
        IngestionProcessor.queueIngestion(doc.id);
        return doc;
    }

    /**
     * Store an image document
     */
    static async createImageDocument(notebookId: string, filePath: string, originalName: string, mimeType: string, fileSize?: number) {
        const doc = await prisma.notebookDocument.create({
            data: {
                notebookId,
                type: DocumentType.IMAGE,
                url: filePath,
                metadata: {
                    originalName,
                    mimeType,
                    fileSize: fileSize || 0
                }
            }
        });

        // Trigger background processing
        IngestionProcessor.queueIngestion(doc.id);
        return doc;
    }

    /**
     * Store raw text content
     */
    static async createTextDocument(notebookId: string, content: string, title?: string) {
        const doc = await prisma.notebookDocument.create({
            data: {
                notebookId,
                type: DocumentType.TEXT,
                content,
                metadata: {
                    title: title || "Raw Text Snippet",
                    fileSize: content.length
                }
            }
        });

        // Trigger background processing
        IngestionProcessor.queueIngestion(doc.id);
        return doc;
    }

    /**
     * Store a link document and try to infer metadata
     */
    static async createLinkDocument(notebookId: string, url: string) {
        let provider = "website";
        
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            provider = url.includes("list=") ? "youtube-playlist" : "youtube-video";
        } else if (url.includes("drive.google.com")) {
            provider = "google-drive";
        }

        const doc = await prisma.notebookDocument.create({
            data: {
                notebookId,
                type: DocumentType.LINK,
                url,
                metadata: {
                    provider,
                    fileSize: 0
                }
            }
        });

        // Trigger background processing
        IngestionProcessor.queueIngestion(doc.id);
        return doc;
    }

    /**
     * Get all documents for a notebook
     */
    static async getNotebookDocuments(notebookId: string) {
        return await prisma.notebookDocument.findMany({
            where: { notebookId },
            orderBy: { createdAt: "desc" }
        });
    }

    /**
     * Get a specific document
     */
    static async getDocumentById(id: string) {
        return await prisma.notebookDocument.findUnique({
            where: { id }
        });
    }

    /**
     * Deletes a document from Postgres, File Storage, and Vector Database.
     */
    static async deleteDocument(id: string) {
        const doc = await prisma.notebookDocument.findUnique({ where: { id } });
        if (!doc) {
            throw new Error("Document not found.");
        }

        // 1. Delete raw file from cloud/local storage
        if ((doc.type === "FILE" || doc.type === "IMAGE") && doc.url && doc.url.startsWith("storage://")) {
            const destKey = doc.url.replace("storage://", "");
            try {
                const storage = FileStorageFactory.getStorage();
                await storage.deleteFile(destKey);
                console.log(`[DocumentService] Deleted raw storage file: ${destKey}`);
            } catch (err) {
                console.error(`[DocumentService] Failed to delete raw storage file ${destKey}:`, err);
            }
        }

        // 2. Delete points from vector search collection
        try {
            const qdrant = new QdrantDatabase();
            await qdrant.deletePointsByFilter("notebook_chunks", { documentId: id });
            console.log(`[DocumentService] Cleared vectors matching documentId: ${id}`);
        } catch (err) {
            console.error(`[DocumentService] Failed to clean vectors from Qdrant for document ${id}:`, err);
        }

        // 3. Remove DB record
        return await prisma.notebookDocument.delete({ where: { id } });
    }
}
