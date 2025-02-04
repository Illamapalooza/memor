import React, { useState } from "react";
import { StyleSheet, Pressable, Button } from "react-native";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { router } from "expo-router";
import type { Note } from "@/types/note";
import { IconSymbol } from "../ui/IconSymbol";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Menu } from "react-native-paper";
import { Divider } from "react-native-paper";

type Props = {
  note: Note;
  onDelete: (id: string) => void;
};

export function NoteCard({ note, onDelete }: Props) {
  const theme = useAppTheme();

  const [visible, setVisible] = useState(false);

  const handleDelete = () => {
    setVisible(false);
    onDelete(note.id);
  };

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

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
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        contentStyle={{
          backgroundColor: theme.colors.background,
          boxShadow: "none",
          borderRadius: 12,
        }}
        anchor={
          <Ionicons
            name="ellipsis-horizontal-circle"
            size={24}
            color={theme.colors.primary}
            style={{ marginTop: 24, alignSelf: "flex-end" }}
            onPress={(e) => {
              e.stopPropagation();
              openMenu();
            }}
          />
        }
      >
        <Menu.Item
          leadingIcon="delete-outline"
          onPress={handleDelete}
          title="Delete"
        />
      </Menu>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
  deleteButton: {
    alignItems: "flex-end",
  },
});
