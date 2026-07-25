import { Router } from "express";
import { DocumentController } from "../controllers/document.controller";
import { documentUpload, imageUpload } from "../middlewares/upload.middleware";
import { requireAuth } from "../middlewares/auth.middleware";

export const documentRoutes: Router = Router();

// We are applying requireAuth to all routes here for security.
// If anonymous upload is needed, you can switch this to optionalAuth or remove it.
documentRoutes.use(requireAuth);

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
