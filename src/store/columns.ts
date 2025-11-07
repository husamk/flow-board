import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import localforage from 'localforage'

interface Column {
  id: string
  boardId: string
  title: string
}

interface ColumnsState {
  columns: Column[]
  addColumn: (boardId: string, title: string) => void
}

export const useColumnsStore = create<ColumnsState>()(
  persist(
    (set) => ({
      columns: [],
      addColumn: (boardId, title) =>
        set((state) => ({
          columns: [...state.columns, { id: crypto.randomUUID(), boardId, title }],
        })),
    }),
    {
      name: 'columns-storage',
      storage: createJSONStorage(() => localforage),
    }
  )
)
