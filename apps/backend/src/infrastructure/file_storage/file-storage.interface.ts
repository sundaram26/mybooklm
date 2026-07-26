export interface IFileStorage {
    /**
     * Uploads a file to storage and returns its accessible URL or path.
     * @param localPath Temporary local path of the file
     * @param destKey Destination key or path in storage (e.g. 'documents/filename.pdf')
     */
    uploadFile(localPath: string, destKey: string): Promise<string>;

    /**
     * Downloads a file from storage as a buffer.
     * @param destKey Storage key of the file
     */
    downloadFile(destKey: string): Promise<Buffer>;

    /**
     * Deletes a file from storage.
     * @param destKey Storage key of the file
     */
    deleteFile(destKey: string): Promise<void>;
}
