import { Request, Response } from "express";
import { ChatOpenAI } from "@langchain/openai";
import { PineconeService } from "../services/pinecone.service";
import { AppError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";
import { Document } from "langchain/document";
import { auth } from "../services/firebase.service";

export class RAGController {
  static async queryNotes(req: Request, res: Response) {
    // Set up response headers for potential cancellation
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", "application/json");

    // Handle client disconnection
    req.on("close", () => {
      logger.info("Client closed connection");
      // Any cleanup needed
    });

    try {
      const { query } = req.body;
      const authHeader = req.headers.authorization;

      console.log("query", query);

      if (!authHeader) {
        throw new AppError(401, "No authorization token provided");
      }

      if (!query) {
        throw new AppError(400, "Query is required");
      }

      // Verify Firebase token
      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;

      // Initialize services
      const pineconeService = PineconeService.getInstance();
      const model = new ChatOpenAI({
        modelName: "gpt-4-turbo-preview",
        temperature: 0.7,
      });

      // Perform similarity search with metadata filter for user's notes
      const relevantDocs = await pineconeService.similaritySearch(query, 4, {
        userId: userId,
      });

      // Construct prompt with context
      const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");
      const prompt = `
        Context from your notes: ${context}
        
        Question: ${query}
        
        Please provide a detailed answer based on the context from the notes. If the notes don't contain relevant information, please indicate that.
      `;

      // Generate response
      const response = await model.invoke(prompt);

      console.log("response", response);

      // Check if client is still connected before sending response
      if (!res.writableEnded) {
        res.json({
          answer: response.content,
          relevantNotes: relevantDocs.map((doc) => ({
            content: doc.pageContent,
            metadata: doc.metadata,
          })),
        });
      }
    } catch (error) {
      logger.error("Error in RAG query:", error);
      throw new AppError(500, "Error processing RAG query");
    }
  }

  static async addDocument(req: Request, res: Response) {
    try {
      const { content, metadata } = req.body;

      if (!content) {
        throw new AppError(400, "Content is required");
      }

      const pineconeService = PineconeService.getInstance();
      await pineconeService.addDocuments([
        new Document({ pageContent: content, metadata }),
      ]);

      res.json({ message: "Document added successfully" });
    } catch (error) {
      logger.error("Error adding document:", error);
      throw new AppError(500, "Error adding document");
    }
  }
}
