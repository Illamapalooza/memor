import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { MasonryFlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Toolbar } from "@/components/ui/Toolbar/Toolbar";
import { NoteCard } from "@/components/notes/NoteCard";
import { Text } from "@/components/ui/Text/Text";
import { useNotes } from "@/features/notes/hooks/useNotes";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { PrimaryButton } from "@/components/ui/Button";
import { colors } from "@/utils/theme";

export default function HomeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { notes, deleteNote } = useNotes();
  const router = useRouter();

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      {/* <Image
        source={require("@/assets/images/empty-notes.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      /> */}
      <Ionicons
        name="document-text-outline"
        size={100}
        color={theme.colors.onSurface}
      />
      <Text variant="subtitle1" style={styles.emptyTitle}>
        No Notes Yet
      </Text>
      <Text variant="body" style={styles.emptyText}>
        Start capturing your thoughts and ideas. Create your first note now!
      </Text>
      <PrimaryButton
        onPress={() => router.push("/create")}
        style={styles.createButton}
      >
        Create Your First Note
      </PrimaryButton>
    </View>
  );

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
          color={theme.colors.onSurface}
          style={styles.icon}
          onPress={() => router.push("/settings")}
        />
        <Text variant="body" style={styles.title}>
          My Mind
        </Text>
      </View>

      {notes.length === 0 ? (
        <EmptyState />
      ) : (
        <MasonryFlashList
          data={notes}
          numColumns={2}
          renderItem={({ item }) => (
            <NoteCard note={item} onDelete={deleteNote} />
          )}
          estimatedItemSize={200}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingBottom: insets.bottom + 100,
          }}
        />
      )}

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
    textAlign: "center",
    flex: 1,
    marginRight: 24,
  },
  icon: {
    alignSelf: "flex-start",
    justifyContent: "flex-start",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: -50, // Adjust to center the content better
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
    opacity: 0.9,
  },
  emptyTitle: {
    marginBottom: 8,
    color: colors.jasper.DEFAULT,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
  },
  createButton: {
    minWidth: 200,
  },
});
