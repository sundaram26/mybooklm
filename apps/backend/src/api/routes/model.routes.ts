import { Router } from "express";
import type { Request, Response } from "express";
import { SUPPORTED_MODELS } from "../../config/models";

const router: Router = Router();

router.get("/", (req: Request, res: Response) => {
    const modelsList = Object.values(SUPPORTED_MODELS);
    res.status(200).json({ success: true, data: modelsList });
});

export { router as modelRoutes };
