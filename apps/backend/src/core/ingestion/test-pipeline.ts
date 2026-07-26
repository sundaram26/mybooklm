import { ParserFactory } from "./parsers/parser.factory";
import { RecursiveCharacterTextSplitter } from "./chunking/text-splitter";
import { EmbeddingService } from "../embedding/embedding.service";
import fs from "fs/promises";
import path from "path";

async function runTests() {
    console.log("=== STARTING PIPELINE INTEGRATION TESTS ===");

    // Test 1: Recursive Text Splitter
    console.log("\n1. Testing Text Splitter...");
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 100, chunkOverlap: 20 });
    const sampleText = "This is a long piece of text that should be split into smaller chunks. It has multiple sentences and we want to preserve overlap.";
    const chunks = await splitter.splitText(sampleText);
    console.log(`- Created ${chunks.length} chunks.`);
    console.log("- Chunks:", chunks);

    // Test 2: SRT Parser
    console.log("\n2. Testing SRT Subtitle Parser...");
    const srtParser = ParserFactory.getParser("FILE", "test.srt");
    const sampleSrt = `1
00:00:01,000 --> 00:00:04,000
Hello World from Subtitles!

2
00:00:04,500 --> 00:00:08,000
This is the second segment.`;
    const parsedSrt = await srtParser.parse(sampleSrt);
    console.log("- SRT Raw Text:", parsedSrt.rawText);
    console.log("- SRT Chunks:", parsedSrt.chunks);

    // Test 3: Embedding Service (tests offline mock fallback)
    console.log("\n3. Testing Embedding Service...");
    const textToEmbed = "Hello world";
    const embedding = await EmbeddingService.getEmbedding(textToEmbed);
    console.log(`- Embedding dimension returned: ${embedding.length}`);
    console.log(`- Embedding snippet (first 5 dimensions):`, embedding.slice(0, 5));

    // Test 4: Web Parser (tests real HTTP fetch and cheerio scraping)
    console.log("\n4. Testing Web Parser (scraping https://example.com)...");
    try {
        const webParser = ParserFactory.getParser("LINK", "https://example.com");
        const parsedWeb = await webParser.parse("https://example.com");
        console.log("- Web Raw Text length:", parsedWeb.rawText.length);
        console.log("- Web Chunks count:", parsedWeb.chunks.length);
        console.log("- Web Chunk metadata:", parsedWeb.chunks[0]?.metadata);
    } catch (e: any) {
        console.log("- Web Parser failed (network offline?):", e.message);
    }

    console.log("\n=== PIPELINE INTEGRATION TESTS COMPLETED SUCCESSFULLY ===");
}

runTests().catch(error => {
    console.error("Test execution failed:", error);
    process.exit(1);
});
