import type { Request, Response, NextFunction } from "express";
import { DocumentService } from "../../core/ingestion/document.service";
import { asyncHandler } from "../../utils/asyncHandler";

export class DocumentController {
    
    static uploadFile = asyncHandler(async (req: Request, res: Response) => {
        const notebookId = req.params.notebookId as string;
        const file = req.file;
        
        if (!file) {
            res.status(400).json({ success: false, message: "No file uploaded" });
            return;
        }

        const document = await DocumentService.createFileDocument(
            notebookId, 
            file.path, 
            file.originalname, 
            file.mimetype
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

        const document = await DocumentService.createImageDocument(
            notebookId, 
            file.path, 
            file.originalname, 
            file.mimetype
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
        
        res.status(200).json({ success: true, data: documents });
    });

    static getDocument = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const document = await DocumentService.getDocumentById(id);
        
        if (!document) {
            res.status(404).json({ success: false, message: "Document not found" });
            return;
        }
        
        res.status(200).json({ success: true, data: document });
    });
}
