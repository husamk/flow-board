import { useBoardsStore } from '@/store/boards';
import { useColumnsStore } from '@/store/columns';
import { useCardsStore } from '@/store/cards';

export const deleteBoardCascade = async (boardId: string) => {
  const { deleteBoard } = useBoardsStore.getState();
  const { getActiveColumns, deleteColumns } = useColumnsStore.getState();
  const { deleteCards } = useCardsStore.getState();

  try {
    const columns = getActiveColumns(boardId);
    for (const col of columns) {
      await deleteCards(boardId, col.id);
    }

    await deleteColumns(boardId);
    await deleteBoard(boardId);

    console.log(`[deleteBoardCascade] Completed successfully for board: ${boardId}`);
  } catch (error) {
    console.error(`[deleteBoardCascade] Failed to delete board ${boardId}:`, error);
  }
};
