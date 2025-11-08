import './App.css';
import { AppRouter } from '@/router';
import { useAuthListener } from '@/hooks/useAuthListener.ts';
import { PendingQueueWatcher } from '@/components/data/PendingQueueWatcher.tsx';

function App() {
  useAuthListener();
  return (
    <>
      <PendingQueueWatcher />
      <AppRouter />
    </>
  );
}

export default App;
