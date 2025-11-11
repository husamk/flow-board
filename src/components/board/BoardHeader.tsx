import React, { useState } from 'react';
import type { Board } from '@/types/board';
import { Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBoardsStore } from '@/store/boards';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { ShareModal } from '@/components/modals/ShareModal.tsx';

interface BoardHeaderProps {
  board: Board;
  onShare?: () => void;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({ board }) => {
  const deleteBoard = useBoardsStore((s) => s.deleteBoard);
  const updateBoard = useBoardsStore((s) => s.updateBoard);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(board.name);

  const handleDelete = () => {
    deleteBoard(board.id);
    setOpenConfirm(false);
  };

  const handleSave = () => {
    if (editedName.trim() && editedName !== board.name) {
      updateBoard(board.id, editedName);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-900">
      {isEditing ? (
        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
          className="text-2xl font-bold text-gray-800 border-b border-blue-500 focus:outline-none px-1"
        />
      ) : (
        <h2
          className="text-2xl font-bold text-gray-800 cursor-pointer hover:underline"
          onClick={() => setIsEditing(true)}
        >
          {board.name}
        </h2>
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setOpenShare(true)}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="destructive" onClick={() => setOpenConfirm(true)}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      <ConfirmationDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title="Delete board?"
        description="This will permanently remove this board and all its contents."
        actionText="Delete"
        onConfirm={handleDelete}
      />
      <ShareModal boardId={board.id} isOpen={openShare} onClose={() => setOpenShare(false)} />
    </div>
  );
};

export default BoardHeader;
