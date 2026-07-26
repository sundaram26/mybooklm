import type { Request, Response } from "express";
import { prisma } from "../../infrastructure/db/prisma";
import { DocumentService } from "../../core/ingestion/document.service";
import { asyncHandler } from "../../utils/asyncHandler";

export class NotebookController {
    
    static createNotebook = asyncHandler(async (req: Request, res: Response) => {
        const { title, guestId } = req.body;
        const userId = res.locals.user?.id as string | undefined;

        if (!title) {
            res.status(400).json({ success: false, message: "Notebook title is required." });
            return;
        }

        const notebook = await prisma.notebook.create({
            data: {
                title,
                userId: userId || null,
                guestId: guestId || null
            }
        });

        res.status(201).json({ success: true, data: notebook });
    });

    static getNotebooks = asyncHandler(async (req: Request, res: Response) => {
        const userId = res.locals.user?.id as string | undefined;
        const guestId = req.query.guestId as string | undefined;

        const conditions: any[] = [];
        if (userId) {
            conditions.push({ userId });
        }
        if (guestId) {
            conditions.push({ guestId });
        }

        if (conditions.length === 0) {
            res.status(200).json({ success: true, data: [] });
            return;
        }

        const notebooks = await prisma.notebook.findMany({
            where: {
                OR: conditions
            },
            orderBy: { updatedAt: "desc" }
        });

        res.status(200).json({ success: true, data: notebooks });
    });

    static getNotebook = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const notebook = await prisma.notebook.findUnique({
            where: { id },
            include: {
                documents: true
            }
        });

        if (!notebook) {
            res.status(404).json({ success: false, message: "Notebook not found" });
            return;
        }

        // Map documents to include viewUrl
        const mappedDocuments = notebook.documents.map(doc => ({
            ...doc,
            viewUrl: doc.url?.startsWith("storage://")
                ? `/api/notebooks/documents/${doc.id}/view`
                : doc.url
        }));

        res.status(200).json({ success: true, data: { ...notebook, documents: mappedDocuments } });
    });

    static updateNotebook = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const { title } = req.body;

        if (!title) {
            res.status(400).json({ success: false, message: "Title is required for rename." });
            return;
        }

        const notebook = await prisma.notebook.update({
            where: { id },
            data: { title }
        });

        res.status(200).json({ success: true, data: notebook });
    });

    static deleteNotebook = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;

        const notebook = await prisma.notebook.findUnique({
            where: { id },
            include: { documents: true }
        });

        if (!notebook) {
            res.status(404).json({ success: false, message: "Notebook not found" });
            return;
        }

        // Clean up S3/B2 files and Qdrant vectors for all documents in the notebook
        console.log(`[NotebookService] Clean-deleting notebook: ${id} with ${notebook.documents.length} documents...`);
        for (const doc of notebook.documents) {
            try {
                await DocumentService.deleteDocument(doc.id);
            } catch (err) {
                console.error(`[NotebookService] Failed to delete document ${doc.id} during notebook delete:`, err);
            }
        }

        // Delete from Postgres (associated chat sessions will cascade delete)
        await prisma.notebook.delete({
            where: { id }
        });

        res.status(200).json({ success: true, message: "Notebook and all associated documents deleted successfully." });
    });
}
