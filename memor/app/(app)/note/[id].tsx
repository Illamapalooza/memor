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
} from "react-native";
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
import { usePaywall } from "@/contexts/PaywallContext";

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, updateNote } = useNotes();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { checkFeatureAccess } = usePaywall();

  const note = notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [titleHeight, setTitleHeight] = useState(40);

  useEffect(() => {
    if (!note) {
      Alert.alert("Error", "Note not found");
      router.back();
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

  const handleSave = async () => {
    if (!id || !title.trim() || !content.trim()) {
      Alert.alert("Error", "Title and content are required");
      return;
    }

    try {
      // Check storage access before saving
      const hasAccess = await checkFeatureAccess("storage");
      if (!hasAccess) {
        return; // Paywall will be shown by the PaywallGuard
      }

      setIsLoading(true);
      await updateNote(id, title.trim(), content.trim());
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

        <TextInput
          style={[
            styles.titleInput,
            {
              color: theme.colors.onSurface,
              height: Math.max(40, titleHeight),
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
          onContentSizeChange={(event) =>
            setTitleHeight(event.nativeEvent.contentSize.height)
          }
        />

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
  discardButton: {
    backgroundColor: "transparent",
  },
});
