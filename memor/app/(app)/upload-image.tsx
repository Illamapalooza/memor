import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
  Text as RNText,
  Dimensions,
  ListRenderItemInfo,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagePicker } from "@/components/ui/ImagePicker/ImagePicker";
import { Text } from "@/components/ui/Text/Text";
import { PrimaryButton, OutlineButton } from "@/components/ui/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ImageAnalysisService } from "@/services/ai/imageAnalysis.service";
import { StorageService } from "@/services/storage/storage.service";
import { useAuth } from "@/services/auth/AuthProvider";
import { colors } from "@/utils/theme";

const { width } = Dimensions.get("window");
const imageSize = (width - 48) / 2; // 2 images per row with padding

export default function UploadImageScreen() {
  const [selectedImageUris, setSelectedImageUris] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLargePreview, setShowLargePreview] = useState(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const theme = useAppTheme();
  const { userProfile } = useAuth();

  const handleImageSelected = (uris: string[]) => {
    setSelectedImageUris(uris);
  };

  const handleImageUploaded = (imageUrl: string) => {
    // Each time an image is uploaded, add it to our array
    setUploadedImageUrls((prev) => [...prev, imageUrl]);
  };

  const handlePickImage = async () => {
    try {
      const result = await StorageService.pickImage();

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUris = result.assets.map((asset) => asset.uri);
        setSelectedImageUris(selectedUris);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await StorageService.takePhoto();

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImageUris((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo.");
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImageUris((prev) => {
      const newUris = [...prev];
      newUris.splice(index, 1);
      return newUris;
    });
  };

  // Helper function to validate and fix image URLs if needed
  const validateImageUrl = (url: string): string => {
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
  };

  const handleUploadImages = async () => {
    if (!userProfile?.id || selectedImageUris.length === 0) {
      Alert.alert("Error", "Please select at least one image first.");
      return;
    }

    setIsUploading(true);
    try {
      // Upload all selected images and collect the URLs
      const uploadedUrls: string[] = [];
      for (const uri of selectedImageUris) {
        let imageUrl = await StorageService.uploadImage(userProfile.id, uri);
        // Double-check URL formatting is correct
        imageUrl = validateImageUrl(imageUrl);
        uploadedUrls.push(imageUrl);
      }

      // Log for debugging
      console.log(
        "[UploadImageScreen] Upload complete. Image URLs:",
        uploadedUrls
      );

      // Update state with all uploaded URLs
      setUploadedImageUrls(uploadedUrls);

      // After uploading, analyze the images with the collected URLs
      handleAnalyzeImages(uploadedUrls);
    } catch (error) {
      Alert.alert("Error", "Failed to upload images.");
      setIsUploading(false);
    }
  };

  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/__(.*?)__/g, "$1") // Remove underline
      .replace(/~~(.*?)~~/g, "$1") // Remove strikethrough
      .replace(/`(.*?)`/g, "$1"); // Remove code
    // Note: Keep # characters for headings
  };

  const handleAnalyzeImages = async (imageUrls: string[]) => {
    setIsAnalyzing(true);

    try {
      // Ensure all URLs are properly formatted
      const validatedUrls = imageUrls.map(validateImageUrl);
      console.log(
        "[UploadImageScreen] Using validated URLs for analysis:",
        validatedUrls
      );

      // Use the multi-image analysis service with the validated URLs
      const analysisResult = await ImageAnalysisService.analyzeMultipleImages(
        validatedUrls
      );

      let content = "";

      if (analysisResult.isAcademic) {
        // Format academic notes
        content = `# ${cleanMarkdown(analysisResult.title)}

## Description
${cleanMarkdown(analysisResult.description)}

## Content
${cleanMarkdown(analysisResult.content)}

## Key Concepts
${analysisResult.keyConcepts
  .map((concept) => `- ${cleanMarkdown(concept)}`)
  .join("\n")}

## Examples
${analysisResult.examples
  .map((example) => `- ${cleanMarkdown(example)}`)
  .join("\n")}

## Exercises
${analysisResult.exercises
  .map((exercise) => `- ${cleanMarkdown(exercise)}`)
  .join("\n")}

## Resources
${analysisResult.resources
  .map((resource) => `- ${cleanMarkdown(resource)}`)
  .join("\n")}

## Tags
${analysisResult.tags.map((tag) => `#${tag}`).join(" ")}`;
      } else {
        // Format general content
        content = `# ${cleanMarkdown(analysisResult.title)}

## Description
${cleanMarkdown(analysisResult.description)}

## Details
${cleanMarkdown(analysisResult.content)}`;
      }

      // Reset states
      setSelectedImageUris([]);
      setUploadedImageUrls([]);
      setShowLargePreview(false);

      // Navigate to create screen with the analyzed content and image URLs
      router.push({
        pathname: "/create",
        params: {
          title: cleanMarkdown(analysisResult.title),
          content: content,
          imageUrls: JSON.stringify(validatedUrls), // Pass image URLs as JSON string
        },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to analyze image.");
    } finally {
      setIsAnalyzing(false);
      setIsUploading(false);
    }
  };

  // Keep this method for backward compatibility
  const handleAnalyzeImage = async () => {
    if (uploadedImageUrls.length === 0) {
      Alert.alert("Error", "Please upload at least one image first.");
      return;
    }

    handleAnalyzeImages(uploadedImageUrls);
  };

  const handleBack = () => {
    if (showLargePreview) {
      setShowLargePreview(false);
    } else {
      router.back();
    }
  };

  const handleRechoose = () => {
    setSelectedImageUris([]);
    setShowLargePreview(false);
  };

  const handleImagePress = (index: number) => {
    setSelectedPreviewIndex(index);
    setShowLargePreview(true);
  };

  const renderImageGrid = () => {
    return (
      <View style={styles.imageGridContainer}>
        {selectedImageUris.map((uri, index) => (
          <View key={index} style={styles.gridImageContainer}>
            <Image
              source={{ uri }}
              style={styles.gridImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              placeholder={{ color: colors.blackOlive[200] }}
            />
            <View style={styles.indexBadge}>
              <RNText style={styles.indexText}>{index + 1}</RNText>
            </View>
            <Pressable
              onPress={() => handleRemoveImage(index)}
              style={styles.removeButton}
            >
              <Ionicons name="close-circle" size={24} color="white" />
            </Pressable>
            <Pressable
              onPress={() => handleImagePress(index)}
              style={styles.fullScreenButton}
            >
              <Ionicons name="expand" size={24} color="white" />
            </Pressable>
          </View>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back-outline" size={24} color="#E74C3C" />
            <RNText style={styles.backText}>Back</RNText>
          </Pressable>
          <Text variant="h2" style={styles.title}>
            Image to Notes
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Description text */}
          <Text variant="body" style={styles.description}>
            Upload a photo of your lecture notes, textbook page, or any
            educational material, and our AI will convert it into structured
            digital notes.
          </Text>

          {selectedImageUris.length > 0 ? (
            // Images are selected
            <View>
              {showLargePreview ? (
                // Show large preview of selected image
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: selectedImageUris[selectedPreviewIndex] }}
                    style={styles.mainImagePreview}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.imageCountBadge}>
                    <RNText style={styles.imageCountText}>
                      {selectedPreviewIndex + 1}/{selectedImageUris.length}
                    </RNText>
                  </View>
                </View>
              ) : (
                // Show grid of all images
                renderImageGrid()
              )}

              {/* Upload and Rechoose buttons */}
              <View style={styles.actionButtonsContainer}>
                <OutlineButton
                  onPress={handleRechoose}
                  style={styles.rechooseButton}
                >
                  Rechoose
                </OutlineButton>

                <PrimaryButton
                  onPress={handleUploadImages}
                  style={styles.uploadButton}
                  loading={isUploading || isAnalyzing}
                >
                  Upload {selectedImageUris.length}{" "}
                  {selectedImageUris.length === 1 ? "Image" : "Images"}
                </PrimaryButton>
              </View>
            </View>
          ) : (
            // No images selected yet
            <View style={styles.pickerContainer}>
              <PrimaryButton
                onPress={handlePickImage}
                style={styles.selectButton}
              >
                Choose from Library
              </PrimaryButton>

              <PrimaryButton
                onPress={handleTakePhoto}
                style={styles.takePhotoButton}
              >
                Take Photo
              </PrimaryButton>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    flex: 1,
    textAlign: "center",
    marginRight: 40, // To center the title accounting for the back button
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  description: {
    marginBottom: 24,
    textAlign: "center",
  },
  imagePreviewContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  mainImagePreview: {
    width: "100%",
    height: 400,
    borderRadius: 12,
  },
  imageCountBadge: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  imageCountText: {
    color: "white",
    fontWeight: "bold",
  },
  imageGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gridImageContainer: {
    position: "relative",
    width: imageSize,
    height: imageSize,
    marginBottom: 8,
  },
  gridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  indexBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(231, 76, 60, 0.7)",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreenButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 4,
  },
  rechooseButton: {
    flex: 1,
    marginRight: 8,
    borderColor: "#E74C3C",
    borderWidth: 2,
  },
  uploadButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#E74C3C",
  },
  pickerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 16,
  },
  selectButton: {
    width: "100%",
    backgroundColor: "#E74C3C",
  },
  takePhotoButton: {
    width: "100%",
    backgroundColor: "#E74C3C",
  },
});
