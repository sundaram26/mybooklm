import { config } from "dotenv";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeEnv = process.env.NODE_ENV || "development";
if (nodeEnv !== "production") {
  config({ path: path.resolve(__dirname, `../../.env.${nodeEnv}.local`) });
}


const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url().default("postgresql://postgres:password@localhost:5432/notebooklm"),
  QDRANT_URL: z.string().url().default("http://localhost:6333"),
  BETTER_AUTH_SECRET: z.string().default("sample-super-secret-key-12345"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  BACKBLAZE_B2_ENDPOINT: z.string().optional(), // Marked optional string since local storage requires no endpoint
  AWS_S3_BUCKET: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  ANTHROPIC_MODEL: z.string().default("claude-3-5-haiku-20241022"),
});


const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(_env.error.format());
  process.exit(1);
}



export const env = _env.data;