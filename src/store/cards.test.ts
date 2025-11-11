import { beforeEach, describe, expect, it, vi } from 'vitest';
import { collection, deleteDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { useCardsStore } from './cards';

vi.mock('localforage', () => ({}));
vi.mock('nanoid', () => ({ nanoid: vi.fn(() => 'mock-id') }));
vi.mock('@/lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));
vi.mock('@/utils/network', () => ({ isOnline: vi.fn(() => true) }));
vi.mock('@/store/pendingQueue', () => ({
  usePendingQueue: {
    getState: vi.fn(() => ({ enqueue: vi.fn() })),
  },
}));
vi.mock('@/utils/broadcast', () => ({
  broadcastUpdate: vi.fn(),
}));

describe('useCardsStore', () => {
  beforeEach(() => {
    const { setState } = useCardsStore;
    setState({ cards: {} });
    vi.clearAllMocks();
  });

  it('adds a new card and broadcasts', async () => {
    const { addCard } = useCardsStore.getState();
    await addCard('board1', 'col1', 'Task A', 'Desc');

    const card = useCardsStore.getState().cards['board1']['col1'][0];
    expect(card.title).toBe('Task A');
    expect(card.boardId).toBe('board1');
    expect(card.columnId).toBe('col1');
    expect(card.description).toBe('Desc');
  });

  it('updates card title and description', async () => {
    const { addCard, updateCard } = useCardsStore.getState();
    await addCard('board1', 'col1', 'Task A', 'Old');
    const card = useCardsStore.getState().cards['board1']['col1'][0];

    await updateCard(card.id, 'board1', 'col1', 'Updated Task', 'New Description');

    const updated = useCardsStore.getState().cards['board1']['col1'][0];
    expect(updated.title).toBe('Updated Task');
    expect(updated.description).toBe('New Description');
    expect(updateDoc).toHaveBeenCalled();
  });

  it('soft deletes a card', async () => {
    const { addCard, deleteCard } = useCardsStore.getState();
    await addCard('b1', 'c1', 'Task B');
    const id = useCardsStore.getState().cards['b1']['c1'][0].id;

    await deleteCard(id, 'b1', 'c1');
    const deleted = useCardsStore.getState().cards['b1']['c1'][0];
    expect(deleted.deletedAt).toBeDefined();
    expect(updateDoc).toHaveBeenCalled();
  });

  it('moves card between columns', async () => {
    const { addCard, moveCard } = useCardsStore.getState();
    await addCard('b1', 'c1', 'Card to Move');
    const card = useCardsStore.getState().cards['b1']['c1'][0];

    await moveCard('b1', 'c1', 'c2', card.id);

    const from = useCardsStore.getState().cards['b1']['c1'];
    const to = useCardsStore.getState().cards['b1']['c2'];

    expect(from).toHaveLength(0);
    expect(to[0].columnId).toBe('c2');
    expect(setDoc).toHaveBeenCalled();
    expect(deleteDoc).toHaveBeenCalled();
  });

  it('soft deletes all cards in a column', async () => {
    const { addCard, deleteCards } = useCardsStore.getState();
    await addCard('b1', 'col1', 'Task1');
    await addCard('b1', 'col1', 'Task2');

    await deleteCards('b1', 'col1');
    const cards = useCardsStore.getState().cards['b1']['col1'];

    expect(cards.every((c) => c.deletedAt)).toBe(true);
  });

  it('syncs cards from Firestore', async () => {
    const fakeDocs = [
      { id: '1', data: () => ({ title: 'Synced', boardId: 'b1', columnId: 'c1' }) },
    ];
    vi.mocked(getDocs).mockResolvedValueOnce({ docs: fakeDocs } as any);

    const { syncCards } = useCardsStore.getState();
    await syncCards('b1', 'c1');

    const synced = useCardsStore.getState().cards['b1']['c1'][0];
    expect(synced.title).toBe('Synced');
    expect(collection).toHaveBeenCalled();
  });

  it('handles broadcast add, update, delete, and move', () => {
    const { handleBroadcastMessage } = useCardsStore.getState();

    handleBroadcastMessage({
      type: 'add',
      entity: 'card',
      payload: { id: '1', boardId: 'b1', columnId: 'c1', title: 'Card' },
    });
    expect(useCardsStore.getState().cards['b1']['c1']).toHaveLength(1);

    handleBroadcastMessage({
      type: 'update',
      entity: 'card',
      payload: { id: '1', boardId: 'b1', columnId: 'c1', title: 'Updated' },
    });
    expect(useCardsStore.getState().cards['b1']['c1'][0].title).toBe('Updated');

    handleBroadcastMessage({
      type: 'move',
      entity: 'card',
      payload: {
        boardId: 'b1',
        fromColumnId: 'c1',
        toColumnId: 'c2',
        movedCard: { id: '1', boardId: 'b1', columnId: 'c2', title: 'Moved' },
      },
    });
    expect(useCardsStore.getState().cards['b1']['c2'][0].title).toBe('Moved');

    handleBroadcastMessage({
      type: 'delete',
      entity: 'card',
      payload: { id: '1', boardId: 'b1', columnId: 'c2', deletedAt: 'now' },
    });
    expect(useCardsStore.getState().cards['b1']['c2'][0].deletedAt).toBe('now');
  });
});
