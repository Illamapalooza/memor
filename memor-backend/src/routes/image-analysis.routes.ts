import express from "express";
import { ImageAnalysisController } from "../controllers/image-analysis.controller";

const router = express.Router();

router.post("/analyze", ImageAnalysisController.analyzeImage);
router.post("/analyze-multiple", ImageAnalysisController.analyzeMultipleImages);
router.post("/generate-note", ImageAnalysisController.generateStructuredNote);
router.post(
  "/synthesize",
  ImageAnalysisController.synthesizeFromMultipleImages
);

export const imageAnalysisRoutes = router;
