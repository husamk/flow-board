import { useEffect, useMemo, useState } from 'react';
import { closestCorners, DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useColumnsStore } from '@/store/columns';
import { CardList } from '@/components/columns/CardList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Column } from '@/types/column';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useCardsStore } from '@/store/cards.ts';
import type { Card as CardItem } from '@/types/card.ts';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { usePendingQueue } from '@/store/pendingQueue.ts';
import { Spinner } from '@/components/ui/spinner.tsx';

export function ColumnList({ boardId }: { boardId: string | undefined }) {
  const [title, setTitle] = useState('');
  const addColumn = useColumnsStore((s) => s.addColumn);
  const syncColumns = useColumnsStore((s) => s.syncColumns);
  const updateColumn = useColumnsStore((s) => s.updateColumn);
  const moveCard = useCardsStore((s) => s.moveCard);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  const online = useNetworkStatus();

  const isFlushing = usePendingQueue((s) => s.isLoading);

  useEffect(() => {
    if (boardId && online) {
      syncColumns(boardId);
    }
  }, [online, boardId]);

  const columns: Column[] = useMemo(() => {
    const cols = useColumnsStore.getState().getActiveColumns(boardId);
    return cols.filter((c) => c.boardId === boardId);
  }, [boardId, useColumnsStore((s) => s.columns)]);
  const cards: Record<string, CardItem[]> = useMemo(
    () => useCardsStore.getState().getBoardCards(boardId),
    [boardId, useCardsStore((s) => s.cards)]
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeCardId = active.data.current?.cardId;
    const activeColumnId = active.data.current?.columnId;
    const overColumnId = over.data.current?.columnId;

    if (activeColumnId === overColumnId || !activeCardId || !overColumnId || !activeCardId) return;
    moveCard(boardId, activeColumnId, overColumnId, activeCardId);
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-2 relative">
        {isFlushing && <Spinner />}
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
            <SortableContext
              items={(cards[col.id] as CardItem[] | [])?.map((c) => c.id) ?? []}
              strategy={verticalListSortingStrategy}
            >
              <CardList boardId={col.boardId} columnId={col.id} />
            </SortableContext>
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
    </DndContext>
  );
}
