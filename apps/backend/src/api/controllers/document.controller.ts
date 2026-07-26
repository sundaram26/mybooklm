import type { Request, Response, NextFunction } from "express";
import { DocumentService } from "../../core/ingestion/document.service";
import { RetrievalService } from "../../core/retrieval/retrieval.service";
import { FileStorageFactory } from "../../infrastructure/file_storage/file-storage.factory";
import { asyncHandler } from "../../utils/asyncHandler";

export class DocumentController {
    
    static uploadFile = asyncHandler(async (req: Request, res: Response) => {
        const notebookId = req.params.notebookId as string;
        const file = req.file;
        
        if (!file) {
            res.status(400).json({ success: false, message: "No file uploaded" });
            return;
        }

        const hasSpace = await DocumentService.checkStorageLimit(notebookId, file.size);
        if (!hasSpace) {
            res.status(403).json({ success: false, message: "Storage limit exceeded (1 GB per user)." });
            return;
        }

        const document = await DocumentService.createFileDocument(
            notebookId, 
            file.path, 
            file.originalname, 
            file.mimetype,
            file.size
        );
        
        res.status(201).json({ success: true, data: document });
    });

    static uploadImage = asyncHandler(async (req: Request, res: Response) => {
        const notebookId = req.params.notebookId as string;
        const file = req.file;
        
        if (!file) {
            res.status(400).json({ success: false, message: "No image uploaded" });
            return;
        }

        const hasSpace = await DocumentService.checkStorageLimit(notebookId, file.size);
        if (!hasSpace) {
            res.status(403).json({ success: false, message: "Storage limit exceeded (1 GB per user)." });
            return;
        }

        const document = await DocumentService.createImageDocument(
            notebookId, 
            file.path, 
            file.originalname, 
            file.mimetype,
            file.size
        );
        
        res.status(201).json({ success: true, data: document });
    });

    static uploadText = asyncHandler(async (req: Request, res: Response) => {
        const notebookId = req.params.notebookId as string;
        const { content, title } = req.body;
        
        if (!content) {
            res.status(400).json({ success: false, message: "Content is required for text upload" });
            return;
        }

        const document = await DocumentService.createTextDocument(notebookId, content, title);
        
        res.status(201).json({ success: true, data: document });
    });

    static uploadLink = asyncHandler(async (req: Request, res: Response) => {
        const notebookId = req.params.notebookId as string;
        const { url } = req.body;
        
        if (!url) {
            res.status(400).json({ success: false, message: "URL is required for link upload" });
            return;
        }

        const document = await DocumentService.createLinkDocument(notebookId, url);
        
        res.status(201).json({ success: true, data: document });
    });

    static getNotebookDocuments = asyncHandler(async (req: Request, res: Response) => {
        const notebookId = req.params.notebookId as string;
        const documents = await DocumentService.getNotebookDocuments(notebookId);
        
        const mappedDocuments = documents.map((doc: any) => ({
            ...doc,
            fileSize: (doc.metadata as any)?.fileSize || 0,
            viewUrl: doc.url?.startsWith("storage://")
                ? `/api/notebooks/documents/${doc.id}/view`
                : doc.url
        }));
        
        res.status(200).json({ success: true, data: mappedDocuments });
    });

    static getDocument = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const document = await DocumentService.getDocumentById(id);
        
        if (!document) {
            res.status(404).json({ success: false, message: "Document not found" });
            return;
        }
        
        const mappedDocument = {
            ...document,
            fileSize: (document.metadata as any)?.fileSize || 0,
            viewUrl: document.url?.startsWith("storage://")
                ? `/api/notebooks/documents/${document.id}/view`
                : document.url
        };
        
        res.status(200).json({ success: true, data: mappedDocument });
    });

    static retrieveNotebookChunks = asyncHandler(async (req: Request, res: Response) => {
        const notebookId = req.params.notebookId as string;
        const query = (req.query.query || req.body.query) as string;
        const useHyde = req.query.useHyde === "true" || req.body.useHyde === true;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : (req.body.limit ? parseInt(req.body.limit as string) : 5);

        if (!query) {
            res.status(400).json({ success: false, message: "Query string is required." });
            return;
        }

        const results = await RetrievalService.retrieve(notebookId, query, { useHyde, limit });
        res.status(200).json({ success: true, data: results });
    });

    static viewFile = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const document = await DocumentService.getDocumentById(id);
        
        if (!document) {
            res.status(404).json({ success: false, message: "Document not found" });
            return;
        }
        
        if (!document.url) {
            res.status(400).json({ success: false, message: "This document does not have a file attachment." });
            return;
        }

        if (document.type !== "FILE" && document.type !== "IMAGE") {
            res.status(400).json({ success: false, message: "Document is not a file or image." });
            return;
        }

        if (!document.url.startsWith("storage://")) {
            res.status(400).json({ success: false, message: "Invalid document storage URI." });
            return;
        }

        const destKey = document.url.replace("storage://", "");
        
        try {
            const storage = FileStorageFactory.getStorage();
            const buffer = await storage.downloadFile(destKey);
            
            const docMetadata = (document.metadata as Record<string, any>) || {};
            const mimeType = docMetadata.mimeType || "application/octet-stream";
            const originalName = docMetadata.originalName || "downloaded-file";
            
            res.setHeader("Content-Type", mimeType);
            
            // Encode filename to support special characters in headers safely
            const encodedFilename = encodeURIComponent(originalName);
            res.setHeader("Content-Disposition", `inline; filename="${originalName}"; filename*=UTF-8''${encodedFilename}`);
            
            res.send(buffer);
        } catch (error: any) {
            console.error(`Failed to stream file for document ${id}:`, error);
            res.status(500).json({ success: false, message: "Failed to download file from cloud storage." });
        }
    });

    static deleteDocument = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        try {
            await DocumentService.deleteDocument(id);
            res.status(200).json({ success: true, message: "Document deleted successfully." });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message || "Failed to delete document." });
        }
    });
}
