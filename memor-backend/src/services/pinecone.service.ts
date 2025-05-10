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
  private readonly maxRetries = 3;
  private readonly batchSize = 20; // Process documents in batches
  private readonly relevanceThreshold = 0.5; // Lowered from 0.65 for even more lenient matching

  private constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    // Use text-embedding-3-small for better efficiency
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-small",
      stripNewLines: true, // Remove unnecessary newlines to save tokens
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

    // Process in batches to optimize API calls
    if (documents.length > this.batchSize) {
      for (let i = 0; i < documents.length; i += this.batchSize) {
        const batch = documents.slice(i, i + this.batchSize);
        await vectorStore.addDocuments(batch);
        logger.info(
          `Added batch ${i / this.batchSize + 1} of documents to Pinecone`
        );
      }
    } else {
      await vectorStore.addDocuments(documents);
    }
  }

  async similaritySearch(
    query: string,
    k: number = 4,
    filter?: Record<string, any>
  ): Promise<Document[]> {
    try {
      const vectorStore = await this.initVectorStore();
      // Trim query to essential parts to save on embedding tokens
      const trimmedQuery = query.trim().substring(0, 300);
      return await vectorStore.similaritySearch(trimmedQuery, k, filter);
    } catch (error) {
      logger.error("Error in similarity search:", error);
      // Retry with smaller k value on error
      if (k > 1) {
        logger.info(`Retrying similarity search with smaller k=${k - 1}`);
        return this.similaritySearch(query, k - 1, filter);
      }
      throw error;
    }
  }

  /**
   * Checks if the documents are actually relevant to the query
   * @param query The user's query
   * @param docs The documents retrieved from the vector store
   * @returns True if at least one document is determined to be relevant
   */
  async hasRelevantInformation(
    query: string,
    docs: Document[]
  ): Promise<boolean> {
    try {
      if (docs.length === 0) {
        return false;
      }

      // With 5 or more documents, assume at least one is relevant
      if (docs.length >= 5) {
        return true;
      }

      // Get the embedding for the query
      const queryEmbedding = await this.embeddings.embedQuery(query);

      // Get embeddings for the documents
      const docsContent = docs.map((doc) => doc.pageContent);
      const docsEmbeddings = await this.embeddings.embedDocuments(docsContent);

      // Calculate cosine similarity between query and each document
      let highestSimilarity = 0;
      for (let i = 0; i < docsEmbeddings.length; i++) {
        const similarity = this.calculateCosineSimilarity(
          queryEmbedding,
          docsEmbeddings[i]
        );

        highestSimilarity = Math.max(highestSimilarity, similarity);

        // If any document exceeds the relevance threshold, consider it relevant
        if (similarity >= this.relevanceThreshold) {
          logger.info(
            `Document ${i} is relevant with similarity score: ${similarity}`
          );
          return true;
        }

        logger.info(`Document ${i} similarity score: ${similarity}`);
      }

      // If highest similarity is at least 0.4, consider it somewhat relevant
      if (highestSimilarity >= 0.4) {
        logger.info(
          `Found somewhat relevant document with similarity: ${highestSimilarity}`
        );
        return true;
      }

      // No documents met the relevance threshold
      return false;
    } catch (error) {
      logger.error("Error in hasRelevantInformation:", error);
      // Default to true in case of errors to avoid blocking valid queries
      return true;
    }
  }

  /**
   * Calculates the cosine similarity between two vectors
   * @param vecA First vector
   * @param vecB Second vector
   * @returns Cosine similarity score (0-1)
   */
  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
    }

    // Calculate magnitudes
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < vecA.length; i++) {
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }

    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    // Calculate cosine similarity
    if (magA === 0 || magB === 0) {
      return 0;
    }

    return dotProduct / (magA * magB);
  }

  async addOrUpdateDocument(document: Document) {
    const vectorStore = await this.initVectorStore();

    try {
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
    } catch (error) {
      logger.error("Error in addOrUpdateDocument:", error);
      throw error;
    }
  }

  async deleteDocumentsByMetadata(filter: Record<string, any>) {
    try {
      const index = this.pinecone.Index(this.indexName);

      // First, find vectors matching the filter
      const queryResponse = await index.query({
        vector: new Array(1536).fill(0), // Dummy vector for metadata-only query, reduced dimensions
        filter: filter,
        topK: 50, // Reduced from 100 to 50
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
