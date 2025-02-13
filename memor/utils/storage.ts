export const calculateNoteSize = (note: {
  title: string;
  content: string;
  tags?: string[];
}): number => {
  // Calculate size in bytes
  const titleSize = new Blob([note.title]).size;
  const contentSize = new Blob([note.content]).size;
  const tagsSize = note.tags ? new Blob([JSON.stringify(note.tags)]).size : 0;

  return titleSize + contentSize + tagsSize;
};
