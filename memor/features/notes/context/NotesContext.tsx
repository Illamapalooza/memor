import React, { createContext, useContext, useState, useEffect } from "react";
import { notesService } from "@/services/db/notes";
import type { Note } from "@/types/note";
import { useAuth } from "@/services/auth/AuthProvider";
import NetInfo from "@react-native-community/netinfo";
import { StorageService } from "@/services/storage/storage.service";

type NotesContextType = {
  notes: Note[];
  isLoading: boolean;
  error: Error | null;
  createNote: (
    title: string,
    content: string,
    imageUrls?: string[]
  ) => Promise<string>;
  updateNote: (
    id: string,
    title: string,
    content: string,
    imageUrls?: string[]
  ) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  removeImagesFromNote: (
    noteId: string,
    imagesToRemove: string[]
  ) => Promise<void>;
  isOnline: boolean;
};

export const NotesContext = createContext<NotesContextType | undefined>(
  undefined
);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const { user } = useAuth();

  // Handle online/offline state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
      if (state.isConnected) {
        notesService.goOnline();
      } else {
        notesService.goOffline();
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to notes updates
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const unsubscribe = notesService.subscribeToNotes(
      user.uid,
      (updatedNotes) => {
        setNotes(updatedNotes);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createNote = async (
    title: string,
    content: string,
    imageUrls?: string[]
  ) => {
    if (!user) throw new Error("User not authenticated");

    const newNote: Omit<Note, "id"> = {
      title,
      content,
      imageUrls,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const id = await notesService.createNote(newNote);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create note"));
      throw err;
    }
  };

  const updateNote = async (
    id: string,
    title: string,
    content: string,
    imageUrls?: string[]
  ) => {
    try {
      await notesService.updateNote(id, { title, content, imageUrls });
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? { ...note, title, content, imageUrls, updatedAt: new Date() }
            : note
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update note"));
      throw err;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const noteToDelete = notes.find((note) => note.id === id);

      // Delete images from storage if they exist
      if (noteToDelete?.imageUrls && noteToDelete.imageUrls.length > 0) {
        try {
          await StorageService.deleteMultipleImages(noteToDelete.imageUrls);
        } catch (err) {
          console.error("Failed to delete note images:", err);
          // Continue with note deletion even if image deletion fails
        }
      }

      await notesService.deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete note"));
      throw err;
    }
  };

  const removeImagesFromNote = async (
    noteId: string,
    imagesToRemove: string[]
  ) => {
    try {
      const note = notes.find((n) => n.id === noteId);
      if (!note) throw new Error("Note not found");

      // Filter out the images to remove
      const updatedImageUrls =
        note.imageUrls?.filter((url) => !imagesToRemove.includes(url)) || [];

      // Delete the images from Firebase Storage
      await StorageService.deleteMultipleImages(imagesToRemove);

      // Update the note with the new image URLs
      await updateNote(noteId, note.title, note.content, updatedImageUrls);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to remove images from note")
      );
      throw err;
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        isLoading,
        error,
        createNote,
        updateNote,
        deleteNote,
        removeImagesFromNote,
        isOnline,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
