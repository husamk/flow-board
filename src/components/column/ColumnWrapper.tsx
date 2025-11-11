import React from 'react';
import type { Column } from '@/types/column.ts';
import { ColumnHeader } from './ColumnHeader.tsx';
import { ColumnContent } from '@/components/column/ColumnContent.tsx';
import AddCard from '@/components/card/AddCard.tsx';
import DeleteColumn from '@/components/column/DeleteColumn.tsx';
import DroppableContainer from '@/components/dnd/DroppableContainer.tsx';

interface ColumnWrapperProps {
  col: Column;
  boardId: string | undefined;
}

export const ColumnWrapper: React.FC<ColumnWrapperProps> = ({ col, boardId }) => (
  <DroppableContainer key={col.id} id={col.id} className="mt-4">
    <div className="w-72 flex flex-col border rounded-lg p-3 relative">
      <ColumnHeader col={col} boardId={boardId} />
      <DeleteColumn boardId={boardId} columnId={col.id} />
      <ColumnContent boardId={col.boardId} columnId={col.id} />
      <AddCard boardId={col.boardId} columnId={col.id} />
    </div>
  </DroppableContainer>
);
