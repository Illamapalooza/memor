export const calculateNoteSize = (note: {
  title: string;
  content: string;
  imageUrls?: string[];
  tags?: string[];
}): number => {
  // Calculate size in bytes
  const titleSize = new Blob([note.title]).size;
  const contentSize = new Blob([note.content]).size;
  const tagsSize = note.tags ? new Blob([JSON.stringify(note.tags)]).size : 0;

  // URLs are typically around 200-500 bytes each
  const imageUrlsSize = note.imageUrls
    ? new Blob([JSON.stringify(note.imageUrls)]).size
    : 0;

  return titleSize + contentSize + tagsSize + imageUrlsSize;
};
