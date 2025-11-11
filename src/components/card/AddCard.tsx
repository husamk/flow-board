import React, { useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useCardsStore } from '@/store/cards.ts';

interface AddCardProps {
  boardId: string;
  columnId: string;
}

const AddCard: React.FC<AddCardProps> = ({ boardId, columnId }) => {
  const addCard = useCardsStore((s) => s.addCard);

  const [title, setTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (title.trim()) {
      addCard(boardId, columnId, title.trim());
      setTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div>
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full text-left text-sm text-gray-600 hover:text-gray-800 px-2 py-1 cursor-pointer"
        >
          + Add Card
        </button>
      ) : (
        <div className="bg-white rounded-md shadow-md p-3 border border-gray-200 hover:border-gray-300 transition-shadow duration-150">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Enter a title for this card..."
            className="w-full mb-3"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              className="bg-green-600 text-white hover:bg-green-700 cursor-pointer"
            >
              Add
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setTitle('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCard;
