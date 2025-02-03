import { Request, Response } from "express";
import { TranscriptionService } from "../services/transcription.service";
import { AppError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";

export class TranscriptionController {
  static async transcribeAudio(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw new AppError(400, "No audio file provided");
      }

      const result = await TranscriptionService.transcribeAudio(req.file);
      res.json(result);
    } catch (error) {
      logger.error("Error in transcribeAudio:", error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Error transcribing audio" });
      }
    }
  }
}
