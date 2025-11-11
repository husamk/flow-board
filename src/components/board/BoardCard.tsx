import { Link } from '@tanstack/react-router';
import type { Board as BoardItem } from '@/types/board.ts';

interface BoardCardProps {
  board: BoardItem;
  userId: string | undefined;
}

export const BoardCard = ({ board, userId }: BoardCardProps) => (
  <Link
    to="/boards/$boardId"
    params={{ boardId: board.id }}
    className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
  >
    <h3 className="text-blue-600 font-semibold truncate">{board.name}</h3>
    <p className="text-xs text-gray-500 mt-2">{board.ownerId === userId ? 'Owner' : 'Shared'}</p>
  </Link>
);
