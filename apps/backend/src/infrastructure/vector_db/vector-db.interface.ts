export interface VectorPoint {
    id: string;
    vector: number[];
    payload: Record<string, any>;
}

export interface IVectorDatabase {
    /**
     * Creates a collection with the specified vector dimension size if it doesn't already exist.
     */
    createCollection(collectionName: string, vectorSize: number): Promise<void>;

    /**
     * Inserts or updates points (vectors + payloads) in the specified collection.
     */
    upsertPoints(collectionName: string, points: VectorPoint[]): Promise<void>;

    /**
     * Searches for nearest vectors in the specified collection.
     * @returns Array of matching points with similarity score
     */
    search(
        collectionName: string,
        vector: number[],
        limit: number,
        filter?: Record<string, any>
    ): Promise<Array<{ id: string; score: number; payload: Record<string, any> }>>;

    /**
     * Deletes specified points from the collection.
     */
    deletePoints(collectionName: string, ids: string[]): Promise<void>;

    /**
     * Deletes points matching a specific filter from the collection.
     */
    deletePointsByFilter(collectionName: string, filter: Record<string, any>): Promise<void>;
}
