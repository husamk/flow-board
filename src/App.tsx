import './App.css'
import { SignIn } from './components/auth/SignIn'
import { useAuthStore } from './store/auth'
import { useAuthListener } from './hooks/useAuthListener'

function App() {
  useAuthListener()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="app-container">
      <h1 className="app-title">FlowBoard</h1>

      {!user ? (
        <SignIn />
      ) : (
        <div className="text-center">
          <p className="mb-4">Welcome, {user.displayName}</p>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default App
