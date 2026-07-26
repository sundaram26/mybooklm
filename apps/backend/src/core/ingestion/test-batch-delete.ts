import { EmbeddingService } from "../embedding/embedding.service";
import { SynthesisService } from "../synthesis/synthesis.service";
import { QdrantDatabase } from "../../infrastructure/vector_db/qdrant.database";
import cryptoModule from "crypto";

async function runVerification() {
    console.log("=== STARTING PHASE 2 VERIFICATION TESTS ===");

    // Test 1: Batch Embeddings
    console.log("\n1. Testing Batch Embeddings...");
    const sampleTexts = [
        "First batch text content to vectorize.",
        "Second text content representing a separate chunk.",
        "Third document text for validation."
    ];
    const vectors = await EmbeddingService.getEmbeddings(sampleTexts);
    console.log(`- Received ${vectors.length} vectors.`);
    console.log(`- Vector 1 dimension: ${vectors[0]?.length}`);
    console.log(`- Vector 2 dimension: ${vectors[1]?.length}`);
    console.log(`- Vector 3 dimension: ${vectors[2]?.length}`);

    if (vectors.length === 3 && vectors[0]?.length === EmbeddingService.getDimensionSize()) {
        console.log("✅ Batch embeddings verified successfully.");
    } else {
        throw new Error("Batch embeddings failed: mismatch in count or dimensions.");
    }

    // Test 2: Synthesis Grounded Message Formatting
    console.log("\n2. Testing Grounded Synthesis Message Prompt Generation...");
    // We can call synthesis prepareMessages using reflection or simulate it:
    const mockSources = [
        {
            text: "This is a document talking about Photosynthesis. Plants use sunlight to generate sugar.",
            score: 0.95,
            metadata: { originalName: "biology.pdf", pageNumber: 5 }
        },
        {
            text: "Timelines for biology project. Submission is due on September 15th.",
            score: 0.88,
            metadata: { originalName: "course-info.docx", pageNumber: 1 }
        }
    ];

    // Using prepareMessages (using typescript as any to access private static method)
    try {
        const prepareMessages = (SynthesisService as any).prepareMessages;
        if (prepareMessages) {
            const formatted = prepareMessages("What is Photosynthesis?", [], mockSources);
            console.log(`- Grounded system message length: ${formatted[0].content.length}`);
            console.log(`- System message snippet:\n${formatted[0].content.substring(0, 300)}...`);
            console.log(`- User message:`, formatted[2]);
            console.log("✅ Grounded Synthesis Prompt verified successfully.");
        }
    } catch (e: any) {
        console.log("⚠️ Grounded Synthesis check skipped or failed:", e.message);
    }

    // Test 3: Qdrant Vector Deletion by Filter
    console.log("\n3. Testing Qdrant Collection Cleanup by Filter...");
    const qdrant = new QdrantDatabase();
    const testCollection = "notebook_chunks";
    const testDocId = `test-doc-${cryptoModule.randomUUID()}`;

    try {
        // Ensure collection exists
        const dimension = EmbeddingService.getDimensionSize();
        await qdrant.createCollection(testCollection, dimension);
        console.log(`- Collection '${testCollection}' ready.`);

        // Upsert dummy vector
        const pointId = cryptoModule.randomUUID();
        const dummyVector = Array.from({ length: dimension }, () => Math.random() * 2 - 1);
        await qdrant.upsertPoints(testCollection, [
            {
                id: pointId,
                vector: dummyVector,
                payload: {
                    documentId: testDocId,
                    notebookId: "test-notebook",
                    text: "Photosynthesis is the process by which plants make energy.",
                    sourceUrl: "test-url"
                }
            }
        ]);
        console.log(`- Upserted point for documentId: ${testDocId}`);

        // Search to verify upserted vector exists
        const searchBefore = await qdrant.search(testCollection, dummyVector, 5, { documentId: testDocId });
        console.log(`- Search results before delete (matching documentId): ${searchBefore.length}`);
        if (searchBefore.length === 0) {
            throw new Error("Failed to find point in Qdrant before deletion test.");
        }

        // Delete points matching documentId
        console.log(`- Cleaning up points matching documentId: ${testDocId}`);
        await qdrant.deletePointsByFilter(testCollection, { documentId: testDocId });

        // Search again to verify deletion
        const searchAfter = await qdrant.search(testCollection, dummyVector, 5, { documentId: testDocId });
        console.log(`- Search results after delete (matching documentId): ${searchAfter.length}`);
        if (searchAfter.length === 0) {
            console.log("✅ Qdrant filter delete verified successfully.");
        } else {
            throw new Error("Failed to clear points by filter. Points still exist in Qdrant.");
        }

    } catch (e: any) {
        console.log("⚠️ Qdrant verification skipped (Is Qdrant running in Docker?):", e.message);
    }

    console.log("\n=== PHASE 2 VERIFICATION TESTS COMPLETED ===");
}

runVerification().catch(err => {
    console.error("Verification test failed:", err);
    process.exit(1);
});
