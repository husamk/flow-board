import { useParams } from '@tanstack/react-router';
import { useBoardsStore } from '@/store/boards';
import { BoardContent } from '@/components/board/BoardContent.tsx';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeCardId = active.id;
    const activeColumnId = active.data.current?.columnId;
    const overColumnId = over.data.current?.columnId;

    if (!activeCardId || !overColumnId) return;

    if (activeColumnId === overColumnId) {
      console.log('TODO: handle same column drag');
    } else {
      moveCard(boardId, activeColumnId, overColumnId, activeCardId);
    }
  };

  if (!board) {
    return <div className="p-6 text-center text-gray-500">Board not found</div>;
  }

  return (
    <div className="flex flex-col p-6">
      <BoardHeader board={board} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <BoardContent boardId={board.id} />
      </DndContext>
      {isModalOpen && <CardModal />}
    </div>
  );
}
