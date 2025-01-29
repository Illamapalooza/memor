import { useEffect, useRef, useState } from "react";
import { useNotes } from "./useNotes";

export function useAutoSave({
  id,
  title,
  content,
  isNew = false,
}: {
  id?: string;
  title: string;
  content: string;
  isNew?: boolean;
}) {
  const { createNote, updateNote } = useNotes();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef({ title: "", content: "" });
  const noteIdRef = useRef<string | undefined>(id);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const hasChanges =
      title.trim() !== lastSavedRef.current.title ||
      content.trim() !== lastSavedRef.current.content;

    if (!hasChanges || (!isNew && !noteIdRef.current)) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        if (isNew) {
          if (title.trim() && content.trim()) {
            setIsSaving(true);
            const newId = await createNote(title.trim(), content.trim());
            noteIdRef.current = newId;
            isNew = false;
          }
        } else if (noteIdRef.current) {
          setIsSaving(true);
          await updateNote(noteIdRef.current, title.trim(), content.trim());
          setIsSaving(false);
        }
        lastSavedRef.current = { title: title.trim(), content: content.trim() };
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setIsSaving(false);
      }
    }, 5000); // Auto-save after 2 seconds of no changes

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [title, content, isNew, createNote, updateNote]);

  return { noteIdRef, isSaving };
}
