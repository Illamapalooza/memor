import { Alert } from "react-native";
import { API_URL } from "@/utils/config";

// Define the response structure for academic notes
interface AcademicNotesResponse {
  title: string;
  tags: string[];
  description: string;
  content: string;
  examples: string[];
  exercises: string[];
  keyConcepts: string[];
  resources: string[];
  isAcademic: true;
}

// Define the response structure for general images
interface GeneralImageResponse {
  title: string;
  description: string;
  content: string;
  isAcademic: false;
}

type ImageAnalysisResponse = AcademicNotesResponse | GeneralImageResponse;

export class ImageAnalysisService {
  /**
   * Helper function to validate and fix Firebase Storage image URLs
   */
  private static validateImageUrl(url: string): string {
    if (!url) return url;

    // Make sure Firebase Storage URLs have properly encoded path segments
    if (url.includes("/o/users/")) {
      const regex = /\/o\/users\/([^\/]+)\/images\/([^?]+)/;
      const match = url.match(regex);

      if (match) {
        const userId = match[1];
        const fileName = match[2];

        // Rebuild the URL with proper URL encoding
        const baseUrl = url.split("/o/")[0];
        const queryParams = url.split("?")[1];

        return `${baseUrl}/o/users%2F${userId}%2Fimages%2F${fileName}?${queryParams}`;
      }
    }

    return url;
  }

