import type { IFileStorage } from "./file-storage.interface";
import { LocalFileStorage } from "./local-file-storage";
import { S3FileStorage } from "./s3-file-storage";
import { env } from "../../config/env.config";

export class FileStorageFactory {
    private static instance: IFileStorage;

    static getStorage(): IFileStorage {
        if (!this.instance) {
            if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
                this.instance = new S3FileStorage();
            } else {
                this.instance = new LocalFileStorage();
            }
        }
        return this.instance;
    }
}
