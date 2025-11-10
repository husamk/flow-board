import { useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import type { Card as CardItem } from '@/types/card';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';

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
    <div className="relative w-full">
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <Card
          key={card.id}
          className={`w-full rounded-md bg-white border border-gray-200 transition-all duration-150 ease-in-out
            ${isDragging ? 'scale-105 shadow-xl z-50 rotate-[4deg]' : 'shadow-sm hover:shadow-md'}
          `}
        >
          <CardHeader>
            <CardTitle className="text-sm font-semibold truncate">{card.title}</CardTitle>
            <CardDescription className="text-xs text-gray-500 line-clamp-2">
              {card.description || 'No description provided.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {!isDragging && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1 right-1 pointer-events-auto text-sm text-red-500 hover:text-red-600 cursor-pointer z-10"
          onClick={onDelete}
          title="Delete card"
        >
          ×
        </Button>
      )}
    </div>
  );
}
