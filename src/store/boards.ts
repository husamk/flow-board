import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Board } from '@/types/board'
import { nanoid } from 'nanoid'

interface BoardsState {
  boards: Board[]
  addBoard: (name: string, ownerId: string) => void
  updateBoard: (id: string, name: string) => void
  deleteBoard: (id: string) => void
}

export const useBoardsStore = create<BoardsState>()(
  persist(
    (set) => ({
      boards: [],

      addBoard: (name, ownerId) =>
        set((state) => ({
          boards: [
            ...state.boards,
            {
              id: nanoid(),
              name,
              ownerId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateBoard: (id, name) =>
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === id ? { ...b, name, updatedAt: new Date().toISOString() } : b
          ),
        })),

      deleteBoard: (id) =>
        set((state) => ({
          boards: state.boards.filter((b) => b.id !== id),
        })),
    }),
    { name: 'boards-storage' }
  )
)
