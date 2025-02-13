import React, { useState } from "react";
import { StyleSheet, Pressable, Button, View } from "react-native";
import { Text } from "@/components/ui/Text/Text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { router } from "expo-router";
import type { Note } from "@/types/note";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Menu } from "react-native-paper";
import {
  DropdownMenu,
  MenuTrigger,
  MenuOption,
} from "../ui/DropDownMenu/DropdownMenu";

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

      <View style={{ position: "absolute", bottom: 12, right: 12 }}>
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          mode="elevated"
          anchorPosition="bottom"
          style={{
            marginTop: 24,
            marginRight: 12,
          }}
          theme={{
            ...theme,
            colors: {
              ...theme.colors,
            },
          }}
          contentStyle={[
            styles.menu,
            { backgroundColor: theme.colors.surface },
          ]}
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
            theme={{
              ...theme,
              colors: {
                ...theme.colors,
                onSurfaceVariant: theme.colors.error,
              },
            }}
            style={{
              paddingHorizontal: 4,
              paddingVertical: 0,
              width: "auto",
              height: "auto",
              backgroundColor: "transparent",
            }}
            onPress={handleDelete}
            title="Delete"
            titleStyle={{
              color: theme.colors.error,
              fontFamily: "Nunito-thin",
            }}
            contentStyle={[styles.menuItem, { backgroundColor: "transparent" }]}
          />
        </Menu>
      </View>
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
  menu: {
    boxShadow: "none",
    borderRadius: 12,
    padding: 0,
    width: "auto",
    maxWidth: 220,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuOptionText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "left",
  },
  menuItem: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
});
