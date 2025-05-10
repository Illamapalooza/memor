import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { PrimaryButton, OutlineButton } from "@/components/ui/Button";
import { StorageService } from "@/services/storage/storage.service";
import { useAuth } from "@/services/auth/AuthProvider";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ImagePickerProps {
  onImageUploaded: (imageUrl: string) => void;
  onError?: (error: Error) => void;
}

export function ImagePicker({ onImageUploaded, onError }: ImagePickerProps) {
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { userProfile } = useAuth();
  const theme = useAppTheme();

  const handlePickImage = async () => {
    try {
      const result = await StorageService.pickImage();

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUris = result.assets.map((asset) => asset.uri);
        setImageUris(selectedUris);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image.");
      onError &&
        onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await StorageService.takePhoto();

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUris([result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo.");
      onError &&
        onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  };

  const handleUpload = async () => {
    if (imageUris.length === 0 || !userProfile?.id) {
      Alert.alert("Error", "Please select at least one image first.");
      return;
    }

    try {
      setIsUploading(true);

      // Upload each image and update as they complete
      for (const uri of imageUris) {
        const imageUrl = await StorageService.uploadImage(userProfile.id, uri);
        onImageUploaded(imageUrl);
      }

      setImageUris([]);
    } catch (error) {
      Alert.alert("Error", "Failed to upload image.");
      onError &&
        onError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setImageUris([]);
  };

  const mainImageUri = imageUris.length > 0 ? imageUris[0] : null;
  const hasMultipleImages = imageUris.length > 1;

  return (
    <View style={styles.container}>
      {mainImageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: mainImageUri }} style={styles.imagePreview} />

          {hasMultipleImages && (
            <View style={styles.multipleImagesInfo}>
              <Text style={styles.multipleImagesText}>
                +{imageUris.length - 1} more{" "}
                {imageUris.length === 2 ? "image" : "images"}
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <OutlineButton
              onPress={handleRetake}
              style={[styles.button, styles.retakeButton]}
            >
              Re-select
            </OutlineButton>
            <PrimaryButton
              onPress={handleUpload}
              style={[styles.button, styles.uploadButton]}
              loading={isUploading}
            >
              Upload{" "}
              {imageUris.length > 1 ? `${imageUris.length} Images` : "Image"}
            </PrimaryButton>
          </View>
        </View>
      ) : (
        <View style={styles.pickersContainer}>
          <Text variant="h3" style={styles.title}>
            Add Image
          </Text>
          <View style={styles.buttonContainer}>
            <OutlineButton
              onPress={handlePickImage}
              style={styles.libraryButton}
              disabled={isUploading}
            >
              Choose from Library
            </OutlineButton>
            <PrimaryButton
              onPress={handleTakePhoto}
              style={styles.photoButton}
              disabled={isUploading}
            >
              Take Photo
            </PrimaryButton>
          </View>
        </View>
      )}

      {isUploading && (
        <View
          style={[
            styles.loadingOverlay,
            { backgroundColor: theme.colors.scrim },
          ]}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: theme.colors.onSurface }}>
            Uploading{" "}
            {imageUris.length > 1 ? `${imageUris.length} images...` : "..."}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  pickersContainer: {
    padding: 16,
    alignItems: "center",
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  previewContainer: {
    width: "100%",
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  multipleImagesInfo: {
    position: "absolute",
    bottom: 24,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  multipleImagesText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "column",
    gap: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  libraryButton: {
    marginBottom: 16,
    borderColor: "#E74C3C",
    borderWidth: 2,
  },
  photoButton: {
    backgroundColor: "#E74C3C",
  },
  retakeButton: {
    borderColor: "#E74C3C",
    borderWidth: 2,
  },
  uploadButton: {
    backgroundColor: "#E74C3C",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    opacity: 0.7,
  },
});
