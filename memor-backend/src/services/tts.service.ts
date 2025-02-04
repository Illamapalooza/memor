import OpenAI from "openai";
import { logger } from "../utils/logger";
import { AppError } from "../middleware/error.middleware";

export class TTSService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  static async generateSpeech(text: string): Promise<Buffer> {
    console.log("text", text);
    try {
      const mp3 = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: "ash",
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      return buffer;
    } catch (error) {
      logger.error("Error generating speech:", error);
      throw new AppError(500, "Failed to generate speech");
    }
  }
}
