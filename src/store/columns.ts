import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Column } from '@/types/column';
import localforage from 'localforage';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { usePendingQueue } from '@/store/pendingQueue';
import { isOnline } from '@/utils/network';

interface ColumnsState {
  columns: Record<string, Column[]>;
  getActiveColumns: (boardId: string | undefined) => Column[];
  addColumn: (boardId: string, title: string) => Promise<void>;
  updateColumn: (boardId: string, id: string, updates: Partial<Column>) => Promise<void>;
  deleteColumn: (boardId: string, id: string) => Promise<void>;
  deleteColumns: (boardId: string) => Promise<void>;
  syncColumns: (boardId: string) => Promise<void>;
}

export const useColumnsStore = create<ColumnsState>()(
  persist(
    (set, get) => {
      const enqueue = usePendingQueue.getState().enqueue;

      return {
        columns: {},

        getActiveColumns: (boardId) => {
          if (!boardId) return [];
          const columnsObj = get().columns;
          const cols = columnsObj[boardId] || [];
          return cols.filter((c) => !c.deletedAt);
        },

        addColumn: async (boardId, title) => {
          const newColumn: Column = {
            id: nanoid(),
            boardId,
            title,
            order: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            columns: {
              ...state.columns,
              [boardId]: [...(state.columns[boardId] ?? []), newColumn],
            },
          }));

          if (!isOnline()) {
            enqueue({
              id: nanoid(),
              type: 'ADD',
              entity: 'column',
              payload: newColumn,
              timestamp: Date.now(),
            });
            return;
          }

          try {
            await addDoc(collection(db, 'boards', boardId, 'columns'), newColumn);
          } catch (error) {
            console.error('[addColumn] Firestore error:', error);
          }
        },

        updateColumn: async (boardId, id, updates: Partial<Column>) => {
          const columnsObj = get().columns;
          const cols = columnsObj[boardId] || [];
          const updatedAt = new Date().toISOString();
          const updatedCols = cols.map((c) => (c.id === id ? { ...c, ...updates, updatedAt } : c));

          set({
            columns: { ...columnsObj, [boardId]: updatedCols },
          });

          if (!isOnline()) {
            enqueue({
              id: nanoid(),
              type: 'UPDATE',
              entity: 'column',
              payload: { boardId, id, ...updates },
              timestamp: Date.now(),
            });
            return;
          }

          try {
            const ref = doc(db, 'boards', boardId, 'columns', id);
            await updateDoc(ref, { ...updates, updatedAt });
          } catch (error) {
            console.error('[updateColumn] Firestore error:', error);
          }
        },

        deleteColumn: async (boardId, id) => {
          const columnsObj = get().columns;
          const cols = columnsObj[boardId] || [];
          const deletedAt = new Date().toISOString();
          const updatedCols = cols.map((c) => (c.id === id ? { ...c, deletedAt } : c));

          set({
            columns: { ...columnsObj, [boardId]: updatedCols },
          });

          if (!isOnline()) {
            enqueue({
              id: nanoid(),
              type: 'DELETE',
              entity: 'column',
              payload: { boardId, id, deletedAt },
              timestamp: Date.now(),
            });
            return;
          }

          try {
            const ref = doc(db, 'boards', boardId, 'columns', id);
            await updateDoc(ref, { deletedAt });
          } catch (error) {
            console.error('[deleteColumn] Firestore error:', error);
          }
        },

        deleteColumns: async (boardId) => {
          const columnsObj = get().columns;
          const cols = columnsObj[boardId] || [];
          const deletedAt = new Date().toISOString();
          const updatedCols = cols.map((c) => ({ ...c, deletedAt }));

          set({
            columns: { ...columnsObj, [boardId]: updatedCols },
          });

          if (!isOnline()) {
            cols.forEach((c) => {
              enqueue({
                id: nanoid(),
                type: 'DELETE',
                entity: 'column',
                payload: { boardId, id: c.id, deletedAt },
                timestamp: Date.now(),
              });
            });
            return;
          }

          try {
            const batch = cols.map((c) =>
              updateDoc(doc(db, 'boards', boardId, 'columns', c.id), { deletedAt })
            );
            await Promise.all(batch);
          } catch (error) {
            console.error('[deleteColumns] Firestore error:', error);
          }
        },

        syncColumns: async (boardId: string) => {
          try {
            const snapshot = await getDocs(collection(db, 'boards', boardId, 'columns'));
            const remoteColumns = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as Column
            );

            set((state) => ({
              columns: { ...state.columns, [boardId]: remoteColumns },
            }));

            console.info('[syncColumns] Synced from Firestore:', remoteColumns);
          } catch (error) {
            console.error('[syncColumns] Failed:', error);
          }
        },
      };
    },
    {
      name: 'columns-storage',
      storage: createJSONStorage(() => localforage),
    }
  )
);
