import { useEffect, useMemo, useState } from 'react';
import { useCardsStore } from '@/store/cards';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Card as CardItem } from '@/types/card';
import { DraggableCard } from '@/components/columns/DraggableCard.tsx';
import { useDroppable } from '@dnd-kit/core';

interface CardListProps {
  boardId: string;
  columnId: string;
}

export function CardList({ boardId, columnId }: CardListProps) {
  const [title, setTitle] = useState('');
  const addCard = useCardsStore((s) => s.addCard);
  const deleteCard = useCardsStore((s) => s.deleteCard);
  const syncCards = useCardsStore((s) => s.syncCards);
  const online = useNetworkStatus();

  const cards: CardItem[] = useMemo(
    () => useCardsStore.getState().getActiveCards(boardId, columnId),
    [boardId, columnId, useCardsStore((s) => s.cards)]
  );

  const { setNodeRef } = useDroppable({
    id: columnId,
    data: {
      columnId,
    },
  });

  useEffect(() => {
    if (boardId && columnId && online) {
      syncCards(boardId, columnId);
    }
  }, [boardId, columnId, online]);

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    addCard(boardId, columnId, trimmed);
    setTitle('');
  };

  return (
    <div ref={setNodeRef} className="flex justify-between items-center flex-col gap-3">
      {cards.map((card) => (
        <DraggableCard
          key={card.id}
          card={card}
          onDelete={() => deleteCard(card.id, boardId, columnId)}
        />
      ))}

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="New card"
        className="w-full mb-2"
      />

      <Button
        onClick={handleAdd}
        className="w-full bg-green-600 text-white hover:bg-green-700 cursor-pointer"
      >
        Add Card
      </Button>
    </div>
  );
}
