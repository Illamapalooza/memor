import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  enableNetwork,
  disableNetwork,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Note } from "@/types/note";
import { calculateNoteSize } from "@/utils/storage";
import { UsageService } from "../usage/usage.service";
import { auth } from "./firebase";

const COLLECTION = "notes";

export const notesService = {
  subscribeToNotes(userId: string, onUpdate: (notes: Note[]) => void) {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const notes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Note[];
        onUpdate(notes);
      },
      (error) => {
        console.error("Notes subscription error:", error);
      }
    );
  },

  async createNote(note: Omit<Note, "id">): Promise<string> {
    try {
      // Calculate note size
      const noteSize = calculateNoteSize(note);

      // Check storage limit before creating note
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const hasStorageSpace = await UsageService.checkUsageLimit(
        user.uid,
        "storage",
        noteSize
      );

      if (!hasStorageSpace) {
        throw new Error("Storage limit reached");
      }

      // Create note
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...note,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update storage usage
      await UsageService.incrementUsage(user.uid, "storage", noteSize);

      return docRef.id;
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  },

  async updateNote(
    id: string,
    updates: Partial<Omit<Note, "id">>
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const docRef = doc(db, COLLECTION, id);
      const oldNote = (await getDoc(docRef)).data() as Note;
      const oldSize = calculateNoteSize(oldNote);

      // Calculate new size
      const newNote = { ...oldNote, ...updates };
      const newSize = calculateNoteSize(newNote);
      const sizeDiff = newSize - oldSize;

      // Check storage limit if size increased
      if (sizeDiff > 0) {
        const hasStorageSpace = await UsageService.checkUsageLimit(
          user.uid,
          "storage",
          sizeDiff
        );

        if (!hasStorageSpace) {
          throw new Error("Storage limit reached");
        }
      }

      // Update note
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Update storage usage if size changed
      if (sizeDiff !== 0) {
        await UsageService.incrementUsage(user.uid, "storage", sizeDiff);
      }
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  },

  async deleteNote(id: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Get note size before deletion
      const docRef = doc(db, COLLECTION, id);
      const note = (await getDoc(docRef)).data() as Note;
      const noteSize = calculateNoteSize(note);

      // Delete note
      await deleteDoc(docRef);

      // Update storage usage (subtract size)
      await UsageService.incrementUsage(user.uid, "storage", -noteSize);
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  },

  async goOffline() {
    await disableNetwork(db);
  },

  async goOnline() {
    await enableNetwork(db);
  },
};
