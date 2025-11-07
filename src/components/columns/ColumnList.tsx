import { useState, useMemo } from 'react'
import { shallow } from 'zustand/shallow'
import { useColumnsStore } from '@/store/columns'
import { CardList } from '@/components/columns/CardList'
import { useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ColumnList({ boardId }: { boardId: string }) {
  const [title, setTitle] = useState('')
  const allColumns = useColumnsStore((s) => s.columns, shallow)
  const addColumn = useColumnsStore((s) => s.addColumn)
  const router = useRouter()

  const columns = useMemo(
    () => allColumns.filter((c) => c.boardId === boardId),
    [allColumns, boardId]
  )

  const handleAdd = () => {
    if (title.trim()) {
      addColumn(boardId, title)
      setTitle('')
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto p-2">
      <div className="mb-4">
        <Button
          onClick={() => router.navigate({ to: '/' })}
          variant="outline"
          className="text-gray-700 font-medium cursor-pointer"
        >
          ← Back to Boards
        </Button>
      </div>

      {columns.map((col) => (
        <div key={col.id} className="w-72 bg-gray-50 border rounded-lg p-3 flex-shrink-0">
          <h3 className="font-semibold mb-2">{col.title}</h3>
          <CardList columnId={col.id} />
        </div>
      ))}

      <div className="w-72 flex-shrink-0">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
          }}
          placeholder="New column"
          className="w-full mb-2"
        />
        <Button variant="outline" onClick={handleAdd}>
          Add Column
        </Button>
      </div>
    </div>
  )
}
