import { Router } from "express";
import { TranscriptionController } from "../controllers/transcription.controller";
import multer from "multer";
import path from "path";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["audio/m4a", "audio/mp4", "audio/mpeg", "audio/wav"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."));
    }
  },
  dest: path.join(__dirname, "../temp"),
});

router.post(
  "/",
  upload.single("audio"),
  TranscriptionController.transcribeAudio
);

export const transcriptionRoutes = router;
