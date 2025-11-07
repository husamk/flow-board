import { useState, useMemo } from 'react'
import { shallow } from 'zustand/shallow'
import { useColumnsStore } from '@/store/columns'
import { CardList } from '@/components/columns/CardList'

export function ColumnList({ boardId }: { boardId: string }) {
  const [title, setTitle] = useState('')
  const allColumns = useColumnsStore((s) => s.columns, shallow)
  const addColumn = useColumnsStore((s) => s.addColumn)

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
      {columns.map((col) => (
        <div key={col.id} className="w-72 bg-gray-50 border rounded-lg p-3 flex-shrink-0">
          <h3 className="font-semibold mb-2">{col.title}</h3>
          <CardList columnId={col.id} />
        </div>
      ))}

      <div className="w-72 flex-shrink-0">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAdd()
            }
          }}
          placeholder="New column"
          className="border rounded px-2 py-1 w-full mb-2"
        />
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
        >
          Add Column
        </button>
      </div>
    </div>
  )
}
