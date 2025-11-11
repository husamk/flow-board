import { useEffect } from 'react';
import { subscribeToUpdates } from '@/utils/broadcast';
import { useBoardsStore } from '@/store/boards';
import { useCardsStore } from '@/store/cards.ts';
import { useColumnsStore } from '@/store/columns.ts';

export const BroadcastSync = () => {
  const handleBoardMessages = useBoardsStore((s) => s.handleBroadcastMessage);
  const handleColumnMessages = useColumnsStore((s) => s.handleBroadcastMessage);
  const handleCardMessages = useCardsStore((s) => s.handleBroadcastMessage);

  useEffect(() => {
    const unsubscribe = subscribeToUpdates((msg) => {
      if (msg.entity === 'board') handleBoardMessages(msg);
      if (msg.entity === 'column') handleColumnMessages(msg);
      if (msg.entity === 'card') handleCardMessages(msg);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return null;
};
