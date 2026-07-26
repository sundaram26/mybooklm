import { Router } from "express";
import { NotebookController } from "../controllers/notebook.controller";
import { optionalAuth } from "../middlewares/auth.middleware";

export const notebookRoutes: Router = Router();

notebookRoutes.use(optionalAuth);

notebookRoutes.post("/", NotebookController.createNotebook);
notebookRoutes.get("/", NotebookController.getNotebooks);
notebookRoutes.get("/:id", NotebookController.getNotebook);
notebookRoutes.put("/:id", NotebookController.updateNotebook);
notebookRoutes.delete("/:id", NotebookController.deleteNotebook);
