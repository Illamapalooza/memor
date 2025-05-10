import { Request, Response } from "express";
import { ImageAnalysisService } from "../services/image-analysis.service";
import { logger } from "../utils/logger";

export class ImageAnalysisController {
  /**
   * Analyze an image using OpenAI's Vision API
   */
  public static async analyzeImage(req: Request, res: Response): Promise<void> {
    try {
      const { imageUrl, prompt } = req.body;

      if (!imageUrl) {
        res.status(400).json({ error: "Image URL is required" });
        return;
      }

      const imageAnalysisService = ImageAnalysisService.getInstance();
      const analysis = await imageAnalysisService.analyzeImage(
        imageUrl,
        prompt
      );

      res.status(200).json({ analysis });
    } catch (error) {
      logger.error("Error in analyzeImage controller:", error);
      res.status(500).json({
        error: "Failed to analyze image",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Analyze multiple images using OpenAI's Vision API
   */
  public static async analyzeMultipleImages(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { imageUrls, prompt } = req.body;

      if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
        res
          .status(400)
          .json({ error: "Valid array of image URLs is required" });
        return;
      }

      const imageAnalysisService = ImageAnalysisService.getInstance();
      const analyses = await imageAnalysisService.analyzeMultipleImages(
        imageUrls,
        prompt
      );

      res.status(200).json({ analyses });
    } catch (error) {
      logger.error("Error in analyzeMultipleImages controller:", error);
      res.status(500).json({
        error: "Failed to analyze multiple images",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Generate structured note from an image
   */
  public static async generateStructuredNote(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        res.status(400).json({ error: "Image URL is required" });
        return;
      }

      const imageAnalysisService = ImageAnalysisService.getInstance();
      const note = await imageAnalysisService.generateStructuredNote(imageUrl);

      res.status(200).json({ note });
    } catch (error) {
      logger.error("Error in generateStructuredNote controller:", error);
      res.status(500).json({
        error: "Failed to generate structured note from image",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Synthesize a single structured note from multiple images
   */
  public static async synthesizeFromMultipleImages(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { imageUrls, prompt } = req.body;

      if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
        res
          .status(400)
          .json({ error: "Valid array of image URLs is required" });
        return;
      }

      const imageAnalysisService = ImageAnalysisService.getInstance();
      const synthesizedNote =
        await imageAnalysisService.synthesizeFromMultipleImages(
          imageUrls,
          prompt
        );

      res.status(200).json({ note: synthesizedNote });
    } catch (error) {
      logger.error("Error in synthesizeFromMultipleImages controller:", error);
      res.status(500).json({
        error: "Failed to synthesize note from multiple images",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
