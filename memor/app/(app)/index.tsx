import React from "react";
import { View, StyleSheet } from "react-native";
import { MasonryFlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Toolbar } from "@/components/ui/Toolbar/Toolbar";
import { NoteCard } from "@/components/notes/NoteCard";
import { Text } from "@/components/ui/Text/Text";
import { useNotes } from "@/features/notes/hooks/useNotes";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { notes, deleteNote } = useNotes();
  const router = useRouter();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <Ionicons
          name="person-outline"
          size={24}
          color="black"
          style={styles.icon}
          onPress={() => router.push("/settings")}
        />
        <Text variant="body" style={styles.title}>
          My Mind
        </Text>
      </View>

      <MasonryFlashList
        data={notes}
        numColumns={2}
        renderItem={({ item }) => (
          <NoteCard note={item} onDelete={deleteNote} />
        )}
        estimatedItemSize={200}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: insets.bottom + 100, // Extra padding for toolbar
        }}
      />

      <Toolbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    marginRight: 24,
  },
  icon: {
    alignSelf: "flex-start",
    justifyContent: "flex-start",
  },
  list: {
    paddingHorizontal: 10,
  },
});
