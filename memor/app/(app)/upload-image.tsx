import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  Easing,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text/Text";
import { PrimaryButton, OutlineButton } from "@/components/ui/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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

  // Animation values
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const loadingRotate = useRef(new Animated.Value(0)).current;
  const loadingScale = useRef(new Animated.Value(0)).current;

  // Set up floating animations
  useEffect(() => {
    const startAnimation = () => {
      // Main document icon animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim1, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim1, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Sparkles icon animation (slightly different timing for visual interest)
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim2, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim2, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimation();

    return () => {
      // Clean up animations
      floatAnim1.stopAnimation();
      floatAnim2.stopAnimation();
    };
  }, []);

  // Set up loading animations
  useEffect(() => {
    if (isUploading || isAnalyzing) {
      // Start upload animation when loading state is true
      loadingScale.setValue(0);
      Animated.timing(loadingScale, {
        toValue: 1,
        duration: 400,
        easing: Easing.back(1.5),
        useNativeDriver: true,
      }).start();

      // Floating animation for the loading icons
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(loadingAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotation animation for the main loading icon
      Animated.loop(
        Animated.timing(loadingRotate, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Stop and reset animations when loading is done
      loadingAnim.stopAnimation();
      loadingRotate.stopAnimation();

      Animated.timing(loadingScale, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      loadingAnim.stopAnimation();
      loadingRotate.stopAnimation();
    };
  }, [isUploading, isAnalyzing]);

  // Transform interpolations
  const documentIconTransform = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10], // Float up and down by 10 pixels
  });

  const sparklesIconTransform = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8], // Float up and down by 8 pixels
  });

  // Loading animation interpolations
  const loadingIconTransform = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15], // Float up and down by 15 pixels
  });

  const loadingRotation = loadingRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const loadingScaleTransform = loadingScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const loadingOpacity = loadingScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

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
          <View
            key={index}
            style={[
              styles.gridImageContainer,
              { borderColor: `${theme.colors.primary}30` }, // 30 is for opacity
            ]}
          >
            <Image
              source={{ uri }}
              style={styles.gridImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              placeholder={{ color: colors.blackOlive[200] }}
            />
            <View
              style={[
                styles.indexBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <RNText style={styles.indexText}>{index + 1}</RNText>
            </View>
            <Pressable
              onPress={() => handleRemoveImage(index)}
              style={[
                styles.removeButton,
                { backgroundColor: `${theme.colors.primary}E6` },
              ]}
            >
              <Ionicons name="close-circle" size={24} color="white" />
            </Pressable>
            <Pressable
              onPress={() => handleImagePress(index)}
              style={[
                styles.fullScreenButton,
                { backgroundColor: `${theme.colors.primary}CC` },
              ]}
            >
              <Ionicons name="expand" size={24} color="white" />
            </Pressable>
          </View>
        ))}
      </View>
    );
  };

  // Render loading overlay
  const renderLoadingOverlay = () => {
    if (!isUploading && !isAnalyzing) return null;

    return (
      <Animated.View
        style={[
          styles.loadingOverlay,
          {
            opacity: loadingOpacity,
            transform: [{ scale: loadingScaleTransform }],
          },
        ]}
      >
        <View style={styles.loadingContent}>
          <Animated.View
            style={[
              styles.loadingIconContainer,
              { transform: [{ translateY: loadingIconTransform }] },
            ]}
          >
            <Animated.View
              style={[
                styles.loadingMainIcon,
                {
                  backgroundColor: theme.colors.primary,
                  transform: [{ rotate: loadingRotation }],
                },
              ]}
            >
              <Ionicons name="sync" size={32} color="white" />
            </Animated.View>

            <View style={styles.loadingIconsRow}>
              <Animated.View
                style={[
                  styles.loadingSecondaryIcon,
                  {
                    backgroundColor: `${theme.colors.primary}CC`,
                    transform: [
                      {
                        translateY: loadingAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="image-outline" size={18} color="white" />
              </Animated.View>

              <Animated.View
                style={[
                  styles.loadingSecondaryIcon,
                  {
                    backgroundColor: `${theme.colors.primary}CC`,
                    transform: [
                      {
                        translateY: loadingAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -20],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="white"
                />
              </Animated.View>

              <Animated.View
                style={[
                  styles.loadingSecondaryIcon,
                  {
                    backgroundColor: `${theme.colors.primary}CC`,
                    transform: [
                      {
                        translateY: loadingAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="sparkles-outline" size={18} color="white" />
              </Animated.View>
            </View>
          </Animated.View>

          <Text
            variant="h3"
            style={[styles.loadingTitle, { color: theme.colors.primary }]}
          >
            {isAnalyzing ? "Analyzing Notes" : "Uploading Images"}
          </Text>

          <Text
            variant="body"
            style={[
              styles.loadingDescription,
              { color: theme.colors.onSurface },
            ]}
          >
            {isAnalyzing
              ? "Our AI is processing your images into structured notes..."
              : "Preparing your images for analysis..."}
          </Text>
        </View>
      </Animated.View>
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
            <Ionicons
              name="chevron-back-outline"
              size={24}
              color={theme.colors.primary}
            />
            <RNText style={[styles.backText, { color: theme.colors.primary }]}>
              Back
            </RNText>
          </Pressable>
        </View>

        {/* Loading overlay */}
        {renderLoadingOverlay()}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {selectedImageUris.length > 0 ? (
            // Images are selected
            <View style={styles.selectedImagesContainer}>
              {/* Title for selected images */}
              <View style={styles.sectionTitleContainer}>
                <Text
                  variant="h2"
                  style={[styles.sectionTitle, { color: theme.colors.primary }]}
                >
                  Your Selected Images
                </Text>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.sectionSubtitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {selectedImageUris.length}{" "}
                  {selectedImageUris.length === 1 ? "photo" : "photos"} ready
                  for conversion
                </Text>
              </View>

              {showLargePreview ? (
                // Show large preview of selected image
                <View
                  style={[
                    styles.imagePreviewContainer,
                    { borderColor: `${theme.colors.primary}20` }, // 20 is for opacity
                  ]}
                >
                  <Image
                    source={{ uri: selectedImageUris[selectedPreviewIndex] }}
                    style={styles.mainImagePreview}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                  />
                  <View
                    style={[
                      styles.imageCountBadge,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
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
                  style={[
                    styles.rechooseButton,
                    { borderColor: theme.colors.primary },
                  ]}
                >
                  Rechoose
                </OutlineButton>

                <PrimaryButton
                  onPress={handleUploadImages}
                  style={[
                    styles.uploadButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  Upload {selectedImageUris.length}{" "}
                  {selectedImageUris.length === 1 ? "Image" : "Images"}
                </PrimaryButton>
              </View>
            </View>
          ) : (
            // No images selected yet
            <View style={styles.emptyStateContainer}>
              {/* Catchy Heading */}
              <Text
                variant="h1"
                style={[styles.heading, { color: theme.colors.primary }]}
              >
                Transform Your Notes
              </Text>

              <Text
                variant="h3"
                style={[styles.subheading, { color: theme.colors.onSurface }]}
              >
                With AI-powered digital conversion
              </Text>

              {/* Illustration for empty state */}
              <View style={styles.illustrationContainer}>
                <Animated.View
                  style={[
                    styles.aiIconBackdrop,
                    { transform: [{ translateY: sparklesIconTransform }] },
                  ]}
                >
                  <Ionicons
                    name="sparkles"
                    size={40}
                    color={theme.colors.primary}
                  />
                </Animated.View>
                <Animated.View
                  style={[
                    styles.uploadIconContainer,
                    { transform: [{ translateY: documentIconTransform }] },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={60}
                    color={theme.colors.primary}
                  />
                  <View
                    style={[
                      styles.uploadIconOverlay,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Ionicons name="arrow-up" size={24} color="white" />
                  </View>
                </Animated.View>
              </View>

              {/* Description text */}
              <Text
                variant="body"
                style={[styles.description, { color: theme.colors.onSurface }]}
              >
                Upload a photo of your lecture notes, textbook page, or any
                educational material, and our AI will convert it into structured
                digital notes.{" "}
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurface }}
                >
                  (Max 10 images at a time.)
                </Text>
              </Text>

              <View style={styles.pickerContainer}>
                <PrimaryButton
                  onPress={handlePickImage}
                  style={styles.selectButton}
                >
                  <View style={styles.buttonContent}>
                    <Ionicons name="images-outline" size={20} color="white" />
                    <RNText style={styles.buttonText}>
                      Choose from Library
                    </RNText>
                  </View>
                </PrimaryButton>

                <PrimaryButton
                  onPress={handleTakePhoto}
                  style={styles.takePhotoButton}
                >
                  <View style={styles.buttonContent}>
                    <Ionicons name="camera-outline" size={20} color="white" />
                    <RNText style={styles.buttonText}>Take Photo</RNText>
                  </View>
                </PrimaryButton>
              </View>
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  heading: {
    marginBottom: 8,
    fontWeight: "700",
    textAlign: "center",
  },
  subheading: {
    marginBottom: 32,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.8,
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    marginTop: 0,
    height: 160,
    position: "relative",
  },
  uploadIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(231, 76, 60, 0.3)",
    borderStyle: "dashed",
    position: "relative",
  },
  uploadIconOverlay: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  aiIconBackdrop: {
    position: "absolute",
    top: 0,
    right: 60,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  description: {
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.7,
  },
  selectedImagesContainer: {
    width: "100%",
  },
  sectionTitleContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  sectionSubtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  imagePreviewContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  mainImagePreview: {
    width: "100%",
    height: 400,
    borderRadius: 16,
  },
  imageCountBadge: {
    position: "absolute",
    right: 16,
    bottom: 16,
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
    marginBottom: 24,
  },
  gridImageContainer: {
    position: "relative",
    width: imageSize,
    height: imageSize,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 1,
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
    borderWidth: 2,
    borderRadius: 12,
  },
  uploadButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
  },
  pickerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  selectButton: {
    width: "100%",
    borderRadius: 12,
    height: 56,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  takePhotoButton: {
    width: "100%",
    borderRadius: 12,
    height: 56,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  // Loading overlay styles
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    maxWidth: "85%",
  },
  loadingIconContainer: {
    width: 120,
    height: 120,
    marginBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingMainIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadingIconsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    width: "100%",
    height: 60, // Give space for the floating animation
  },
  loadingSecondaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    margin: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  loadingTitle: {
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 10,
  },
  loadingDescription: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
});
