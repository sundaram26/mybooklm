import { Router } from "express";
import { DocumentController } from "../controllers/document.controller";
import { StudioController } from "../controllers/studio.controller";
import { documentUpload, imageUpload } from "../middlewares/upload.middleware";
import { optionalAuth } from "../middlewares/auth.middleware";

export const documentRoutes: Router = Router();

// optionalAuth: authenticated users get res.locals.user, guest users pass through without blocking.
// Guest prompt limits are enforced in the chat controller.
documentRoutes.use(optionalAuth);

// File uploads
documentRoutes.post(
    "/:notebookId/documents/file",
    documentUpload.single("file"),
    DocumentController.uploadFile
);

// Image uploads
documentRoutes.post(
    "/:notebookId/documents/image",
    imageUpload.single("image"),
    DocumentController.uploadImage
);

// Text & Link uploads (No multer required since it's JSON body)
documentRoutes.post("/:notebookId/documents/text", DocumentController.uploadText);
documentRoutes.post("/:notebookId/documents/link", DocumentController.uploadLink);

// Retrieval
documentRoutes.get("/:notebookId/documents", DocumentController.getNotebookDocuments);
documentRoutes.get("/documents/:id", DocumentController.getDocument);
documentRoutes.get("/documents/:id/view", DocumentController.viewFile);
documentRoutes.delete("/:notebookId/documents/:id", DocumentController.deleteDocument);
documentRoutes.get("/:notebookId/documents/:id/status", DocumentController.getDocumentStatus);
documentRoutes.get("/:notebookId/retrieve", DocumentController.retrieveNotebookChunks);
documentRoutes.post("/:notebookId/retrieve", DocumentController.retrieveNotebookChunks);

// Studio features
documentRoutes.post("/:notebookId/studio", StudioController.generate);
