export type Note = {
  id: string;
  title: string;
  content: string;
  imageUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};
