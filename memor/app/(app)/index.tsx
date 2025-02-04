import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Animated,
  TextInput,
  Pressable,
} from "react-native";
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
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchBarAnimation = useRef(new Animated.Value(0)).current;

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  const toggleSearch = () => {
    const toValue = isSearchVisible ? 0 : 1;
    setIsSearchVisible(!isSearchVisible);
    Animated.spring(searchBarAnimation, {
      toValue,
      useNativeDriver: false,
      friction: 8,
    }).start();

    if (!isSearchVisible) {
      setSearchQuery("");
    }
  };

  const searchBarHeight = searchBarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });

  const searchBarOpacity = searchBarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

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
        {searchQuery ? "No matches found" : "No Notes Yet"}
      </Text>
      <Text variant="body" style={styles.emptyText}>
        {searchQuery
          ? "Try different search terms"
          : "Start capturing your thoughts and ideas. Create your first note now!"}
      </Text>
      {!searchQuery && (
        <PrimaryButton
          onPress={() => router.push("/create")}
          style={styles.createButton}
        >
          Create Your First Note
        </PrimaryButton>
      )}
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
          name="person"
          size={24}
          color={theme.colors.primary}
          style={styles.icon}
          onPress={() => router.push("/settings")}
        />
        <Text variant="body" style={styles.title}>
          My Mind
        </Text>
        <Pressable onPress={toggleSearch} style={styles.searchIcon}>
          <Ionicons
            name={isSearchVisible ? "close" : "search"}
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>

      <Animated.View
        style={[
          styles.searchContainer,
          {
            height: searchBarHeight,
            opacity: searchBarOpacity,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search notes..."
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.background,
              color: theme.colors.onSurface,
            },
          ]}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          autoFocus={isSearchVisible}
        />
      </Animated.View>

      {filteredNotes.length === 0 ? (
        <EmptyState />
      ) : (
        <MasonryFlashList
          data={filteredNotes}
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
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  title: {
    textAlign: "center",
    color: colors.jasper.DEFAULT,
    fontWeight: "bold",
  },
  icon: {
    alignSelf: "flex-start",
    justifyContent: "flex-start",
  },
  searchIcon: {
    width: 24,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    overflow: "hidden",
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.jasper[200],
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
