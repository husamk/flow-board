import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import localforage from 'localforage'

interface Board {
  id: string
  name: string
  ownerId: string
}

interface BoardsState {
  boards: Board[]
  addBoard: (name: string, ownerId: string) => void
  deleteBoard: (id: string) => void
}

export const useBoardsStore = create<BoardsState>()(
  persist(
    (set) => ({
      boards: [],
      addBoard: (name, ownerId) =>
        set((state) => ({
          boards: [...state.boards, { id: crypto.randomUUID(), name, ownerId }],
        })),
      deleteBoard: (id) =>
        set((state) => ({
          boards: state.boards.filter((b) => b.id !== id),
        })),
    }),
    {
      name: 'boards-storage',
      storage: createJSONStorage(() => localforage),
    }
  )
)
