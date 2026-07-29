import type { Request, Response } from "express";
import { StudioService } from "../../core/studio/studio.service";
import { asyncHandler } from "../../utils/asyncHandler";

export class StudioController {
    static generate = asyncHandler(async (req: Request, res: Response) => {
        const notebookId = req.params.notebookId as string;
        const { feature, customParams } = req.body;

        if (!feature) {
            res.status(400).json({ success: false, message: "Studio feature parameter is required." });
            return;
        }

        const studioOptions = {
            customParams
        };

        const document = await StudioService.generateStudioOutput(notebookId, feature, studioOptions);
        
        res.status(201).json({ success: true, data: document });
    });
}
