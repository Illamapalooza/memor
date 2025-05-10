import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  Alert,
  SafeAreaView,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { colors } from "@/utils/theme";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, updateNote, removeImagesFromNote } = useNotes();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const note = notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [imageUrls, setImageUrls] = useState<string[]>(note?.imageUrls || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [titleHeight, setTitleHeight] = useState(40);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageToDeleteIndex, setImageToDeleteIndex] = useState<number | null>(
    null
  );
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);

  // Debug image URLs to help troubleshoot
  useEffect(() => {
    console.log("[EditNoteScreen] Note:", note?.id);
    console.log("[EditNoteScreen] Image URLs:", imageUrls);
    if (imageUrls && imageUrls.length > 0) {
      console.log("[EditNoteScreen] First URL:", imageUrls[0]);
    }
  }, [imageUrls, note]);

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
    if (!note) {
      Alert.alert("Error", "Note not found");
      router.back();
    } else {
      // Update state when note changes
      setTitle(note.title);
      setContent(note.content);

      // Validate image URLs before setting them
      if (note.imageUrls && note.imageUrls.length > 0) {
        const validatedUrls = note.imageUrls.map(validateImageUrl);
        console.log("[EditNoteScreen] Validated URLs:", validatedUrls);
        setImageUrls(validatedUrls);
      } else {
        setImageUrls([]);
      }
    }
  }, [note]);

  const hasUnsavedChanges =
    title.trim() !== note?.title || content.trim() !== note?.content;

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowDiscardModal(true);
    } else {
      router.back();
    }
  }, [hasUnsavedChanges, note]);

  const handleDiscard = () => {
    setShowDiscardModal(false);
    router.back();
  };

  const handleImagePress = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

  const handleDeleteImagePrompt = (index: number) => {
    setImageToDeleteIndex(index);
    setShowDeleteImageModal(true);
  };

  const handleDeleteImage = async () => {
    if (imageToDeleteIndex === null) return;

    const imageToDelete = imageUrls[imageToDeleteIndex];
    try {
      // Remove the image from Firebase Storage and update the note
      await removeImagesFromNote(id!, [imageToDelete]);

      // Update local state
      setImageUrls((prev) => {
        const updated = [...prev];
        updated.splice(imageToDeleteIndex, 1);
        return updated;
      });

      setShowDeleteImageModal(false);
      setImageToDeleteIndex(null);
    } catch (error) {
      console.error("Failed to delete image:", error);
      Alert.alert("Error", "Failed to delete image. Please try again.");
    }
  };

  // Function to clean content by removing hashtags
  const cleanContent = (text: string): string => {
    // Replace hashtags (#) with empty string
    return text.replace(/#/g, "");
  };

  const handleSave = async () => {
    if (!id || !title.trim() || !content.trim()) {
      Alert.alert("Error", "Title and content are required");
      return;
    }

    try {
      setIsLoading(true);
      // Clean content before saving to remove hashtags
      const cleanedContent = cleanContent(content.trim());
      await updateNote(id, title.trim(), cleanedContent, imageUrls);
      router.back();
    } catch (error) {
      console.error("Failed to update note:", error);
      Alert.alert("Error", "Failed to save note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!note) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={[styles.header]}>
          <Pressable onPress={handleBack} style={styles.backButton}>
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
            Edit Note
          </Text>
          <GhostButton
            onPress={handleSave}
            loading={isLoading}
            disabled={!title.trim() || !content.trim() || !hasUnsavedChanges}
            size="large"
            style={styles.saveButton}
            textStyle={{
              color:
                !title.trim() || !content.trim() || !hasUnsavedChanges
                  ? theme.colors.surfaceDisabled
                  : theme.colors.primary,
            }}
          >
            Save
          </GhostButton>
        </View>

        <ScrollView style={styles.scrollContainer}>
          <TextInput
            style={[
              styles.titleInput,
              {
                color: theme.colors.onSurface,
                minHeight: 40,
                height: "auto",
              },
            ]}
            placeholder="Untitled"
            placeholderTextColor={colors.blackOlive[800]}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            cursorColor={theme.colors.primary}
            selectionColor={theme.colors.primary}
            multiline={true}
          />

          {/* Display attached images if any */}
          {imageUrls && imageUrls.length > 0 && (
            <View style={styles.imagesContainer}>
              <Text
                variant="subtitle1"
                style={[styles.imagesHeader, { color: theme.colors.onSurface }]}
              >
                Attached Images ({imageUrls.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageGallery}
              >
                {imageUrls.map((url, index) => (
                  <Pressable
                    key={index}
                    style={styles.imageContainer}
                    onPress={() => handleImagePress(index)}
                  >
                    <Image
                      source={{ uri: validateImageUrl(url) }}
                      style={styles.galleryImage}
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                      placeholder={{
                        color: colors.blackOlive[200],
                      }}
                    />
                    <RNText style={styles.imageIndex}>{index + 1}</RNText>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteImagePrompt(index);
                      }}
                      style={styles.imageDeleteButton}
                    >
                      <Ionicons name="trash-outline" size={16} color="white" />
                    </Pressable>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <TextInput
            style={[styles.contentInput, { color: theme.colors.onSurface }]}
            placeholder="Start typing here..."
            placeholderTextColor={colors.blackOlive[800]}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            cursorColor={theme.colors.primary}
            selectionColor={theme.colors.primary}
          />
        </ScrollView>

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

        {/* Image Viewer Modal */}
        <Modal
          visible={showImageViewer}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowImageViewer(false)}
        >
          <View
            style={[
              styles.modalOverlay,
              { backgroundColor: "rgba(0, 0, 0, 0.9)" },
            ]}
          >
            <View style={styles.imageViewerHeader}>
              <Pressable
                onPress={() => setShowImageViewer(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="white" />
              </Pressable>
              <Pressable
                onPress={() => handleDeleteImagePrompt(currentImageIndex)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={24} color="white" />
              </Pressable>
            </View>

            <Image
              source={{ uri: validateImageUrl(imageUrls[currentImageIndex]) }}
              style={styles.fullScreenImage}
              contentFit="contain"
              transition={200}
            />

            <View style={styles.imageNavigation}>
              <Text style={styles.imageCounter}>
                {currentImageIndex + 1} / {imageUrls.length}
              </Text>

              <View style={styles.navButtons}>
                <Pressable
                  onPress={() =>
                    setCurrentImageIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentImageIndex === 0}
                  style={[
                    styles.navButton,
                    currentImageIndex === 0 && styles.disabledButton,
                  ]}
                >
                  <Ionicons name="chevron-back" size={24} color="white" />
                </Pressable>

                <Pressable
                  onPress={() =>
                    setCurrentImageIndex((prev) =>
                      Math.min(imageUrls.length - 1, prev + 1)
                    )
                  }
                  disabled={currentImageIndex === imageUrls.length - 1}
                  style={[
                    styles.navButton,
                    currentImageIndex === imageUrls.length - 1 &&
                      styles.disabledButton,
                  ]}
                >
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Image Confirmation Modal */}
        <Modal
          visible={showDeleteImageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteImageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text variant="h3" style={styles.modalTitle}>
                Delete Image?
              </Text>
              <Text variant="body" style={styles.modalText}>
                This action cannot be undone. The image will be permanently
                deleted.
              </Text>
              <View style={styles.modalButtons}>
                <OutlineButton
                  onPress={() => setShowDeleteImageModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </OutlineButton>
                <PrimaryButton
                  onPress={handleDeleteImage}
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.flame[500] },
                  ]}
                >
                  Delete
                </PrimaryButton>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  title: {
    fontFamily: "Nunito-Bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    paddingTop: 24,
  },
  backButton: {},
  saveButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  titleInput: {
    fontSize: 32,
    fontFamily: "Nunito-Bold",
    padding: 16,
    textAlignVertical: "top",
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Nunito",
    padding: 16,
    textAlignVertical: "top",
  },
  imagesContainer: {
    paddingHorizontal: 16,
  },
  imagesHeader: {
    marginTop: 8,
    marginBottom: 8,
  },
  imageGallery: {
    flexDirection: "row",
    marginBottom: 16,
    height: 120,
  },
  imageContainer: {
    position: "relative",
    marginRight: 8,
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: colors.blackOlive[100],
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    marginBottom: 8,
  },
  modalText: {
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
  discardButton: {},
  imageViewerHeader: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
    backgroundColor: "transparent",
  },
  imageNavigation: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  imageCounter: {
    color: "white",
    fontSize: 16,
    marginBottom: 20,
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  navButton: {
    padding: 10,
    marginHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  imageDeleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 15,
    padding: 5,
  },
});
