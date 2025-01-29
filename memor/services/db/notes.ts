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
} from "firebase/firestore";
import { db } from "./firebase";
import type { Note } from "@/types/note";

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
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...note,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateNote(id: string, note: Partial<Omit<Note, "id">>): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...note,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteNote(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  },

  async goOffline() {
    await disableNetwork(db);
  },

  async goOnline() {
    await enableNetwork(db);
  },
};
