import { useEffect, useMemo, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useBoardsStore } from '@/store/boards';
import { useAuthStore } from '@/store/auth';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deleteBoardCascade } from '@/utils/deleteBoardCascade';

export function BoardList() {
  const [boardName, setBoardName] = useState('');
  const boards = useMemo(
    () => useBoardsStore.getState().getActiveBoards(),
    [useBoardsStore((s) => s.boards)]
  );
  const addBoard = useBoardsStore((s) => s.addBoard);
  const user = useAuthStore((s) => s.user);
  const online = useNetworkStatus();
  const syncBoards = useBoardsStore((s) => s.syncBoards);

  useEffect(() => {
    if (online) {
      syncBoards();
    }
  }, [online]);

  const handleAdd = () => {
    if (boardName.trim() && user) {
      addBoard(boardName, user.uid);
      setBoardName('');
    }
  };

  return (
    <div className="relative max-w-md mx-auto space-y-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-600 ">Your Boards</h2>
      </div>

      <div className="flex gap-2">
        <Input
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder="New board name"
          className="flex-grow"
        />
        <Button onClick={handleAdd} variant="outline">
          Add
        </Button>
      </div>

      <ul className="divide-y border rounded shadow-sm bg-white">
        {boards.length === 0 ? (
          <li className="p-4 text-gray-500 text-center">No boards yet. Add one to get started!</li>
        ) : (
          boards.map((b) => (
            <li
              key={b.id}
              className="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <Link
                to="/boards/$boardId"
                params={{ boardId: b.id }}
                className="text-blue-600 hover:underline font-medium"
              >
                {b.name}
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteBoardCascade(b.id)}
                className="text-red-600 hover:text-red-700 cursor-pointer"
              >
                Delete
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
