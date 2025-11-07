import './App.css'
import { AppRouter } from '@/router'
import { useAuthListener } from '@/hooks/useAuthListener.ts'

function App() {
  useAuthListener()
  return <AppRouter />
}

export default App
