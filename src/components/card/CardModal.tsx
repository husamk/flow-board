import React, { useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useCardsStore } from '@/store/cards.ts';
import { useModalStore } from '@/store/modals.ts';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const CardModal: React.FC = () => {
  const { cardModal, closeCardModal } = useModalStore();
  const { boardId, columnId, cardId } = cardModal;

  const getCardById = useCardsStore((s) => s.getCardById);
  const card = boardId && cardId && columnId ? getCardById(boardId, columnId, cardId) : null;

  const updateCard = useCardsStore((s) => s.updateCard);

  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!card) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCard(card.id, card.boardId, card.columnId, title, description);
      closeCardModal();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={cardModal.isOpen} onOpenChange={closeCardModal}>
      <DialogContent className="max-w-2xl p-8 rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center justify-between">
            Edit Card
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Card description"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 mt-8">
          <Button variant="ghost" onClick={closeCardModal} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
