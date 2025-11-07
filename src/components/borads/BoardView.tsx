import { useParams } from '@tanstack/react-router'
import { useBoardsStore } from '@/store/boards'
import { ColumnList } from '@/components/columns/ColumnList'

export function BoardView() {
  const { boardId } = useParams({ from: '/boards/$boardId' })
  const board = useBoardsStore((s) => s.boards.find((b) => b.id === boardId))

  if (!board) {
    return <div className="p-6 text-center text-gray-500">Board not found</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">{board.name}</h2>
      <ColumnList boardId={board.id} />
    </div>
  )
}
