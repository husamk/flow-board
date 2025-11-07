export interface Board {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  ownerId: string
  sharedWith?: string[]
}
