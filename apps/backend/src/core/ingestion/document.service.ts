import { prisma } from "../../infrastructure/db/prisma";
import { DocumentType } from "../../../generated/prisma/client";

export class DocumentService {
    /**
     * Store a file document (PDF, Word, TXT, SRT, etc.)
     */
    static async createFileDocument(notebookId: string, filePath: string, originalName: string, mimeType: string) {
        return await prisma.notebookDocument.create({
            data: {
                notebookId,
                type: DocumentType.FILE,
                url: filePath, // Storing local path in URL for now
                metadata: {
                    originalName,
                    mimeType
                }
            }
        });
    }

    /**
     * Store an image document
     */
    static async createImageDocument(notebookId: string, filePath: string, originalName: string, mimeType: string) {
        return await prisma.notebookDocument.create({
            data: {
                notebookId,
                type: DocumentType.IMAGE,
                url: filePath,
                metadata: {
                    originalName,
                    mimeType
                }
            }
        });
    }

    /**
     * Store raw text content
     */
    static async createTextDocument(notebookId: string, content: string, title?: string) {
        return await prisma.notebookDocument.create({
            data: {
                notebookId,
                type: DocumentType.TEXT,
                content,
                metadata: {
                    title: title || "Raw Text Snippet"
                }
            }
        });
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

        return await prisma.notebookDocument.create({
            data: {
                notebookId,
                type: DocumentType.LINK,
                url,
                metadata: {
                    provider
                }
            }
        });
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
}
