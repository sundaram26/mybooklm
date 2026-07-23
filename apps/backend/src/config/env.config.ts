import { config } from "dotenv";
import { z } from "zod";
import path from "path";

const nodeEnv = process.env.NODE_ENV || "development";
if (nodeEnv !== "production") {
  config({ path: path.resolve(__dirname, `../../.env.${nodeEnv}.local`) });
}


const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url().default("postgresql://postgres:password@localhost:5432/notebooklm"),
  QDRANT_URL: z.string().url().default("http://localhost:6333"),
});


const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(_env.error.format());
  process.exit(1);
}



export const env = _env.data;