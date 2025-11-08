export interface Board {
  id: string;
  name: string;
  ownerId: string;
  sharedWith?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
