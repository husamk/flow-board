export interface Member {
  role: 'owner' | 'editor';
  name: string;
  invitedAt: string;
}

export interface Board {
  id: string;
  name: string;
  ownerId: string;
  members: Record<string, Member>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
