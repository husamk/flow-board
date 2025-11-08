import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { createJSONStorage, persist } from 'zustand/middleware';
import localforage from 'localforage';
import type { Board } from '@/types/board';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { usePendingQueue } from '@/store/pendingQueue';
import { isOnline } from '@/utils/network';

interface BoardsState {
  boards: Board[];
  getActiveBoards: () => Board[];
  addBoard: (name: string, ownerId: string) => Promise<void>;
  updateBoard: (id: string, name: string) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  syncBoards: () => Promise<Board[]>;
}

export const useBoardsStore = create<BoardsState>()(
  persist(
    (set, get) => {
      const enqueue = usePendingQueue.getState().enqueue;
      return {
        boards: [],

        getActiveBoards: () => {
          return get().boards.filter((b) => !b.deletedAt);
        },

        addBoard: async (name, ownerId) => {
          const newBoard: Board = {
            id: nanoid(),
            name,
            ownerId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Update local state first (optimistic UI)
          set((state) => ({ boards: [...state.boards, newBoard] }));

          try {
            if (!isOnline()) {
              enqueue({
                id: nanoid(),
                type: 'ADD',
                entity: 'board',
                payload: newBoard,
                timestamp: Date.now(),
              });
              return;
            }
            const ref = doc(db, 'boards', newBoard.id);
            await setDoc(ref, newBoard);
          } catch (error) {
            console.error('[addBoard] Firestore error:', error);
          }
        },

        updateBoard: async (id, name) => {
          const updatedAt = new Date().toISOString();
          set((state) => ({
            boards: state.boards.map((b) => (b.id === id ? { ...b, name, updatedAt } : b)),
          }));

          const updated = get().boards.find((b) => b.id === id);
          if (!updated) return;

          try {
            const ref = doc(db, 'boards', id);
            if (!isOnline()) {
              enqueue({
                id: nanoid(),
                type: 'UPDATE',
                entity: 'board',
                payload: updated,
                timestamp: Date.now(),
              });
              return;
            }
            await updateDoc(ref, { name, updatedAt });
          } catch (error) {
            console.error('[updateBoard] Firestore error:', error);
          }
        },

        deleteBoard: async (id) => {
          const deletedAt = new Date().toISOString();
          set((state) => ({
            boards: state.boards.map((b) => (b.id === id ? { ...b, deletedAt } : b)),
          }));

          const deleted = get().boards.find((b) => b.id === id);
          if (!deleted) return;

          try {
            const ref = doc(db, 'boards', id);
            if (!isOnline()) {
              enqueue({
                id: nanoid(),
                type: 'DELETE',
                entity: 'board',
                payload: deleted,
                timestamp: Date.now(),
              });
              return;
            }
            await updateDoc(ref, { deletedAt });
          } catch (error) {
            console.error('[deleteBoard] Firestore error:', error);
          }
        },

        syncBoards: async () => {
          try {
            const snapshot = await getDocs(collection(db, 'boards'));
            const remoteBoards = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as Board
            );

            set({ boards: remoteBoards });
            console.info('[syncBoards] Synced from Firestore:', remoteBoards);

            return remoteBoards;
          } catch (error) {
            console.error('[syncBoards] Failed:', error);
            return [];
          }
        },
      };
    },
    {
      name: 'boards-storage',
      storage: createJSONStorage(() => localforage),
    }
  )
);
