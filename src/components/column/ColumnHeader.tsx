import React, { useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import type { Column } from '@/types/column.ts';
import { useColumnsStore } from '@/store/columns.ts';

interface ColumnHeaderProps {
  col: Column;
  boardId: string | undefined;
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = ({ col, boardId }) => {
  const updateColumn = useColumnsStore((s) => s.updateColumn);

  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState(col.title);

  const handleRename = (id: string) => {
    if (editedTitle.trim() && boardId) {
      updateColumn(boardId, id, { title: editedTitle });
    }
    setEditingColumnId(null);
  };

  if (editingColumnId === col.id) {
    return (
      <Input
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleRename(col.id);
          else if (e.key === 'Escape') setEditingColumnId(null);
        }}
        onBlur={() => handleRename(col.id)}
        autoFocus
        className="font-semibold mb-2 min-h-[40px]"
      />
    );
  }

  return (
    <h3
      className="font-semibold mb-2 cursor-pointer min-h-[40px]"
      onClick={() => {
        setEditedTitle(col.title);
        setEditingColumnId(col.id);
      }}
    >
      {col.title}
    </h3>
  );
};

export default ColumnHeader;
