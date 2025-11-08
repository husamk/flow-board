export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
