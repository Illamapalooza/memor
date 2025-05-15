import OpenAI from "openai";
import { logger } from "../utils/logger";
import { AppError } from "../middleware/error.middleware";
import { v4 as uuidv4 } from "uuid";
import { bucket } from "../services/firebase.service";

export class TTSService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  static async generateSpeech(text: string): Promise<string> {
    try {
      // Generate speech using OpenAI TTS
      const mp3 = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
      });

      // Get audio as buffer
      const buffer = Buffer.from(await mp3.arrayBuffer());

      // Upload to Firebase Storage
      const fileId = uuidv4();
      const fileName = `tts/${fileId}.mp3`;
      const file = bucket.file(fileName);

      await file.save(buffer, {
        metadata: {
          contentType: "audio/mpeg",
        },
      });

      // Create a signed URL that expires in 15 minutes (900 seconds)
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

      // Schedule file deletion after 15 minutes
      setTimeout(async () => {
        try {
          await file.delete();
          logger.info(`Deleted TTS file: ${fileName}`);
        } catch (error) {
          logger.error(`Error deleting TTS file ${fileName}:`, error);
        }
      }, 15 * 60 * 1000); // 15 minutes

      return url;
    } catch (error) {
      logger.error("Error generating speech:", error);
      throw error instanceof AppError
        ? error
        : new AppError(500, "Failed to generate speech");
    }
  }
}
