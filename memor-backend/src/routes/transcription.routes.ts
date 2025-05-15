import { Router } from "express";
import { TranscriptionController } from "../controllers/transcription.controller";

const router = Router();

router.post("/", TranscriptionController.transcribeAudio);

export const transcriptionRoutes = router;
