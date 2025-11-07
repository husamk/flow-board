import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Column } from '@/types/column'
import { nanoid } from 'nanoid'

interface ColumnsState {
  columns: Column[]
  addColumn: (boardId: string, title: string) => void
  renameColumn: (id: string, title: string) => void
  deleteColumn: (id: string) => void
}

export const useColumnsStore = create<ColumnsState>()(
  persist(
    (set) => ({
      columns: [],

      addColumn: (boardId, title) =>
        set((state) => ({
          columns: [
            ...state.columns,
            {
              id: nanoid(),
              boardId,
              title,
              order: state.columns.length,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      renameColumn: (id, title) =>
        set((state) => ({
          columns: state.columns.map((c) =>
            c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteColumn: (id) =>
        set((state) => ({
          columns: state.columns.filter((c) => c.id !== id),
        })),
    }),
    { name: 'columns-storage' }
  )
)