  /**
   * Clean Markdown symbols from text content
   * Removes formatting like #, **, *, etc.
   */
  private static cleanMarkdownSymbols(text: string): string {
    if (!text) return text;

    // Replace heading markers (#, ##, ###, etc.)
    let cleaned = text.replace(/#+\s*/g, "");

    // Replace bold/italic markers (**, *)
    cleaned = cleaned.replace(/\*\*/g, "");
    cleaned = cleaned.replace(/\*/g, "");

    // Replace code block markers (```)
    cleaned = cleaned.replace(/```[a-z]*\n|```/g, "");

    // Replace underscore emphasis (_)
    cleaned = cleaned.replace(/_/g, "");

    // Replace other common Markdown symbols
    cleaned = cleaned.replace(/>/g, ""); // Blockquotes
    cleaned = cleaned.replace(/^-\s+/gm, ""); // List items with dash
    cleaned = cleaned.replace(/^\+\s+/gm, ""); // List items with plus

    // Remove any double spaces created by the replacements
    cleaned = cleaned.replace(/\s{2,}/g, " ");

    return cleaned;
  }

  /**
   * Analyze a single image using AI and extract structured information
   */
  static async analyzeImage(imageUrl: string): Promise<ImageAnalysisResponse> {
    try {
      // Ensure URL is properly formatted
      const validatedUrl = this.validateImageUrl(imageUrl);
      console.log("[ImageAnalysisService] Using validated URL:", validatedUrl);

      const response = await fetch(`${API_URL}/image-analysis/generate-note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: validatedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to analyze image");
      }

      const data = await response.json();
      const { note } = data;

      // Clean the content to remove Markdown symbols
      const cleanedContent = this.cleanMarkdownSymbols(note.content);

      // Process the backend response into the expected frontend format
      // Determine if content looks academic based on tags or content
      const academicKeywords = [
        "academic",
        "lecture",
        "study",
        "education",
        "course",
        "class",
        "science",
        "math",
        "physics",
        "chemistry",
        "biology",
        "history",
        "literature",
      ];
      const isAcademic =
        note.tags.some((tag: string) =>
          academicKeywords.includes(tag.toLowerCase())
        ) ||
        academicKeywords.some((keyword) =>
          cleanedContent.toLowerCase().includes(keyword)
        );

      if (isAcademic) {
        // Extract examples, exercises, key concepts and resources from content if possible
        const examples = this.extractSection(cleanedContent, "Examples") || [];
        const exercises =
          this.extractSection(cleanedContent, "Exercises") || [];
        const keyConcepts =
          this.extractSection(cleanedContent, "Key Concepts") || [];
        const resources =
          this.extractSection(cleanedContent, "Resources") || [];

        return {
          title: note.title,
          tags: note.tags,
          description: cleanedContent.split("\n")[0], // First line as description
          content: cleanedContent,
          examples,
          exercises,
          keyConcepts,
          resources,
          isAcademic: true,
        };
      } else {
        return {
          title: note.title,
          description: cleanedContent.split("\n")[0], // First line as description
          content: cleanedContent,
          isAcademic: false,
        };
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert("Error", "Failed to analyze image. Please try again.");
      throw error;
    }
  }

  /**
   * Analyze multiple images and create a synthesized result
   */
  static async analyzeMultipleImages(
    imageUrls: string[]
  ): Promise<ImageAnalysisResponse> {
    try {
      if (imageUrls.length === 0) {
        throw new Error("No images to analyze");
      }

      // Validate all URLs before processing
      const validatedUrls = imageUrls.map((url) => this.validateImageUrl(url));
      console.log(
        "[ImageAnalysisService] Using validated URLs:",
        validatedUrls
      );

      if (validatedUrls.length === 1) {
        return this.analyzeImage(validatedUrls[0]);
      }

      // Call the backend synthesize endpoint for multiple images
      const response = await fetch(`${API_URL}/image-analysis/synthesize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrls: validatedUrls,
          prompt:
            "Analyze these images as a set. If they appear to be academic content, structure the output to include sections for Examples, Exercises, Key Concepts, and Resources where appropriate. Format as detailed text.",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to analyze images");
      }

      const data = await response.json();
      const { note } = data;

      // Clean the content to remove Markdown symbols
      const cleanedContent = this.cleanMarkdownSymbols(note.content);

      // Process the backend response into the expected frontend format
      const academicKeywords = [
        "academic",
        "lecture",
        "study",
        "education",
        "course",
        "class",
        "science",
        "math",
        "physics",
        "chemistry",
        "biology",
        "history",
        "literature",
      ];
      const isAcademic =
        note.tags.some((tag: string) =>
          academicKeywords.includes(tag.toLowerCase())
        ) ||
        academicKeywords.some((keyword) =>
          cleanedContent.toLowerCase().includes(keyword)
        );

      if (isAcademic) {
        // Extract examples, exercises, key concepts and resources from content if possible
        const examples = this.extractSection(cleanedContent, "Examples") || [];
        const exercises =
          this.extractSection(cleanedContent, "Exercises") || [];
        const keyConcepts =
          this.extractSection(cleanedContent, "Key Concepts") || [];
        const resources =
          this.extractSection(cleanedContent, "Resources") || [];

        return {
          title: note.title,
          tags: note.tags,
          description: cleanedContent.split("\n")[0], // First line as description
          content: cleanedContent,
          examples,
          exercises,
          keyConcepts,
          resources,
          isAcademic: true,
        };
      } else {
        return {
          title: note.title,
          description: cleanedContent.split("\n")[0], // First line as description
          content: cleanedContent,
          isAcademic: false,
        };
      }
    } catch (error) {
      console.error("Error analyzing multiple images:", error);
      Alert.alert("Error", "Failed to analyze images. Please try again.");
      throw error;
    }
  }

  /**
   * Helper method to extract sections from content
   */
  private static extractSection(
    content: string,
    sectionName: string
  ): string[] | null {
    const sectionRegex = new RegExp(`${sectionName}[:\\s]+((?:.+\\n?)+)`, "i");
    const match = content.match(sectionRegex);

    if (match && match[1]) {
      // Extract list items (lines starting with - or * or numbers)
      const listItems = match[1]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.match(/^[-*•]|\d+\.\s/))
        .map((line) => line.replace(/^[-*•]|\d+\.\s/, "").trim());

      return listItems.length > 0 ? listItems : [match[1].trim()];
    }

    return null;
  }
}
