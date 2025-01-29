import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

export type FirestoreDocument = {
  id: string;
} & DocumentData;

export const firestoreUtils = {
  // Create a new document
  create: async <T extends DocumentData>(
    collectionName: string,
    data: T,
    id?: string
  ): Promise<string> => {
    const collectionRef = collection(db, collectionName);
    if (id) {
      await setDoc(doc(collectionRef, id), data);
      return id;
    } else {
      const docRef = doc(collectionRef);
      await setDoc(docRef, data);
      return docRef.id;
    }
  },

  // Get a document by ID
  get: async <T extends DocumentData>(
    collectionName: string,
    id: string
  ): Promise<T | null> => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
  },

  // Update a document
  update: async <T extends DocumentData>(
    collectionName: string,
    id: string,
    data: Partial<T>
  ): Promise<void> => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data as T);
  },

  // Delete a document
  delete: async (collectionName: string, id: string): Promise<void> => {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  },

  // Query documents
  query: async <T extends DocumentData>(
    collectionName: string,
    field: string,
    operator: "==" | "!=" | ">" | ">=" | "<" | "<=",
    value: any
  ): Promise<T[]> => {
    const q = query(
      collection(db, collectionName),
      where(field, operator, value)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as unknown as T)
    );
  },
};
