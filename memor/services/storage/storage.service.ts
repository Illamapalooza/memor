import { storage } from "@/services/db/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import { v4 as uuidv4 } from "uuid";

export class StorageService {
  /**
   * Requests permission to access the device's photo library
   */
  static async requestMediaLibraryPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  }

  /**
   * Requests permission to access the device's camera
   */
  static async requestCameraPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  }

  /**
   * Opens image picker to select an image from the device
   */
  static async pickImage(): Promise<ImagePicker.ImagePickerResult> {
    const hasPermission = await this.requestMediaLibraryPermissions();

    if (!hasPermission) {
      throw new Error("Media library permission not granted");
    }

    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.8,
    });
  }

  /**
   * Opens camera to take a photo
   */
  static async takePhoto(): Promise<ImagePicker.ImagePickerResult> {
    const hasPermission = await this.requestCameraPermissions();

    if (!hasPermission) {
      throw new Error("Camera permission not granted");
    }

    return await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
  }

  /**
   * Uploads an image to Firebase Storage
   */
  static async uploadImage(
    userId: string,
    uri: string,
    contentType: string = "image/jpeg"
  ): Promise<string> {
    try {
      // Generate a unique file name
      const fileName = `${uuidv4()}.jpg`;
      const storageRef = ref(storage, `users/${userId}/images/${fileName}`);

      // Convert image uri to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload the blob to Firebase Storage
      await uploadBytes(storageRef, blob, { contentType });

      // Get the download URL
      let downloadURL = await getDownloadURL(storageRef);

      console.log("[StorageService] Original URL:", downloadURL);

      // Ensure the URL is properly formatted with encoded path segments
      // Firebase Storage URLs need path segments encoded correctly (/ becomes %2F)
      if (downloadURL.includes("/o/users/")) {
        // The path isn't properly encoded, fix it
        const regex = /\/o\/users\/([^\/]+)\/images\/([^?]+)/;
        const match = downloadURL.match(regex);

        if (match) {
          const userId = match[1];
          const fileName = match[2];

          // Rebuild the URL with proper URL encoding for path segments
          const baseUrl = downloadURL.split("/o/")[0];
          const queryParams = downloadURL.split("?")[1];

          downloadURL = `${baseUrl}/o/users%2F${userId}%2Fimages%2F${fileName}?${queryParams}`;
          console.log("[StorageService] Fixed URL:", downloadURL);
        }
      }

      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  /**
   * Uploads multiple images to Firebase Storage
   */
  static async uploadMultipleImages(
    userId: string,
    uris: string[]
  ): Promise<string[]> {
    try {
      const downloadURLs = await Promise.all(
        uris.map((uri) => this.uploadImage(userId, uri))
      );

      // Validate and log all URLs for debugging
      console.log(
        "[StorageService] Uploaded multiple images, URLs:",
        downloadURLs
      );

      return downloadURLs;
    } catch (error) {
      console.error("Error uploading multiple images:", error);
      throw error;
    }
  }

  /**
   * Deletes an image from Firebase Storage
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract the path from the URL to create a reference
      // Firebase Storage URLs are typically in the format:
      // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/users%2F{userId}%2Fimages%2F{filename}?alt=media&token={token}

      if (!imageUrl) {
        throw new Error("Invalid image URL");
      }

      // Parse the URL to extract the path
      const decodedUrl = decodeURIComponent(imageUrl);
      const regex = /\/o\/(users%2F[^?]+)/;
      const match = imageUrl.match(regex);

      if (!match) {
        throw new Error("Could not parse image URL path");
      }

      const path = match[1].replace(/%2F/g, "/");
      const storageRef = ref(storage, path);

      // Delete the image
      await deleteObject(storageRef);
      console.log("[StorageService] Successfully deleted image:", imageUrl);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  /**
   * Deletes multiple images from Firebase Storage
   */
  static async deleteMultipleImages(imageUrls: string[]): Promise<void> {
    try {
      if (!imageUrls || imageUrls.length === 0) {
        return;
      }

      await Promise.all(imageUrls.map((url) => this.deleteImage(url)));

      console.log(
        "[StorageService] Successfully deleted multiple images:",
        imageUrls.length
      );
    } catch (error) {
      console.error("Error deleting multiple images:", error);
      throw error;
    }
  }
}
