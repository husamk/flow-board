import React, { useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useColumnsStore } from '@/store/columns.ts';

interface ColumnFooterProps {
  boardId: string | undefined;
}

export const AddColumn: React.FC<ColumnFooterProps> = ({ boardId }) => {
  const [title, setTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const addColumn = useColumnsStore((s) => s.addColumn);

  const handleAdd = () => {
    if (title.trim() && boardId) {
      addColumn(boardId, title.trim());
      setTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-72 h-auto flex-shrink-0 p-2 rounded-md bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all mt-4">
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full text-left text-gray-700 font-medium p-2 rounded hover:bg-gray-100 transition"
        >
          + Add list
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Enter list title..."
            className="w-full"
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="bg-blue-600 text-white hover:bg-blue-700">
              Add
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setTitle('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddColumn;
