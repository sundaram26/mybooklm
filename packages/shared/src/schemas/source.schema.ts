import { z } from "zod";

export const AddUrlSourceSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  title: z.string().max(80, "Title is too long").optional(),
});

export const AddTextNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(80, "Title is too long"),
  text: z.string().min(1, "Text is required").max(50000, "Text is too long"),
});
