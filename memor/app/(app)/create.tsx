import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
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
import { PaywallGuard } from "@/components/core/PaywallGuard";
import { useAuth } from "@/services/auth/AuthProvider";
import { UsageService } from "@/services/usage/usage.service";
import { usePaywall } from "@/contexts/PaywallContext";

export default function CreateScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [titleHeight, setTitleHeight] = useState(40);
  const { createNote } = useNotes();
  const theme = useAppTheme();
  const { userProfile } = useAuth();
  const { checkFeatureAccess } = usePaywall();

  const hasUnsavedChanges = title.trim() !== "" || content.trim() !== "";

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
    if (!userProfile?.id) return;
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Title and content are required");
      return;
    }

    try {
      const hasAccess = await checkFeatureAccess("storage");
      if (!hasAccess) {
        return;
      }

      setIsLoading(true);
      await createNote(title.trim(), content.trim());
      router.back();
    } catch (error) {
      console.error("Failed to create note:", error);
      Alert.alert("Error", "Failed to save note. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        <PaywallGuard feature="storage">
          <CreateNoteContent
            title={title}
            content={content}
            setTitle={setTitle}
            setContent={setContent}
            handleSave={handleSave}
            handleBack={handleBack}
            isLoading={isLoading}
          />
        </PaywallGuard>
      ) : (
        <CreateNoteContent
          title={title}
          content={content}
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
  setTitle,
  setContent,
  handleSave,
  handleBack,
  isLoading,
}: {
  title: string;
  content: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  handleSave: () => void;
  handleBack: () => void;
  isLoading: boolean;
}) {
  const theme = useAppTheme();
  const [titleHeight, setTitleHeight] = useState(40);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
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

        <View style={styles.content}>
          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={[
              styles.titleInput,
              {
                color: theme.colors.onSurface,
                height: Math.max(40, titleHeight),
              },
            ]}
            placeholderTextColor={colors.blackOlive[800]}
            multiline={true}
            onContentSizeChange={(event) =>
              setTitleHeight(event.nativeEvent.contentSize.height)
            }
          />
          <TextInput
            placeholder="Start writing..."
            value={content}
            onChangeText={setContent}
            multiline
            style={[styles.contentInput, { color: theme.colors.onSurface }]}
            placeholderTextColor={colors.blackOlive[600]}
          />
        </View>
      </SafeAreaView>
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
    padding: 8,
    paddingTop: 24,
  },
  backButton: {},
  saveButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
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
  content: {
    flex: 1,
    padding: 16,
  },
});
