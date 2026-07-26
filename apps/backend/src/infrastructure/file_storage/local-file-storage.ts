import fs from "fs/promises";
import path from "path";
import type { IFileStorage } from "./file-storage.interface";

export class LocalFileStorage implements IFileStorage {
    private storageDir: string;

    constructor() {
        this.storageDir = path.resolve(process.cwd(), "uploads/storage");
    }

    private async ensureDir() {
        await fs.mkdir(this.storageDir, { recursive: true });
    }

    async uploadFile(localPath: string, destKey: string): Promise<string> {
        await this.ensureDir();
        const targetPath = path.join(this.storageDir, destKey);
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        
        // Copy file to local storage location
        await fs.copyFile(localPath, targetPath);
        
        // Return public-facing route to the file
        return `/uploads/storage/${destKey}`;
    }

    async downloadFile(destKey: string): Promise<Buffer> {
        const targetPath = path.join(this.storageDir, destKey);
        return await fs.readFile(targetPath);
    }

    async deleteFile(destKey: string): Promise<void> {
        const targetPath = path.join(this.storageDir, destKey);
        try {
            await fs.unlink(targetPath);
        } catch {
            // Ignore if file doesn't exist
        }
    }
}
