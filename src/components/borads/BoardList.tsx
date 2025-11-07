import { useState } from 'react'
import { useBoardsStore } from '@/store/boards'
import { useAuthStore } from '@/store/auth'
import { Link } from '@tanstack/react-router'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function BoardList() {
  const [boardName, setBoardName] = useState('')
  const boards = useBoardsStore((s) => s.boards)
  const addBoard = useBoardsStore((s) => s.addBoard)
  const deleteBoard = useBoardsStore((s) => s.deleteBoard)
  const user = useAuthStore((s) => s.user)

  const logout = async () => {
    await signOut(auth)
    useAuthStore.getState().logout()
  }

  const handleAdd = () => {
    if (boardName.trim() && user) {
      addBoard(boardName, user.uid)
      setBoardName('')
    }
  }

  return (
    <div className="relative max-w-md mx-auto space-y-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-600">Your Boards</h2>
        <button
          onClick={logout}
          className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          placeholder="New board name"
          className="border rounded px-3 py-2 flex-grow focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
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
              <button
                onClick={() => deleteBoard(b.id)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
