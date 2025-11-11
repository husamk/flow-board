import { useEffect, useMemo } from 'react';
import { useCardsStore } from '@/store/cards.ts';
import { useNetworkStatus } from '@/hooks/useNetworkStatus.ts';
import type { Card as CardItem } from '@/types/card.ts';
import { InteractiveCard } from '@/components/card/InteractiveCard.tsx';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface CardListProps {
  boardId: string;
  columnId: string;
}

export function ColumnContent({ boardId, columnId }: CardListProps) {
  const syncCards = useCardsStore((s) => s.syncCards);
  const online = useNetworkStatus();

  const cards: CardItem[] = useMemo(
    () => useCardsStore.getState().getActiveCards(boardId, columnId),
    [boardId, columnId, useCardsStore((s) => s.cards)]
  );

  useEffect(() => {
    if (boardId && columnId && online) {
      syncCards(boardId, columnId);
    }
  }, [boardId, columnId, online]);

  return (
    <SortableContext items={cards.map((item) => item.id)} strategy={verticalListSortingStrategy}>
      <div className={`flex flex-col gap-4 w-full ${cards.length > 0 ? 'mb-4' : ''}`}>
        {cards.map((card) => (
          <InteractiveCard key={card.id} card={card} />
        ))}
      </div>
    </SortableContext>
  );
}
