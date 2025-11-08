import { useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePendingQueue } from '@/store/pendingQueue';

export function PendingQueueWatcher() {
  const online = useNetworkStatus();
  const flush = usePendingQueue((s) => s.flush);

  useEffect(() => {
    if (online) {
      flush();
    }
  }, [online]);

  return null;
}
