import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { createJSONStorage, persist } from 'zustand/middleware';
import localforage from 'localforage';
import type { Board } from '@/types/board';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { usePendingQueue } from '@/store/pendingQueue';
import { isOnline } from '@/utils/network';
import { type BroadcastMessage, broadcastUpdate } from '@/utils/broadcast';

interface BoardsState {
  boards: Board[];
  getActiveBoards: () => Board[];
  addBoard: (name: string, ownerId: string, ownerEmail: string | null) => Promise<void>;
  updateBoard: (id: string, name: string) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  shareBoard: (boardId: string, memberEmail: string, role: 'editor' | 'owner') => Promise<void>;
  removeSharedMember: (boardId: string, memberEmail: string) => Promise<void>;
  syncBoards: (userEmail: string) => Promise<Board[]>;
  handleBroadcastMessage: (msg: BroadcastMessage) => void;
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

        addBoard: async (name, ownerId, ownerEmail) => {
          if (!ownerEmail || !ownerId) return;

          const newBoard: Board = {
            id: nanoid(),
            name,
            ownerId,
            members: [{ email: ownerEmail, role: 'owner' }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({ boards: [...state.boards, newBoard] }));
          broadcastUpdate('add', 'board', newBoard);

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
          broadcastUpdate('update', 'board', { id, name, updatedAt });

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
          broadcastUpdate('delete', 'board', { id });

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

        shareBoard: async (boardId, memberEmail, role) => {
          const updatedAt = new Date().toISOString();
          set((state) => ({
            boards: state.boards.map((b) =>
              b.id === boardId
                ? {
                    ...b,
                    members: [
                      ...b.members.filter((m) => m.email !== memberEmail),
                      { email: memberEmail, role },
                    ],
                    updatedAt,
                  }
                : b
            ),
          }));

          const updated = get().boards.find((b) => b.id === boardId);
          if (!updated) return;
          broadcastUpdate('update', 'board', updated);

          try {
            const ref = doc(db, 'boards', boardId);
            if (!isOnline()) {
              usePendingQueue.getState().enqueue({
                id: nanoid(),
                type: 'UPDATE',
                entity: 'board',
                payload: updated,
                timestamp: Date.now(),
              });
              return;
            }
            await updateDoc(ref, { members: updated.members, updatedAt });
          } catch (error) {
            console.error('[shareBoard] Firestore error:', error);
          }
        },

        removeSharedMember: async (boardId, memberEmail) => {
          const updatedAt = new Date().toISOString();
          set((state) => ({
            boards: state.boards.map((b) => {
              if (b.id !== boardId) return b;
              const updatedMembers = b.members.filter((m) => m.email !== memberEmail);
              return { ...b, members: updatedMembers, updatedAt };
            }),
          }));

          const updated = get().boards.find((b) => b.id === boardId);
          if (!updated) return;
          broadcastUpdate('update', 'board', updated);

          try {
            const ref = doc(db, 'boards', boardId);
            if (!isOnline()) {
              usePendingQueue.getState().enqueue({
                id: nanoid(),
                type: 'UPDATE',
                entity: 'board',
                payload: updated,
                timestamp: Date.now(),
              });
              return;
            }
            await updateDoc(ref, { members: updated.members, updatedAt });
          } catch (error) {
            console.error('[removeSharedMember] Firestore error:', error);
          }
        },

        syncBoards: async (userEmail: string) => {
          try {
            const snap = await getDocs(collection(db, 'boards'));
            const remoteBoards = snap.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }) as Board)
              .filter((b) => !b.deletedAt && b.members?.some((m) => m.email === userEmail));

            set({ boards: remoteBoards });
            console.info('[syncBoards] Synced from Firestore for user', userEmail, remoteBoards);

            return remoteBoards;
          } catch (error) {
            console.error('[syncBoards] Failed:', error);
            return [];
          }
        },

        handleBroadcastMessage: (msg: BroadcastMessage) => {
          if (msg.entity !== 'board') return;

          set((state) => {
            let updatedBoards = [...state.boards];

            switch (msg.type) {
              case 'add':
                updatedBoards.push(msg.payload);
                break;
              case 'update':
                updatedBoards = updatedBoards.map((b) =>
                  b.id === msg.payload.id ? { ...b, ...msg.payload } : b
                );
                break;
              case 'delete':
                updatedBoards = updatedBoards.filter((b) => b.id !== msg.payload.id);
                break;
              default:
                break;
            }

            return { boards: updatedBoards };
          });
        },
      };
    },
    {
      name: 'boards-storage',
      storage: createJSONStorage(() => localforage),
    }
  )
);
