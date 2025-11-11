import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/firebase';
import { collection, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { useBoardsStore } from './boards';

vi.mock('nanoid', () => ({ nanoid: vi.fn(() => 'mock-id') }));
vi.mock('localforage', () => ({}));
vi.mock('@/lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  setDoc: vi.fn(),
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

describe('useBoardsStore', () => {
  beforeEach(() => {
    const { setState } = useBoardsStore;
    setState({ boards: [] });
    vi.clearAllMocks();
  });

  it('adds a new board', async () => {
    const { addBoard } = useBoardsStore.getState();
    await addBoard('My Board', 'owner123', 'test@example.com');

    const { boards } = useBoardsStore.getState();
    expect(boards).toHaveLength(1);
    expect(boards[0].name).toBe('My Board');
    expect(setDoc).toHaveBeenCalled();
  });

  it('updates a board name', async () => {
    const { addBoard, updateBoard } = useBoardsStore.getState();
    await addBoard('Old Board', '1', 'a@b.com');

    const id = useBoardsStore.getState().boards[0].id;
    await updateBoard(id, 'New Board');

    const board = useBoardsStore.getState().boards[0];
    expect(board.name).toBe('New Board');
    expect(updateDoc).toHaveBeenCalled();
  });

  it('deletes a board (soft delete)', async () => {
    const { addBoard, deleteBoard } = useBoardsStore.getState();
    await addBoard('Board to Delete', '1', 'a@b.com');

    const id = useBoardsStore.getState().boards[0].id;
    await deleteBoard(id);

    const board = useBoardsStore.getState().boards[0];
    expect(board.deletedAt).toBeDefined();
    expect(updateDoc).toHaveBeenCalled();
  });

  it('shares a board with a new member', async () => {
    const { addBoard, shareBoard } = useBoardsStore.getState();
    await addBoard('Team Board', '1', 'owner@test.com');

    const id = useBoardsStore.getState().boards[0].id;
    await shareBoard(id, 'newuser@test.com', 'editor');

    const board = useBoardsStore.getState().boards[0];
    expect(board.members.some((m) => m.email === 'newuser@test.com')).toBe(true);
    expect(updateDoc).toHaveBeenCalled();
  });

  it('removes a shared member', async () => {
    const { addBoard, shareBoard, removeSharedMember } = useBoardsStore.getState();
    await addBoard('Team Board', '1', 'owner@test.com');
    const id = useBoardsStore.getState().boards[0].id;
    await shareBoard(id, 'user@test.com', 'editor');

    await removeSharedMember(id, 'user@test.com');
    const board = useBoardsStore.getState().boards[0];
    expect(board.members.some((m) => m.email === 'user@test.com')).toBe(false);
  });

  it('syncBoards fetches data from Firestore', async () => {
    const fakeDocs = [
      { id: '1', data: () => ({ name: 'Board 1', members: [{ email: 'me@test.com' }] }) },
      { id: '2', data: () => ({ name: 'Board 2', deletedAt: 'now' }) },
    ];
    vi.mocked(getDocs).mockResolvedValueOnce({ docs: fakeDocs });

    const { syncBoards } = useBoardsStore.getState();
    const result = await syncBoards('me@test.com');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Board 1');
    expect(collection).toHaveBeenCalledWith(db, 'boards');
  });

  it('handles broadcast add/update/delete correctly', () => {
    const { handleBroadcastMessage } = useBoardsStore.getState();

    handleBroadcastMessage({
      type: 'add',
      entity: 'board',
      payload: { id: '1', name: 'Added Board' },
    });
    expect(useBoardsStore.getState().boards).toHaveLength(1);

    handleBroadcastMessage({
      type: 'update',
      entity: 'board',
      payload: { id: '1', name: 'Updated Board' },
    });
    expect(useBoardsStore.getState().boards[0].name).toBe('Updated Board');

    handleBroadcastMessage({
      type: 'delete',
      entity: 'board',
      payload: { id: '1' },
    });
    expect(useBoardsStore.getState().boards).toHaveLength(0);
  });
});
