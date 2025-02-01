import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "langchain/document";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

dotenv.config();

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is required");
}

if (!process.env.PINECONE_ENVIRONMENT) {
  throw new Error("PINECONE_ENVIRONMENT is required");
}

export class PineconeService {
  private static instance: PineconeService;
  private pinecone: Pinecone;
  private embeddings: OpenAIEmbeddings;
  private vectorStore: PineconeStore | null = null;
  private readonly indexName = "megamind-index";

  private constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-small",
    });
  }

  public static getInstance(): PineconeService {
    if (!PineconeService.instance) {
      PineconeService.instance = new PineconeService();
    }
    return PineconeService.instance;
  }

  private async initVectorStore() {
    if (!this.vectorStore) {
      const index = this.pinecone.Index(this.indexName);
      this.vectorStore = await PineconeStore.fromExistingIndex(
        this.embeddings,
        { pineconeIndex: index }
      );
    }
    return this.vectorStore;
  }

  async addDocuments(documents: Document[]) {
    const vectorStore = await this.initVectorStore();
    await vectorStore.addDocuments(documents);
  }

  async similaritySearch(
    query: string,
    k: number = 4,
    filter?: Record<string, any>
  ) {
    const vectorStore = await this.initVectorStore();
    return await vectorStore.similaritySearch(query, k, filter);
  }

  async addOrUpdateDocument(document: Document) {
    const vectorStore = await this.initVectorStore();

    // First try to find existing document by noteId
    const existing = await vectorStore.similaritySearch("", 1, {
      noteId: document.metadata.noteId,
    });

    if (existing.length > 0) {
      // If exists, delete old vector before adding new one
      await this.deleteDocumentsByMetadata({
        noteId: document.metadata.noteId,
      });
    }

    // Add new/updated vector
    await vectorStore.addDocuments([document]);
  }

  async deleteDocumentsByMetadata(filter: Record<string, any>) {
    try {
      const index = this.pinecone.Index(this.indexName);

      // First, find vectors matching the filter
      const queryResponse = await index.query({
        vector: new Array(1536).fill(0), // Dummy vector for metadata-only query
        filter: filter,
        topK: 100, // Adjust based on your needs
        includeMetadata: true,
      });

      if (queryResponse.matches && queryResponse.matches.length > 0) {
        // Get all IDs that match the filter
        const ids = queryResponse.matches.map((match) => match.id);

        // Delete vectors by IDs
        await index.deleteMany(ids);
        logger.info(`Deleted ${ids.length} vectors with filter:`, filter);
      } else {
        logger.info("No vectors found matching filter:", filter);
      }
    } catch (error) {
      logger.error("Error deleting vectors:", error);
      throw error;
    }
  }
}
