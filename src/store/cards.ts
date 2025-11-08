import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import type { Card } from '@/types/card';
import { nanoid } from 'nanoid';
import { db } from '@/lib/firebase';
import { collection, doc, updateDoc, getDocs, setDoc } from 'firebase/firestore';
import { usePendingQueue } from '@/store/pendingQueue';
import { isOnline } from '@/utils/network';

interface CardsState {
  cards: Record<string, Record<string, Card[]>>;
  getActiveCards: (boardId: string, columnId: string) => Card[];
  addCard: (
    boardId: string,
    columnId: string,
    title: string,
    description?: string
  ) => Promise<void>;
  updateCard: (
    id: string,
    boardId: string,
    columnId: string,
    title: string,
    description?: string
  ) => Promise<void>;
  deleteCard: (id: string, boardId: string, columnId: string) => Promise<void>;
  deleteCards: (boardId: string, columnId: string) => Promise<void>;
  syncCards: (boardId: string, columnId: string) => Promise<void>;
}

export const useCardsStore = create<CardsState>()(
  persist(
    (set, get) => {
      const enqueue = usePendingQueue.getState().enqueue;

      return {
        cards: {},

        getActiveCards: (boardId, columnId) => {
          if (!boardId || !columnId) return [];
          const cards = get().cards[boardId]?.[columnId] || [];
          return cards.filter((c) => !c.deletedAt);
        },

        addCard: async (boardId, columnId, title, description = '') => {
          const newCard: Card = {
            id: nanoid(),
            boardId,
            columnId,
            title,
            description,
            order: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            cards: {
              ...state.cards,
              [boardId]: {
                ...state.cards[boardId],
                [columnId]: [...(state.cards[boardId]?.[columnId] ?? []), newCard],
              },
            },
          }));

          if (!isOnline()) {
            enqueue({
              id: nanoid(),
              type: 'ADD',
              entity: 'card',
              payload: newCard,
              timestamp: Date.now(),
            });
            return;
          }

          try {
            const ref = doc(db, 'boards', boardId, 'columns', columnId, 'cards', newCard.id);
            await setDoc(ref, newCard);
          } catch (error) {
            console.error('[addCard] Firestore error:', error);
          }
        },

        updateCard: async (id, boardId, columnId, title, description = '') => {
          const updatedAt = new Date().toISOString();
          const cardsObj = get().cards;
          const columnCards = cardsObj[boardId]?.[columnId] || [];
          const updatedCards = columnCards.map((c) =>
            c.id === id ? { ...c, title, description, updatedAt } : c
          );

          set({
            cards: {
              ...cardsObj,
              [boardId]: { ...cardsObj[boardId], [columnId]: updatedCards },
            },
          });

          if (!isOnline()) {
            enqueue({
              id: nanoid(),
              type: 'UPDATE',
              entity: 'card',
              payload: { boardId, columnId, id, title, description, updatedAt },
              timestamp: Date.now(),
            });
            return;
          }

          try {
            const ref = doc(db, 'boards', boardId, 'columns', columnId, 'cards', id);
            await updateDoc(ref, { title, description, updatedAt });
          } catch (error) {
            console.error('[updateCard] Firestore error:', error);
          }
        },

        deleteCard: async (id, boardId, columnId) => {
          const cardsObj = get().cards;
          const columnCards = cardsObj[boardId]?.[columnId] || [];
          const deletedAt = new Date().toISOString();
          const updatedCards = columnCards.map((c) => (c.id === id ? { ...c, deletedAt } : c));

          set({
            cards: {
              ...cardsObj,
              [boardId]: { ...cardsObj[boardId], [columnId]: updatedCards },
            },
          });

          if (!isOnline()) {
            enqueue({
              id: nanoid(),
              type: 'DELETE',
              entity: 'card',
              payload: { boardId, columnId, id, deletedAt },
              timestamp: Date.now(),
            });
            return;
          }

          try {
            const ref = doc(db, 'boards', boardId, 'columns', columnId, 'cards', id);
            await updateDoc(ref, { deletedAt });
          } catch (error) {
            console.error('[deleteCard] Firestore error:', error);
          }
        },

        deleteCards: async (boardId, columnId) => {
          const cardsObj = get().cards;
          const columnCards = cardsObj[boardId]?.[columnId] || [];
          const deletedAt = new Date().toISOString();
          const updatedCards = columnCards.map((c) => ({ ...c, deletedAt }));

          set({
            cards: {
              ...cardsObj,
              [boardId]: { ...cardsObj[boardId], [columnId]: updatedCards },
            },
          });

          if (!isOnline()) {
            columnCards.forEach((c) => {
              enqueue({
                id: nanoid(),
                type: 'DELETE',
                entity: 'card',
                payload: { boardId, columnId, id: c.id, deletedAt },
                timestamp: Date.now(),
              });
            });
            return;
          }

          try {
            const batch = columnCards.map((c) =>
              updateDoc(doc(db, 'boards', boardId, 'columns', columnId, 'cards', c.id), {
                deletedAt,
              })
            );
            await Promise.all(batch);
          } catch (error) {
            console.error('[deleteCards] Firestore error:', error);
          }
        },

        syncCards: async (boardId, columnId) => {
          try {
            const snapshot = await getDocs(
              collection(db, 'boards', boardId, 'columns', columnId, 'cards')
            );
            const remoteCards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Card);

            set((state) => ({
              cards: {
                ...state.cards,
                [boardId]: { ...state.cards[boardId], [columnId]: remoteCards },
              },
            }));

            console.info('[syncCards] Synced from Firestore:', remoteCards);
          } catch (error) {
            console.error('[syncCards] Failed:', error);
          }
        },
      };
    },
    {
      name: 'cards-storage',
      storage: createJSONStorage(() => localforage),
    }
  )
);
