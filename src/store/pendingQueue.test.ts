import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePendingQueue } from './pendingQueue';
import { isOnline } from '@/utils/network';

vi.mock('localforage', () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}));

vi.mock('@/utils/network', () => ({
  isOnline: vi.fn(() => true),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
}));

describe('usePendingQueue store', () => {
  beforeEach(() => {
    usePendingQueue.setState({ queue: [], isLoading: false });
    vi.clearAllMocks();
  });

  it('should enqueue a new action', () => {
    const { enqueue } = usePendingQueue.getState();
    const action = {
      id: '1',
      type: 'ADD',
      entity: 'board',
      payload: { id: 'b1' },
      timestamp: Date.now(),
    };
    enqueue(action);
    const { queue } = usePendingQueue.getState();
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe('1');
  });

  it('should dequeue an action by id', () => {
    const { enqueue, dequeue } = usePendingQueue.getState();
    const action = {
      id: '2',
      type: 'UPDATE',
      entity: 'column',
      payload: { id: 'c1' },
      timestamp: Date.now(),
    };
    enqueue(action);
    dequeue('2');
    expect(usePendingQueue.getState().queue).toHaveLength(0);
  });

  it('should not flush if offline', async () => {
    (isOnline as any).mockReturnValueOnce(false);
    const { flush, enqueue } = usePendingQueue.getState();

    enqueue({
      id: '3',
      type: 'ADD',
      entity: 'board',
      payload: { id: 'b2' },
      timestamp: Date.now(),
    });

    await flush();
    expect(usePendingQueue.getState().queue).toHaveLength(1);
  });

  it('should flush all actions when online', async () => {
    (isOnline as any).mockReturnValue(true);
    const { enqueue, flush } = usePendingQueue.getState();

    enqueue({
      id: '4',
      type: 'ADD',
      entity: 'board',
      payload: { id: 'b3' },
      timestamp: Date.now(),
    });
    enqueue({
      id: '5',
      type: 'DELETE',
      entity: 'column',
      payload: { boardId: 'b3', id: 'col1' },
      timestamp: Date.now(),
    });

    await flush();
    const { queue, isLoading } = usePendingQueue.getState();

    expect(queue).toHaveLength(0);
    expect(isLoading).toBe(false);
  });

  it('should handle multiple entities correctly', async () => {
    const { enqueue, flush } = usePendingQueue.getState();

    enqueue({
      id: '6',
      type: 'ADD',
      entity: 'card',
      payload: { id: 'c1', boardId: 'b1', columnId: 'col1' },
      timestamp: Date.now(),
    });
    enqueue({
      id: '7',
      type: 'UPDATE',
      entity: 'column',
      payload: { boardId: 'b1', id: 'col2' },
      timestamp: Date.now(),
    });

    await flush();
    expect(usePendingQueue.getState().queue).toHaveLength(0);
  });

  it('should gracefully handle unknown entity', async () => {
    const { enqueue, flush } = usePendingQueue.getState();
    enqueue({
      id: '8',
      type: 'ADD',
      entity: 'unknown' as any,
      payload: { id: 'x' },
      timestamp: Date.now(),
    });
    await expect(flush()).resolves.not.toThrow();
  });
});
