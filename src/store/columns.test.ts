import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Column } from '@/types/column';
import { useColumnsStore } from './columns';

vi.mock('localforage', () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(() => ({})),
  getDocs: vi.fn(async () => ({
    docs: [{ id: 'col1', data: () => ({ title: 'Remote Column' }) }],
  })),
  setDoc: vi.fn(async () => {}),
  updateDoc: vi.fn(async () => {}),
}));

vi.mock('@/store/pendingQueue', () => ({
  usePendingQueue: {
    getState: vi.fn(() => ({
      enqueue: vi.fn(),
    })),
  },
}));

vi.mock('@/utils/network', () => ({
  isOnline: vi.fn(() => true),
}));

vi.mock('@/utils/broadcast', () => ({
  broadcastUpdate: vi.fn(),
}));

describe('useColumnsStore', () => {
  const boardId = 'board1';

  beforeEach(() => {
    useColumnsStore.setState({ columns: {} });
    vi.clearAllMocks();
  });

  it('should add a new column', async () => {
    const { addColumn, getActiveColumns } = useColumnsStore.getState();
    await addColumn(boardId, 'New Column');

    const columns = getActiveColumns(boardId);
    expect(columns).toHaveLength(1);
    expect(columns[0].title).toBe('New Column');
  });

  it('should update a column', async () => {
    const { addColumn, updateColumn, getActiveColumns } = useColumnsStore.getState();
    await addColumn(boardId, 'Column A');
    const column = getActiveColumns(boardId)[0];

    await updateColumn(boardId, column.id, { title: 'Updated Column' });
    const updated = getActiveColumns(boardId)[0];
    expect(updated.title).toBe('Updated Column');
  });

  it('should mark a column as deleted', async () => {
    const { addColumn, deleteColumn, getActiveColumns } = useColumnsStore.getState();
    await addColumn(boardId, 'Temp Column');
    const column = getActiveColumns(boardId)[0];

    await deleteColumn(boardId, column.id);
    const active = getActiveColumns(boardId);
    expect(active).toHaveLength(0);
  });

  it('should delete all columns in a board', async () => {
    const { addColumn, deleteColumns, getActiveColumns } = useColumnsStore.getState();
    await addColumn(boardId, 'Column 1');
    await addColumn(boardId, 'Column 2');

    await deleteColumns(boardId);
    const active = getActiveColumns(boardId);
    expect(active).toHaveLength(0);
  });

  it('should sync columns from firestore', async () => {
    const { syncColumns } = useColumnsStore.getState();
    await syncColumns(boardId);

    const state = useColumnsStore.getState().columns[boardId];
    expect(state).toBeDefined();
    expect(state[0].title).toBe('Remote Column');
  });

  it('should handle broadcast add message', () => {
    const { handleBroadcastMessage, getActiveColumns } = useColumnsStore.getState();

    const newCol: Column = {
      id: 'col2',
      boardId,
      title: 'Broadcast Column',
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    handleBroadcastMessage({
      type: 'add',
      entity: 'column',
      payload: newCol,
    });

    const cols = getActiveColumns(boardId);
    expect(cols.some((c) => c.id === 'col2')).toBe(true);
  });

  it('should handle broadcast update message', () => {
    const { handleBroadcastMessage, getActiveColumns } = useColumnsStore.getState();

    useColumnsStore.setState({
      columns: {
        [boardId]: [
          {
            id: 'col3',
            boardId,
            title: 'Old Title',
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    });

    handleBroadcastMessage({
      type: 'update',
      entity: 'column',
      payload: {
        id: 'col3',
        boardId,
        title: 'Updated via Broadcast',
      },
    });

    const cols = getActiveColumns(boardId);
    expect(cols[0].title).toBe('Updated via Broadcast');
  });

  it('should handle broadcast delete message', () => {
    const { handleBroadcastMessage, getActiveColumns } = useColumnsStore.getState();

    const col: Column = {
      id: 'col4',
      boardId,
      title: 'To Delete',
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useColumnsStore.setState({ columns: { [boardId]: [col] } });

    handleBroadcastMessage({
      type: 'delete',
      entity: 'column',
      payload: { ...col, deletedAt: new Date().toISOString() },
    });

    const cols = getActiveColumns(boardId);
    expect(cols).toHaveLength(0);
  });

  it('should handle broadcast delete-all message', () => {
    const { handleBroadcastMessage, getActiveColumns } = useColumnsStore.getState();

    useColumnsStore.setState({
      columns: {
        [boardId]: [
          {
            id: 'col5',
            boardId,
            title: 'Col to Delete All',
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    });

    handleBroadcastMessage({
      type: 'delete-all',
      entity: 'column',
      payload: { boardId, deletedAt: new Date().toISOString() },
    });

    const cols = getActiveColumns(boardId);
    expect(cols).toHaveLength(0);
  });
});
