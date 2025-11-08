import { useState, useMemo, useEffect } from 'react';
import { useColumnsStore } from '@/store/columns';
import { CardList } from '@/components/columns/CardList';
import { useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Column } from '@/types/column';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function ColumnList({ boardId }: { boardId: string | undefined }) {
  const [title, setTitle] = useState('');
  const addColumn = useColumnsStore((s) => s.addColumn);
  const syncColumns = useColumnsStore((s) => s.syncColumns);
  const updateColumn = useColumnsStore((s) => s.updateColumn);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  const router = useRouter();
  const online = useNetworkStatus();

  useEffect(() => {
    if (boardId && online) {
      syncColumns(boardId);
    }
  }, [online, boardId]);

  const columns: Column[] = useMemo(() => {
    const cols = useColumnsStore.getState().getActiveColumns(boardId);
    return cols.filter((c) => c.boardId === boardId);
  }, [boardId, useColumnsStore((s) => s.columns)]);

  const handleAdd = () => {
    if (title.trim() && boardId) {
      addColumn(boardId, title);
      setTitle('');
    }
  };

  const handleRename = (id: string) => {
    if (editedTitle.trim() && boardId) {
      updateColumn(boardId, id, { title: editedTitle });
    }
    setEditingColumnId(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto p-2">
      <div className="mb-4">
        <Button
          onClick={() => router.navigate({ to: '/' })}
          variant="outline"
          className="text-gray-700 font-medium cursor-pointer"
        >
          ← Back to Boards
        </Button>
      </div>

      {columns.map((col) => (
        <div key={col.id} className="w-72 bg-gray-50 border rounded-lg p-3 flex-shrink-0">
          {editingColumnId === col.id ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename(col.id);
                } else if (e.key === 'Escape') {
                  setEditingColumnId(null);
                }
              }}
              onBlur={() => handleRename(col.id)}
              autoFocus
              className="font-semibold mb-2 min-h-[40px]"
            />
          ) : (
            <h3
              className="font-semibold mb-2 cursor-pointer min-h-[40px]"
              onClick={() => {
                setEditedTitle(col.title);
                setEditingColumnId(col.id);
              }}
            >
              {col.title}
            </h3>
          )}
          <CardList boardId={col.boardId} columnId={col.id} />
        </div>
      ))}

      <div className="w-72 flex-shrink-0">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder="New column"
          className="w-full mb-2"
        />
        <Button variant="outline" onClick={handleAdd}>
          Add Column
        </Button>
      </div>
    </div>
  );
}
