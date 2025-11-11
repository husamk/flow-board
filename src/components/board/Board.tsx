import { useParams } from '@tanstack/react-router';
import { useBoardsStore } from '@/store/boards';
import { BoardContent } from '@/components/board/BoardContent.tsx';
import { type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { useCardsStore } from '@/store/cards.ts';
import BoardHeader from '@/components/board/BoardHeader.tsx';
import { CardModal } from '@/components/card/CardModal.tsx';
import { useModalStore } from '@/store/modals.ts';

export function Board() {
  const { boardId } = useParams({ from: '/boards/$boardId' });
  const {
    cardModal: { isOpen: isModalOpen },
  } = useModalStore();
  const board = useBoardsStore((s) => s.boards.find((b) => b.id === boardId));
  const moveCard = useCardsStore((s) => s.moveCard);

  const [activeId, setActiveId] = useState<string | number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log('Drag started:', active.id);
    setActiveId(active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    // console.log('Active', active);
    // console.log('Over', over);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    console.log('Active', active);
    console.log('Over', over);
    // const activeCardId = active.data.current?.cardId;
    // const activeColumnId = active.data.current?.columnId;
    // const overColumnId = over.data.current?.columnId;
    //
    // if (activeColumnId === overColumnId || !activeCardId || !overColumnId) return;
    // moveCard(boardId, activeColumnId, overColumnId, activeCardId);

    setActiveId(null);
  };

  if (!board) {
    return <div className="p-6 text-center text-gray-500">Board not found</div>;
  }

  return (
    <div className="flex flex-col p-6">
      <BoardHeader board={board} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <BoardContent boardId={board.id} />
      </DndContext>
      {isModalOpen && <CardModal />}
    </div>
  );
}
