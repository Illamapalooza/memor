import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  Alert,
  ScrollView,
  Text as RNText,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useNotes } from "@/features/notes/hooks/useNotes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Text } from "@/components/ui/Text/Text";
import {
  GhostButton,
  OutlineButton,
  PrimaryButton,
} from "@/components/ui/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/utils/theme";
import { useAuth } from "@/services/auth/AuthProvider";
import { UsageService } from "@/services/usage/usage.service";

export default function CreateScreen() {
  const params = useLocalSearchParams();
  const [title, setTitle] = useState((params.title as string) || "");
  const [content, setContent] = useState((params.content as string) || "");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [titleHeight, setTitleHeight] = useState(40);
  const { createNote } = useNotes();
  const theme = useAppTheme();
  const { userProfile } = useAuth();

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

  useEffect(() => {
    // Handle route params change when navigated from another screen
    if (params.title) {
      setTitle(params.title as string);
    }
    if (params.content) {
      setContent(params.content as string);
    }
    if (params.imageUrls) {
      try {
        const parsedUrls = JSON.parse(params.imageUrls as string);
        if (Array.isArray(parsedUrls)) {
          // Validate all URLs before setting them
          const validatedUrls = parsedUrls.map(validateImageUrl);
          console.log(
            "[CreateScreen] Set validated image URLs:",
            validatedUrls
          );
          setImageUrls(validatedUrls);
        }
      } catch (error) {
        console.error("Failed to parse image URLs:", error);
      }
    }
  }, [params.title, params.content, params.imageUrls]);

  const hasUnsavedChanges =
    title.trim() !== "" || content.trim() !== "" || imageUrls.length > 0;

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowDiscardModal(true);
    } else {
      router.back();
    }
  };

  const handleDiscard = () => {
    setShowDiscardModal(false);
    router.back();
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Title and content are required");
      return;
    }

    try {
      setIsLoading(true);

      // Clean content by removing hashtags
      const cleanedContent = cleanContent(content.trim());

      await createNote(title.trim(), cleanedContent, imageUrls);

      // Navigate back to home
      router.back();
    } catch (error) {
      console.error("Error creating note:", error);
      Alert.alert("Error", "Failed to create note");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clean content by removing hashtags
  const cleanContent = (text: string): string => {
    // Replace hashtags (#) with empty string
    return text.replace(/##/g, "");
  };

  const shouldShowPaywall = () => {
    if (!userProfile) return false;
    return UsageService.hasReachedAnyLimit(userProfile);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {shouldShowPaywall() ? (
        <CreateNoteContent
          title={title}
          content={content}
          imageUrls={imageUrls}
          setTitle={setTitle}
          setContent={setContent}
          handleSave={handleSave}
          handleBack={handleBack}
          isLoading={isLoading}
        />
      ) : (
        <CreateNoteContent
          title={title}
          content={content}
          imageUrls={imageUrls}
          setTitle={setTitle}
          setContent={setContent}
          handleSave={handleSave}
          handleBack={handleBack}
          isLoading={isLoading}
        />
      )}

      <Modal
        visible={showDiscardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDiscardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="h3" style={styles.modalTitle}>
              Discard Changes?
            </Text>
            <Text variant="body" style={styles.modalText}>
              You have unsaved changes. Are you sure you want to discard them?
            </Text>
            <View style={styles.modalButtons}>
              <OutlineButton
                onPress={handleDiscard}
                style={[styles.modalButton, styles.discardButton]}
              >
                Discard
              </OutlineButton>
              <PrimaryButton
                onPress={() => setShowDiscardModal(false)}
                style={styles.modalButton}
              >
                Keep Editing
              </PrimaryButton>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function CreateNoteContent({
  title,
  content,
  imageUrls,
  setTitle,
  setContent,
  handleSave,
  handleBack,
  isLoading,
}: {
  title: string;
  content: string;
  imageUrls: string[];
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  handleSave: () => void;
  handleBack: () => void;
  isLoading: boolean;
}) {
  const theme = useAppTheme();
  const [titleHeight, setTitleHeight] = useState(55);

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

  // Function to debug image URLs
  const logImageUrls = () => {
    console.log("Image URLs:", imageUrls);
    if (imageUrls.length > 0) {
      console.log("First URL:", imageUrls[0]);
    }
  };

  useEffect(() => {
    logImageUrls();
  }, [imageUrls]);

  return (
    <>
      <View style={{ flex: 1, paddingHorizontal: 0 }}>
        <View style={[styles.header]}>
          <Pressable onPress={handleBack} style={[styles.backButton]}>
            <Ionicons
              name="chevron-back-outline"
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
          <Text
            variant="subtitle2"
            style={[styles.title, { color: theme.colors.primary }]}
          >
            New Note
          </Text>
          <PrimaryButton
            onPress={handleSave}
            loading={isLoading}
            disabled={!title.trim() || !content.trim()}
            size="large"
            style={[styles.saveButton, { backgroundColor: "transparent" }]}
            textStyle={{
              color:
                !title.trim() || !content.trim()
                  ? theme.colors.surfaceDisabled
                  : theme.colors.primary,
            }}
          >
            Save
          </PrimaryButton>
        </View>

        <ScrollView style={styles.content}>
          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={[
              styles.titleInput,
              {
                color: theme.colors.onSurface,
                height: Math.max(55, titleHeight),
              },
            ]}
            placeholderTextColor={colors.blackOlive[800]}
            multiline={true}
            onContentSizeChange={(event) =>
              setTitleHeight(event.nativeEvent.contentSize.height)
            }
          />

          {/* Show image gallery if there are images */}
          {imageUrls && imageUrls.length > 0 ? (
            <View>
              <Text variant="subtitle1" style={styles.imagesHeader}>
                Attached Images ({imageUrls.length})
              </Text>
              <ScrollView
                horizontal
                style={styles.imageGallery}
                showsHorizontalScrollIndicator={false}
              >
                {imageUrls.map((url, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                      source={{ uri: validateImageUrl(url) }}
                      style={styles.galleryImage}
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                    <RNText style={styles.imageIndex}>{index + 1}</RNText>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <TextInput
            placeholder="Start writing..."
            value={content}
            onChangeText={setContent}
            multiline
            style={[styles.contentInput, { color: theme.colors.onSurface }]}
            placeholderTextColor={colors.blackOlive[600]}
          />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
  },
  title: {
    fontFamily: "Nunito-Bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    minWidth: 70,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: "top",
    paddingTop: 8,
    paddingHorizontal: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalText: {
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    margin: 8,
  },
  discardButton: {
    borderColor: "#E74C3C",
  },
  imagesHeader: {
    marginTop: 8,
    marginBottom: 4,
  },
  imageGallery: {
    flexDirection: "row",
    marginVertical: 12,
    height: 120,
  },
  imageContainer: {
    position: "relative",
    marginRight: 8,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.blackOlive[200],
  },
  imageIndex: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
});
