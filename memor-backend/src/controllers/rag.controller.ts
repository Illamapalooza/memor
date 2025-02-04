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

      //   if (!res.writableEnded) {
      //     res.json({
      //       answer: `  "1. **Progress Update on Memory Project**: You've mentioned that the Memory project is nearing completion, with the only remaining task being the integration of Firebase storage for cloud storage capabilities. This suggests that the project is in its final stages, and you're focusing on implementing a solution for storing data online.\n" +
      // '\n' +
      // "2. **Lowkey Lyrics**: You've included the lyrics to a song that discuss themes of secret romance and discretion. The lyrics narrate a scenario where the speaker and the listener share intimate moments quietly, away from the public eye, emphasizing the desire to keep their relationship private and lowkey. The song seems to explore feelings of attraction and the thrill of a covert connection, with repeated mentions of avoiding attention and staying discreet.\n" +
      // '\n' +
      // "3. **Expo React Deployment on the EAS**: You've noted that the Memoir application should operate smoothly when deployed on the Expo Application Services (EAS) using Expo React, addressing Nathan specifically. This suggests that there's a plan or recommendation for deploying an application using specific technology (Expo React) and platform (EAS), indicating a technical aspect of a project that likely involves app development or deployment considerations.\n" +
      // '\n' +
      // 'Overall, your notes span technical project updates, creative content in the form of song lyrics, and specific technical advice or instructions regarding app deployment. Each entry serves a distinct purpose, from project management and artistic expression to technical guidance.`,
      //       relevantNotes: [
      //         {
      //           content:
      //             "1. **Progress Update on Memory Project**: You've mentioned that the Memory project is nearing completion, with the only remaining task being the integration of Firebase storage for cloud storage capabilities. This suggests that the project is in its final stages, and you're focusing on implementing a solution for storing data online.\n",
      //           metadata: {
      //             noteId: "1",
      //             title: "Progress Update on Memory Project",
      //             userId: "1",
      //           },
      //         },
      //       ],
      //     });
      //   }
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
