import OpenAI from "openai";
import { logger } from "../utils/logger";
import { AppError } from "../middleware/error.middleware";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import { mkdir } from "fs/promises";

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export class TranscriptionService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  private static async ensureTempDir() {
    const tempDir = path.join(__dirname, "../temp");
    try {
      await mkdir(tempDir, { recursive: true });
    } catch (error) {
      if ((error as any).code !== "EEXIST") {
        throw error;
      }
    }
    return tempDir;
  }

  static async transcribeAudio(
    file: Express.Multer.File
  ): Promise<{ title: string; content: string }> {
    const tempDir = await this.ensureTempDir();
    const tempFilePath = path.join(tempDir, `${uuidv4()}-${file.originalname}`);

    console.log(tempFilePath);

    try {
      // Save uploaded file
      await writeFile(tempFilePath, file.buffer);

      // Transcribe audio
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        language: "en",
      });

      console.log(transcription.text);

      if (!transcription.text) {
        throw new AppError(500, "No transcription generated");
      }

      // Clean and organize transcription using GPT
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that organizes transcribed audio notes. 
            Your task is to:
            1. Clean up the transcription
            2. Generate a concise title
            3. Format the content with proper paragraphs and punctuation
            4. Remove filler words and repetitions
            Return the result in JSON format with 'title' and 'content' fields.`,
          },
          {
            role: "user",
            content: transcription.text,
          },
        ],
      });

      if (!completion.choices[0].message.content) {
        throw new AppError(500, "Failed to process transcription");
      }

      console.log(completion.choices[0].message.content);

      const result = JSON.parse(completion.choices[0].message.content);

      return {
        title: result.title,
        content: result.content,
      };
    } catch (error) {
      logger.error("Error transcribing audio:", error);
      throw error instanceof AppError
        ? error
        : new AppError(500, "Failed to transcribe audio");
    } finally {
      // Clean up temp file
      try {
        await unlink(tempFilePath);
      } catch (error) {
        logger.error("Error deleting temp file:", error);
      }
    }
  }
}
