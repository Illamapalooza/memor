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

    // // Handle client disconnection
    // req.on("close", () => {
    //   logger.info("Client closed connection");
    //   // Any cleanup needed
    // });

    try {
      const { query } = req.body;
      const authHeader = req.headers.authorization;
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
        modelName: "gpt-3.5-turbo", // Use a smaller model to reduce token costs
        temperature: 0.7, // Increased temperature for more conversational responses
        maxTokens: 500, // Limit the response length
      });

      // Retrieve only the most relevant documents
      const k = 5; // Increased from 3 to 5 documents to get more context
      const relevantDocs = await pineconeService.similaritySearch(query, k, {
        userId: userId,
      });

      // Check if we found any relevant documents
      if (relevantDocs.length === 0) {
        // No relevant documents found - respond in a casual, friendly way
        return res.json({
          answer: `Hey, I looked through your notes but couldn't find anything about "${query}". Maybe add some notes on this topic when you get a chance? I'd be happy to help once you do!`,
          relevantNotes: [],
        });
      }

      // Check if documents are actually relevant using similarity score
      const hasRelevantInfo = await pineconeService.hasRelevantInformation(
        query,
        relevantDocs
      );

      if (!hasRelevantInfo) {
        // Found documents but they're not relevant - respond in a conversational way
        return res.json({
          answer: `So I found some of your notes, but honestly, they don't seem to mention much about "${query}". I wonder if you've written about this somewhere else? Or maybe try asking in a different way and I'll see what I can find!`,
          relevantNotes: relevantDocs.map((doc) => ({
            content: doc.pageContent,
            metadata: doc.metadata,
          })),
        });
      }

      // Truncate long documents to essential content
      const truncatedDocs = relevantDocs.map((doc) => {
        const content = doc.pageContent;
        if (content.length > 800) {
          // Increased from 500 to 800 to include more context
          return {
            ...doc,
            pageContent: content.substring(0, 800) + "...",
          };
        }
        return doc;
      });

      // Construct a prompt with a conversational, friendly tone
      const context = truncatedDocs.map((doc) => doc.pageContent).join("\n\n");

      // Generate response using messages with tuples format (role, content)
      const response = await model.invoke([
        [
          "system",
          "You are Memor, a friendly and helpful AI assistant who speaks in a warm, casual tone. You sound like a close friend chatting over coffee. You're enthusiastic about helping users with their notes, and you make conversation feel natural and engaging. Avoid formal language or academic phrasing. If you don't have enough information in the notes to answer well, be honest and say so in a friendly way.",
        ],
        [
          "user",
          `I found these notes that might help answer your question:

${context}

Your question was: "${query}"

Could you help me understand what these notes tell me about this? If the notes don't really answer the question, just be honest and tell me you don't have enough info in a friendly way.`,
        ],
      ]);

      // Return the raw response without any cleaning or formatting
      const processedResponse = response.content.toString();

      // Check if client is still connected before sending response
      if (!res.writableEnded) {
        res.json({
          answer: processedResponse,
          relevantNotes: truncatedDocs.map((doc) => ({
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
