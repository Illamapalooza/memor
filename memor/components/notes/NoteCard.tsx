import React, { useState } from "react";
import {
  StyleSheet,
  Pressable,
  View,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { router } from "expo-router";
import type { Note } from "@/types/note";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  note: Note;
  onDelete: (id: string) => void;
};

export function NoteCard({ note, onDelete }: Props) {
  const theme = useAppTheme();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleDelete = () => {
    setDeleteModalVisible(false);
    onDelete(note.id);
  };

  const openDeleteModal = () => setDeleteModalVisible(true);
  const closeDeleteModal = () => setDeleteModalVisible(false);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={() => router.push(`/note/${note.id}`)}
    >
      <Text variant="subtitle2" style={{ color: theme.colors.onSurface }}>
        {note.title}
      </Text>
      <Text
        variant="bodySmall"
        numberOfLines={7}
        style={{ color: theme.colors.onSurface }}
      >
        {note.content}
      </Text>

      <View style={{ position: "absolute", bottom: 12, right: 12 }}>
        <Ionicons
          name="trash-outline"
          size={20}
          color={theme.colors.primary}
          style={{ marginTop: 24, alignSelf: "flex-end" }}
          onPress={(e) => {
            e.stopPropagation();
            openDeleteModal();
          }}
        />
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={closeDeleteModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeDeleteModal}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={styles.modalIcon}>
              <Ionicons
                name="trash-outline"
                size={28}
                color={theme.colors.error}
              />
            </View>
            <Text
              variant="subtitle1"
              style={{
                textAlign: "center",
                marginBottom: 12,
                color: theme.colors.onSurface,
              }}
            >
              Delete Note
            </Text>
            <Text
              variant="body"
              style={{
                textAlign: "center",
                marginBottom: 24,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Are you sure you want to delete this note? This action cannot be
              undone.
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  { borderColor: theme.colors.outline },
                ]}
                onPress={closeDeleteModal}
              >
                <Text variant="body" style={{ color: theme.colors.onSurface }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.deleteButton,
                  { backgroundColor: theme.colors.error },
                ]}
                onPress={handleDelete}
              >
                <Text variant="body" style={{ color: theme.colors.onError }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    borderRadius: 12,
    gap: 8,
    margin: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    width: "90%",
    maxWidth: 300,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalIcon: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 50,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
});
