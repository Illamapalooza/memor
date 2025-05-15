import { Request, Response } from "express";
import { TranscriptionService } from "../services/transcription.service";
import { AppError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";
import { bucket } from "../services/firebase.service";
import { v4 as uuidv4 } from "uuid";
import * as Busboy from "busboy";
import path from "path";

export class TranscriptionController {
  static async transcribeAudio(req: Request, res: Response) {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const contentType = req.headers["content-type"];
      if (!contentType || !contentType.includes("multipart/form-data")) {
        throw new AppError(400, "Request must be multipart/form-data");
      }

      const busboy = Busboy.default({ headers: req.headers });
      const fields: Record<string, string> = {};
      let fileBuffer: Buffer | null = null;
      let fileInfo: { filename: string; mimeType: string } | null = null;

      // Handle form fields
      busboy.on("field", (fieldname: string, val: string) => {
        fields[fieldname] = val;
      });

      // Handle file upload
      busboy.on(
        "file",
        (
          fieldname: string,
          file: NodeJS.ReadableStream,
          info: Busboy.FileInfo
        ) => {
          const { filename, mimeType } = info;
          const allowedMimes = [
            "audio/m4a",
            "audio/mp4",
            "audio/mpeg",
            "audio/wav",
            "audio/webm",
            "audio/ogg",
            "audio/flac",
          ];

          if (!allowedMimes.includes(mimeType)) {
            throw new AppError(
              400,
              "Invalid file type. Only audio files are allowed."
            );
          }

          fileInfo = { filename, mimeType };
          const chunks: Buffer[] = [];

          file.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
          });

          file.on("end", () => {
            fileBuffer = Buffer.concat(chunks);
          });
        }
      );

      // Handle end of form parsing
      busboy.on("finish", async () => {
        try {
          if (!fileBuffer || !fileInfo) {
            throw new AppError(400, "No audio file provided");
          }

          const mode = (fields.mode || "note") as "note" | "query";
          const fileId = uuidv4();
          const fileExtension = path.extname(fileInfo.filename);

          // Map MIME types to appropriate file extensions for OpenAI
          const mimeToExt: Record<string, string> = {
            "audio/m4a": ".m4a",
            "audio/mp4": ".mp4",
            "audio/mpeg": ".mp3",
            "audio/wav": ".wav",
            "audio/webm": ".webm",
            "audio/ogg": ".ogg",
            "audio/flac": ".flac",
          };

          // Get extension based on MIME type, or use the original extension
          const ext = mimeToExt[fileInfo.mimeType] || fileExtension;
          const fileName = `audio/${fileId}${ext}`;

          logger.info(
            `Processing audio file: ${fileName}, MIME type: ${fileInfo.mimeType}`
          );

          // Upload to Firebase Storage
          const file = bucket.file(fileName);
          await file.save(fileBuffer, {
            metadata: {
              contentType: fileInfo.mimeType,
            },
          });

          // Create a signed URL that expires in 15 minutes (900 seconds)
          const [url] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 15 * 60 * 1000,
          });

          // Process the audio file
          const result = await TranscriptionService.transcribeAudioFromURL(
            url,
            mode,
            ext
          );

          // Delete the temporary file after processing
          await file.delete();

          res.json(result);
        } catch (error) {
          logger.error("Error in transcribeAudio:", error);
          if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
          } else {
            res.status(500).json({ error: "Error transcribing audio" });
          }
        }
      });

      // Pipe request to busboy
      req.pipe(busboy);
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
