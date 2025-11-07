import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Card } from '@/types/card'
import { nanoid } from 'nanoid'

interface CardsState {
  cards: Card[]
  addCard: (columnId: string, title: string) => void
  updateCard: (id: string, title: string, description?: string) => void
  deleteCard: (id: string) => void
}

export const useCardsStore = create<CardsState>()(
  persist(
    (set) => ({
      cards: [],

      addCard: (columnId, title) =>
        set((state) => ({
          cards: [
            ...state.cards,
            {
              id: nanoid(),
              columnId,
              title,
              description: '',
              order: state.cards.filter((c) => c.columnId === columnId).length,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateCard: (id, title, description) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id
              ? {
                  ...c,
                  title,
                  description,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        })),

      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id),
        })),
    }),
    { name: 'cards-storage' }
  )
)
