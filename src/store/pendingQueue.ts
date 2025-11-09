import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { isOnline } from '@/utils/network';

type PendingActionType = 'ADD' | 'UPDATE' | 'DELETE' | 'MOVE';

export interface PendingAction {
  id: string;
  type: PendingActionType;
  entity: 'board' | 'column' | 'card';
  payload: Record<string, any>;
  timestamp: number;
}

interface PendingQueueState {
  queue: PendingAction[];
  isLoading: boolean;
  enqueue: (action: PendingAction) => void;
  dequeue: (id: string) => void;
  flush: () => Promise<void>;
}

export const usePendingQueue = create<PendingQueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      isLoading: false,

      enqueue: (action) => {
        console.info('[PendingQueue] Enqueued', action);
        set((state) => ({ queue: [...state.queue, action] }));
      },

      dequeue: (id) => {
        set((state) => ({ queue: state.queue.filter((a) => a.id !== id) }));
      },

      flush: async () => {
        if (!isOnline()) return;

        const { queue, dequeue } = get();
        if (queue.length === 0) return;

        console.info(`[PendingQueue] Flushing ${queue.length} actions...`);
        set({ isLoading: true });

        try {
          for (const action of queue) {
            try {
              await handleAction(action);
              dequeue(action.id);
              console.info('[PendingQueue] Flushed:', action);
            } catch (err) {
              console.warn('[PendingQueue] Retry later for:', action, err);
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'pending-queue',
      storage: createJSONStorage(() => localforage),
    }
  )
);

async function handleAction(action: PendingAction) {
  const { entity, type, payload } = action;

  switch (entity) {
    case 'board':
      return handleBoardAction(type, payload);
    case 'column':
      return handleColumnAction(type, payload);
    case 'card':
      return handleCardAction(type, payload);
    default:
      throw new Error('Unknown entity type');
  }
}

async function handleBoardAction(type: PendingActionType, payload: any) {
  const { db } = await import('@/lib/firebase');
  const { doc, setDoc, updateDoc } = await import('firebase/firestore');

  if (type === 'ADD') {
    await setDoc(doc(db, 'boards', payload.id), payload);
  } else if (type === 'UPDATE') {
    await updateDoc(doc(db, 'boards', payload.id), payload);
  } else if (type === 'DELETE') {
    await updateDoc(doc(db, 'boards', payload.id), { deletedAt: new Date().toISOString() });
  }
}

async function handleColumnAction(type: PendingActionType, payload: any) {
  const { db } = await import('@/lib/firebase');
  const { doc, setDoc, updateDoc } = await import('firebase/firestore');

  const { boardId, id } = payload;

  if (type === 'ADD') {
    await setDoc(doc(db, 'boards', boardId, 'columns', id), payload);
  } else if (type === 'UPDATE') {
    await updateDoc(doc(db, 'boards', boardId, 'columns', id), payload);
  } else if (type === 'DELETE') {
    await updateDoc(doc(db, 'boards', boardId, 'columns', id), {
      deletedAt: new Date().toISOString(),
    });
  }
}

async function handleCardAction(type: PendingActionType, payload: any) {
  const { db } = await import('@/lib/firebase');
  const { doc, setDoc, updateDoc, deleteDoc } = await import('firebase/firestore');

  const { boardId, columnId, id, fromColumnId, toColumnId } = payload;

  if (type === 'ADD') {
    await setDoc(doc(db, 'boards', boardId, 'columns', columnId, 'cards', id), payload);
  } else if (type === 'UPDATE') {
    await updateDoc(doc(db, 'boards', boardId, 'columns', columnId, 'cards', id), payload);
  } else if (type === 'DELETE') {
    await updateDoc(doc(db, 'boards', boardId, 'columns', columnId, 'cards', id), {
      deletedAt: new Date().toISOString(),
    });
  } else if (type === 'MOVE') {
    await setDoc(doc(db, 'boards', boardId, 'columns', toColumnId, 'cards', id), {
      ...payload,
      columnId: toColumnId,
      updatedAt: new Date().toISOString(),
    });

    const fromRef = doc(db, 'boards', boardId, 'columns', fromColumnId, 'cards', id);
    await deleteDoc(fromRef);
  }
}
