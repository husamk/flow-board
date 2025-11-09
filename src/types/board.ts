export interface Member {
  email: string;
  role: 'owner' | 'editor';
}

export interface Board {
  id: string;
  name: string;
  ownerId: string;
  members: Member[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
