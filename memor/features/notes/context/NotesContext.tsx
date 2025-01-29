import React, { createContext, useContext, useState, useEffect } from "react";
import { notesService } from "@/services/db/notes";
import type { Note } from "@/types/note";
import { useAuth } from "@/services/auth/AuthProvider";
import NetInfo from "@react-native-community/netinfo";

type NotesContextType = {
  notes: Note[];
  isLoading: boolean;
  error: Error | null;
  createNote: (title: string, content: string) => Promise<string>;
  updateNote: (id: string, title: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
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

  const createNote = async (title: string, content: string) => {
    if (!user) throw new Error("User not authenticated");

    const newNote: Omit<Note, "id"> = {
      title,
      content,
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

  const updateNote = async (id: string, title: string, content: string) => {
    try {
      await notesService.updateNote(id, { title, content });
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? { ...note, title, content, updatedAt: new Date() }
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
      await notesService.deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete note"));
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
        isOnline,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
