import { z } from "zod";

export const CreateProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();
