import { useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import type { Card as CardItem } from '@/types/card';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';

export function DraggableCard({ card, onDelete }: { card: CardItem; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: {
      cardId: card.id,
      columnId: card.columnId,
    },
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.8 : 1,
    cursor: 'grab',
    transition: isDragging ? 'none' : 'transform 150ms ease',
    marginBottom: '8px',
    width: '100%',
    maxWidth: '100%',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card
        key={card.id}
        className="w-full shadow-sm rounded-md bg-white border border-gray-200 hover:shadow-md transition-shadow"
      >
        <CardHeader>
          <CardTitle className="text-sm font-semibold truncate">{card.title}</CardTitle>
          <CardDescription className="text-xs text-gray-500 line-clamp-2">
            {card.description || 'No description provided.'}
          </CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
              onClick={onDelete}
              title="Delete card"
            >
              ×
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
