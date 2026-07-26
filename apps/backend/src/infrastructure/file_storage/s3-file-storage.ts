import type { IFileStorage } from "./file-storage.interface";
import fs from "fs/promises";
import { env } from "../../config/env.config";

export class S3FileStorage implements IFileStorage {
    private bucket: string;
    private s3Client: any;
    private endpoint: string | undefined;

    constructor() {
        this.bucket = env.AWS_S3_BUCKET || "notebooklm-uploads";
        this.endpoint = env.BACKBLAZE_B2_ENDPOINT || undefined;
    }

    private async getClient() {
        if (this.s3Client) return this.s3Client;
        try {
            const { S3Client } = await import("@aws-sdk/client-s3");
            
            const config: any = {
                region: env.AWS_REGION || "us-east-1",
                credentials: {
                    accessKeyId: env.AWS_ACCESS_KEY_ID || "",
                    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
                }
            };

            if (this.endpoint) {
                config.endpoint = this.endpoint;
                config.forcePathStyle = true;
            }

            this.s3Client = new S3Client(config);
            return this.s3Client;
        } catch {
            throw new Error("AWS SDK @aws-sdk/client-s3 is not installed. Run 'pnpm add @aws-sdk/client-s3' or use LocalFileStorage.");
        }
    }

    async uploadFile(localPath: string, destKey: string): Promise<string> {
        const client = await this.getClient();
        const { PutObjectCommand } = await import("@aws-sdk/client-s3");
        const fileContent = await fs.readFile(localPath);
        
        await client.send(new PutObjectCommand({
            Bucket: this.bucket,
            Key: destKey,
            Body: fileContent,
        }));
        
        if (this.endpoint) {
            const cleanEndpoint = this.endpoint.replace(/\/$/, "");
            return `${cleanEndpoint}/${this.bucket}/${destKey}`;
        }
        
        return `https://${this.bucket}.s3.${env.AWS_REGION || "us-east-1"}.amazonaws.com/${destKey}`;
    }

    async downloadFile(destKey: string): Promise<Buffer> {
        const client = await this.getClient();
        const { GetObjectCommand } = await import("@aws-sdk/client-s3");
        
        const response = await client.send(new GetObjectCommand({
            Bucket: this.bucket,
            Key: destKey
        }));
        
        const streamToBuffer = (stream: any): Promise<Buffer> =>
            new Promise((resolve, reject) => {
                const chunks: any[] = [];
                stream.on("data", (chunk: any) => chunks.push(chunk));
                stream.on("error", reject);
                stream.on("end", () => resolve(Buffer.concat(chunks)));
            });
            
        return await streamToBuffer(response.Body);
    }

    async deleteFile(destKey: string): Promise<void> {
        const client = await this.getClient();
        const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
        
        await client.send(new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: destKey
        }));
    }
}
