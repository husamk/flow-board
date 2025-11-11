import React, { useState } from 'react';
import { useColumnsStore } from '@/store/columns.ts';
import ConfirmationDialog from '@/components/common/ConfirmationDialog.tsx';

interface DeleteColumnProps {
  boardId: string | undefined;
  columnId: string;
}

const DeleteColumn: React.FC<DeleteColumnProps> = ({ boardId, columnId }) => {
  const deleteColumn = useColumnsStore((s) => s.deleteColumn);
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    if (boardId && columnId) {
      deleteColumn(boardId, columnId);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-600 hover:font-bold transition-all text-sm"
        aria-label="Delete column"
      >
        ×
      </button>

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete column?"
        description="This will permanently remove this column and its cards."
        actionText="Delete"
        onConfirm={handleDelete}
      />
    </>
  );
};

export default DeleteColumn;
