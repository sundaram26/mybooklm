import { env } from "../../config/env.config";
import type { IVectorDatabase, VectorPoint } from "./vector-db.interface";

export class QdrantDatabase implements IVectorDatabase {
    private baseUrl: string;

    constructor() {
        this.baseUrl = env.QDRANT_URL;
    }

    private async request(path: string, options: RequestInit = {}): Promise<any> {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        };
        
        try {
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(`Qdrant error: ${response.statusText}. ${JSON.stringify(data)}`);
            }
            return data;
        } catch (error) {
            console.error(`Error requesting Qdrant at ${url}:`, error);
            throw error;
        }
    }

    async createCollection(collectionName: string, vectorSize: number): Promise<void> {
        try {
            // Check if collection exists
            await this.request(`/collections/${collectionName}`);
        } catch {
            // Assume collection does not exist, create it
            console.log(`Creating Qdrant collection: ${collectionName} (vector size: ${vectorSize})`);
            await this.request(`/collections/${collectionName}`, {
                method: "PUT",
                body: JSON.stringify({
                    vectors: {
                        size: vectorSize,
                        distance: "Cosine",
                    },
                }),
            });

            // Create Keyword payload index on notebookId
            console.log(`Creating Qdrant payload index 'notebookId' on collection '${collectionName}'`);
            await this.request(`/collections/${collectionName}/index`, {
                method: "POST",
                body: JSON.stringify({
                    field_name: "notebookId",
                    field_schema: "keyword"
                })
            }).catch(err => console.error("Failed to create Qdrant payload index for notebookId:", err));

            // Create Keyword payload index on documentId
            console.log(`Creating Qdrant payload index 'documentId' on collection '${collectionName}'`);
            await this.request(`/collections/${collectionName}/index`, {
                method: "POST",
                body: JSON.stringify({
                    field_name: "documentId",
                    field_schema: "keyword"
                })
            }).catch(err => console.error("Failed to create Qdrant payload index for documentId:", err));
        }
    }

    async upsertPoints(collectionName: string, points: VectorPoint[]): Promise<void> {
        await this.request(`/collections/${collectionName}/points?wait=true`, {
            method: "PUT",
            body: JSON.stringify({
                points: points.map(p => ({
                    id: p.id,
                    vector: p.vector,
                    payload: p.payload,
                })),
            }),
        });
    }

    async search(
        collectionName: string,
        vector: number[],
        limit: number,
        filter?: Record<string, any>
    ): Promise<Array<{ id: string; score: number; payload: Record<string, any> }>> {
        const body: any = {
            vector: vector,
            limit: limit,
            with_payload: true,
        };

        if (filter) {
            const mustFilters: any[] = [];
            for (const [key, value] of Object.entries(filter)) {
                mustFilters.push({
                    key,
                    match: { value },
                });
            }
            body.filter = { must: mustFilters };
        }

        const response = await this.request(`/collections/${collectionName}/points/search`, {
            method: "POST",
            body: JSON.stringify(body),
        });

        return (response.result || []).map((item: any) => ({
            id: item.id,
            score: item.score,
            payload: item.payload || {},
        }));
    }

    async deletePoints(collectionName: string, ids: string[]): Promise<void> {
        await this.request(`/collections/${collectionName}/points/delete?wait=true`, {
            method: "POST",
            body: JSON.stringify({
                points: ids,
            }),
        });
    }

    async deletePointsByFilter(collectionName: string, filter: Record<string, any>): Promise<void> {
        const mustFilters: any[] = [];
        for (const [key, value] of Object.entries(filter)) {
            mustFilters.push({
                key,
                match: { value },
            });
        }
        await this.request(`/collections/${collectionName}/points/delete?wait=true`, {
            method: "POST",
            body: JSON.stringify({
                filter: { must: mustFilters }
            }),
        });
    }
}
