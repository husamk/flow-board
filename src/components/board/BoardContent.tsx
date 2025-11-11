import { useEffect, useMemo } from 'react';
import { useColumnsStore } from '@/store/columns.ts';
import { useNetworkStatus } from '@/hooks/useNetworkStatus.ts';
import { useCardsStore } from '@/store/cards.ts';
import type { Card as CardItem } from '@/types/card.ts';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column } from '@/types/column.ts';
import { ColumnWrapper } from '../column/ColumnWrapper.tsx';
import AddColumn from '@/components/column/AddColumn.tsx';

export function BoardContent({ boardId }: { boardId: string | undefined }) {
  const syncColumns = useColumnsStore((s) => s.syncColumns);
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
  const cards: Record<string, CardItem[]> = useMemo(
    () => useCardsStore.getState().getBoardCards(boardId),
    [boardId, useCardsStore((s) => s.cards)]
  );

  const allCardIds = useMemo(
    () => Object.values(cards).flatMap((arr) => arr.map((c) => c.id)),
    [cards]
  );

  return (
    <div className="flex overflow-x-auto p-2 relative flex-1">
      <SortableContext items={allCardIds} strategy={verticalListSortingStrategy}>
        <div className="flex gap-4 items-start">
          {columns.map((col) => (
            <ColumnWrapper key={col.id} col={col} boardId={boardId} />
          ))}
          <div className="self-start h-auto">
            <AddColumn boardId={boardId} />
          </div>
        </div>
      </SortableContext>
    </div>
  );
}
