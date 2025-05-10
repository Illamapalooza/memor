import OpenAI from "openai";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

dotenv.config();

export class ImageAnalysisService {
  private static instance: ImageAnalysisService;
  private openai: OpenAI;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!process.env.OPENAI_API_KEY) {
      logger.error(
        "OPENAI_API_KEY is not defined in the environment variables"
      );
      throw new Error("OPENAI_API_KEY is not defined");
    }
  }

  public static getInstance(): ImageAnalysisService {
    if (!ImageAnalysisService.instance) {
      ImageAnalysisService.instance = new ImageAnalysisService();
    }
    return ImageAnalysisService.instance;
  }

  /**
   * Analyzes an image using OpenAI's Vision API
   * @param imageUrl The URL of the image to analyze
   * @param prompt The prompt to guide the analysis
   * @returns An analysis of the image content
   */
  public async analyzeImage(
    imageUrl: string,
    prompt?: string
  ): Promise<string> {
    try {
      const defaultPrompt =
        "Analyze this image and provide a detailed description of what you see. " +
        "Extract any text, identify key objects, people, and give context about the scene.";

      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt || defaultPrompt },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      logger.error("Error analyzing image:", error);
      throw new Error(
        `Failed to analyze image: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Analyzes multiple images using OpenAI's Vision API
   * @param imageUrls An array of image URLs to analyze
   * @param prompt The prompt to guide the analysis
   * @returns An array of image analyses
   */
  public async analyzeMultipleImages(
    imageUrls: string[],
    prompt?: string
  ): Promise<string[]> {
    try {
      const analysisPromises = imageUrls.map((url) =>
        this.analyzeImage(url, prompt)
      );
      return await Promise.all(analysisPromises);
    } catch (error) {
      logger.error("Error analyzing multiple images:", error);
      throw new Error(
        `Failed to analyze multiple images: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Generates structured notes from an image
   * @param imageUrl The URL of the image to analyze
   * @returns A structured note with title, content and tags
   */
  public async generateStructuredNote(
    imageUrl: string
  ): Promise<{ title: string; content: string; tags: string[] }> {
    try {
      const prompt =
        "Analyze this image and create a structured note from it. " +
        "Extract important information, create a concise title, detailed content, and suggest " +
        "relevant tags. Format the output as detailed text.";

      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const analysisText = response.choices[0].message.content || "";

      // Process the analysis to extract structured data
      const titleMatch = analysisText.match(/Title:(.+?)(?=Content:|$)/s);
      const contentMatch = analysisText.match(/Content:(.+?)(?=Tags:|$)/s);
      const tagsMatch = analysisText.match(/Tags:(.+?)$/s);

      return {
        title: titleMatch ? titleMatch[1].trim() : "Untitled Note",
        content: contentMatch ? contentMatch[1].trim() : analysisText,
        tags: tagsMatch
          ? tagsMatch[1].split(",").map((tag) => tag.trim())
          : ["untagged"],
      };
    } catch (error) {
      logger.error("Error generating structured note from image:", error);
      throw new Error(
        `Failed to generate note: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Analyzes multiple images together and creates a synthesized output
   * @param imageUrls An array of image URLs to analyze together
   * @param prompt Optional custom prompt to guide the analysis
   * @returns A structured note synthesizing information from all images
   */
  public async synthesizeFromMultipleImages(
    imageUrls: string[],
    prompt?: string
  ): Promise<{ title: string; content: string; tags: string[] }> {
    try {
      if (!imageUrls || imageUrls.length === 0) {
        throw new Error("At least one image URL is required");
      }

      // Create content array with all images
      const contentArray: Array<OpenAI.ChatCompletionContentPart> = [
        {
          type: "text",
          text:
            prompt ||
            "Analyze these images together as a connected set. Identify relationships, " +
              "common themes, and create a single comprehensive note that synthesizes information " +
              "from all images. Focus on how they relate to each other and what story they tell together. " +
              "Create a title that encompasses all images, detailed content that connects information " +
              "from all images, and relevant tags. Format as: Title: [title], Content: [content], Tags: [comma separated tags]",
        },
      ];

      // Add each image to the content array
      imageUrls.forEach((url) => {
        contentArray.push({
          type: "image_url",
          image_url: {
            url,
            detail: "high",
          },
        });
      });

      // Call OpenAI with all images in one request
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: contentArray,
          },
        ],
        max_tokens: 2000,
      });

      const analysisText = response.choices[0].message.content || "";

      // Process the analysis to extract structured data
      const titleMatch = analysisText.match(/Title:(.+?)(?=Content:|$)/s);
      const contentMatch = analysisText.match(/Content:(.+?)(?=Tags:|$)/s);
      const tagsMatch = analysisText.match(/Tags:(.+?)$/s);

      return {
        title: titleMatch ? titleMatch[1].trim() : "Untitled Multi-Image Note",
        content: contentMatch ? contentMatch[1].trim() : analysisText,
        tags: tagsMatch
          ? tagsMatch[1].split(",").map((tag) => tag.trim())
          : ["multi-image", "untagged"],
      };
    } catch (error) {
      logger.error("Error synthesizing from multiple images:", error);
      throw new Error(
        `Failed to synthesize from multiple images: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
