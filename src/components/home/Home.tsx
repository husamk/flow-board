import { useEffect, useMemo, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus.ts';
import { useBoardsStore } from '@/store/boards.ts';
import { useAuthStore } from '@/store/auth.ts';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import type { Board as BoradItem } from '@/types/board.ts';
import { BoardCard } from '@/components/board/BoardCard.tsx';

export function Home() {
  const [boardName, setBoardName] = useState('');
  const boards: BoradItem[] = useBoardsStore((s) => s.boards);
  const addBoard = useBoardsStore((s) => s.addBoard);
  const syncBoards = useBoardsStore((s) => s.syncBoards);
  const user = useAuthStore((s) => s.user);
  const online = useNetworkStatus();

  useEffect(() => {
    if (online && user?.email) {
      syncBoards(user.email);
    }
  }, [online, user?.email]);

  const handleAdd = () => {
    if (boardName.trim() && user) {
      addBoard(boardName, user.uid, user.email);
      setBoardName('');
    }
  };

  const categorizedBoards = useMemo(() => {
    const recent = [...boards]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 2);
    const shared = boards.filter((b) => b.ownerId !== user?.uid);
    const workspace = boards.filter((b) => !shared.includes(b));

    return { recent, shared, workspace };
  }, [boards, user]);

  const renderBoardGrid = (boards: BoradItem[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
      {boards.length === 0 ? (
        <p className="text-gray-500 text-sm">No boards found.</p>
      ) : (
        boards.map((b) => <BoardCard key={b.id} board={b} userId={user?.uid} />)
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blue-600">Your Boards</h2>
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

      {categorizedBoards.recent.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-2">Recently Updated</h3>
          {renderBoardGrid(categorizedBoards.recent)}
        </section>
      )}

      {categorizedBoards.shared.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-2">Shared with Me</h3>
          {renderBoardGrid(categorizedBoards.shared)}
        </section>
      )}

      <section>
        <h3 className="text-lg font-semibold mb-2">Workspace</h3>
        {renderBoardGrid(categorizedBoards.workspace)}
      </section>
    </div>
  );
}
