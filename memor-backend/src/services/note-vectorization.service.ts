import { db } from "./firebase.service";
import { PineconeService } from "./pinecone.service";
import { Document } from "langchain/document";
import { logger } from "../utils/logger";
import { CollectionReference } from "firebase-admin/firestore";

export class NoteVectorizationService {
  private static instance: NoteVectorizationService;
  private pineconeService: PineconeService;
  private notesRef: CollectionReference;

  private constructor() {
    this.pineconeService = PineconeService.getInstance();
    this.notesRef = db.collection("notes");
    this.initNoteListener();
  }

  public static getInstance(): NoteVectorizationService {
    if (!NoteVectorizationService.instance) {
      NoteVectorizationService.instance = new NoteVectorizationService();
    }
    return NoteVectorizationService.instance;
  }

  private initNoteListener() {
    this.notesRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const note = change.doc.data();
        const noteId = change.doc.id;

        try {
          switch (change.type) {
            case "added":
            case "modified":
              await this.vectorizeNote({ ...note, id: noteId });
              break;
            case "removed":
              await this.pineconeService.deleteDocumentsByMetadata({
                noteId: noteId,
              });
              logger.info(`Deleted vectors for note: ${noteId}`);
              break;
          }
        } catch (error) {
          logger.error(`Error handling note ${change.type} event:`, error);
        }
      });
    });
  }

  private async vectorizeNote(note: any) {
    try {
      if (!note.id || !note.title || !note.content) {
        logger.warn("Skipping vectorization for invalid note:", note);
        return;
      }

      const content = `${note.title}\n\n${note.content}`;

      const document = new Document({
        pageContent: content,
        metadata: {
          noteId: note.id,
          userId: note.userId,
          title: note.title,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        },
      });

      await this.pineconeService.addOrUpdateDocument(document);
      logger.info(`Vectorized/Updated note: ${note.id}`);
    } catch (error) {
      logger.error("Error vectorizing note:", error);
      throw error;
    }
  }

  // Method to manually vectorize a specific note
  public async vectorizeExistingNote(noteId: string) {
    const noteDoc = await this.notesRef.doc(noteId).get();
    if (noteDoc.exists) {
      const note = noteDoc.data();
      await this.vectorizeNote({ ...note, id: noteId });
    }
  }
}
