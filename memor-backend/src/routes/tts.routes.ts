import { Router } from "express";
import { TTSController } from "../controllers/tts.controller";

const router = Router();

router.post("/", TTSController.generateSpeech);

export const ttsRoutes = router;
