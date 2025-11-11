import { useState } from 'react';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.tsx';
import type { Card as CardItem } from '@/types/card.ts';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import Draggable from '@/components/dnd/Draggable.tsx';
import { CardModal } from '@/components/card/CardModal.tsx';
import { useCardsStore } from '@/store/cards.ts';

export function InteractiveCard({ card }: { card: CardItem }) {
  const deleteCard = useCardsStore((s) => s.deleteCard);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleDelete = () => {
    setOpenConfirm(true);
  };

  const confirmDelete = () => {
    deleteCard(card.id, card.boardId, card.columnId);
    setOpenConfirm(false);
  };

  return (
    <div className="relative w-full">
      <Draggable
        id={card.id}
        className="w-full"
        onClick={() => setIsModalOpen(true)}
        onDelete={handleDelete}
      >
        <Card key={card.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-semibold truncate">{card.title}</CardTitle>
            <CardDescription className="text-xs text-gray-500 line-clamp-2">
              {card.description || 'No description provided.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </Draggable>
      <ConfirmationDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title="Delete card?"
        description="This will permanently remove this card."
        actionText="Delete"
        onConfirm={confirmDelete}
      />
      {isModalOpen && <CardModal card={card} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
