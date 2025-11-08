import { useState, useEffect, useMemo } from 'react';
import { useCardsStore } from '@/store/cards';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Card as CardItem } from '@/types/card';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';

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
    <div className="flex justify-between items-center flex-col gap-3">
      {cards.map((card) => (
        <Card key={card.id} className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
            <CardDescription>{card.description || 'No description provided.'}</CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
                onClick={() => deleteCard(card.id, boardId, columnId)}
                title="Delete card"
              >
                ×
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
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
