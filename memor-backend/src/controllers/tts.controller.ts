import { Request, Response } from "express";
import { TTSService } from "../services/tts.service";
import { AppError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";

export class TTSController {
  static async generateSpeech(req: Request, res: Response) {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        throw new AppError(400, "Text is required");
      }

      const audioUrl = await TTSService.generateSpeech(text);
      res.json({ audioUrl });
    } catch (error) {
      logger.error("Error in generateSpeech:", error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Error generating speech" });
      }
    }
  }
}
