import { useState } from 'react'
import { useCardsStore } from '@/store/cards'

export function CardList({ columnId }: { columnId: string }) {
  const [title, setTitle] = useState('')
  const cards = useCardsStore((s) => s.cards.filter((c) => c.columnId === columnId))
  const addCard = useCardsStore((s) => s.addCard)
  const deleteCard = useCardsStore((s) => s.deleteCard)

  const handleAdd = () => {
    if (title.trim()) {
      addCard(columnId, title)
      setTitle('')
    }
  }

  return (
    <div>
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white border rounded p-2 mb-2 shadow-sm flex justify-between items-center"
        >
          <span>{card.title}</span>
          <button
            onClick={() => deleteCard(card.id)}
            className="text-xs text-red-500 hover:text-red-600"
          >
            ×
          </button>
        </div>
      ))}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New card"
        className="border rounded px-2 py-1 w-full mb-2"
      />
      <button
        onClick={handleAdd}
        className="w-full bg-green-600 text-white py-1 rounded hover:bg-green-700"
      >
        Add Card
      </button>
    </div>
  )
}
