import './App.css';
import { AppRouter } from '@/router';
import { useAuthListener } from '@/hooks/useAuthListener.ts';
import { PendingQueueWatcher } from '@/components/data/PendingQueueWatcher.tsx';
import { BroadcastSync } from '@/components/data/BroadcastSync.tsx';

function App() {
  useAuthListener();
  return (
    <>
      <BroadcastSync />
      <PendingQueueWatcher />
      <AppRouter />
    </>
  );
}

export default App;
