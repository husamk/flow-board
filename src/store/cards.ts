import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import localforage from 'localforage'

interface Card {
  id: string
  columnId: string
  title: string
}

interface CardsState {
  cards: Card[]
  addCard: (columnId: string, title: string) => void
  deleteCard: (id: string) => void
}

export const useCardsStore = create<CardsState>()(
  persist(
    (set) => ({
      cards: [],
      addCard: (columnId, title) =>
        set((state) => ({
          cards: [...state.cards, { id: crypto.randomUUID(), columnId, title }],
        })),
      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
        })),
    }),
    {
      name: 'cards-storage',
      storage: createJSONStorage(() => localforage),
    }
  )
)
