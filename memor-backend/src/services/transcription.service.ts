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

type TranscriptionMode = "note" | "query";

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
    file: Express.Multer.File,
    mode: TranscriptionMode = "note"
  ): Promise<{ title?: string; content: string }> {
    const tempDir = await this.ensureTempDir();
    const tempFilePath = path.join(tempDir, `${uuidv4()}-${file.originalname}`);

    try {
      // Save uploaded file
      await writeFile(tempFilePath, file.buffer);

      // Transcribe audio
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        language: "en",
      });

      if (!transcription.text) {
        throw new AppError(500, "No transcription generated");
      }

      // Different processing based on mode
      if (mode === "query") {
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `Convert this transcribed audio into a clear question while maintaining the original intent and words.
              Your task is to:
              1. Remove filler words and speech artifacts (oh's, umms, hmm, etc.)
              2. Correct grammar WITHOUT changing the original words used in the query
              3. Preserve the exact terminology, names, and specific references used by the speaker
              4. Only if absolutely necessary to make sense, modify words, but ALWAYS prioritize maintaining the original intent and vocabulary
              5. DO NOT make the question more formal if it changes the original wording
              6. Ensure the question remains in the speaker's own voice and style`,
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

        return {
          content: completion.choices[0].message.content.trim(),
        };
      }

      // Original note processing
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that organizes transcribed audio notes while preserving the original content.
            Your task is to:
            1. Clean up the transcription by removing filler words (oh's, umms, hmm, etc.)
            2. Generate a concise title based on the main topic
            3. Format the content with proper paragraphs and punctuation
            4. Correct grammar errors WITHOUT changing the original words used
            5. Preserve the exact terminology, names, and specific references 
            6. Only if absolutely necessary to make sense, modify words, but ALWAYS prioritize maintaining the original intent and vocabulary
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
