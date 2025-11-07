import { useState } from 'react'
import { shallow } from 'zustand/shallow'
import { useCardsStore } from '@/store/cards'

export function CardList({ columnId }: { columnId: string }) {
  const [title, setTitle] = useState('')

  const allCards = useCardsStore((s) => s.cards, shallow)
  const addCard = useCardsStore((s) => s.addCard)
  const deleteCard = useCardsStore((s) => s.deleteCard)

  const cards = allCards.filter((c) => c.columnId === columnId)

  const handleAdd = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    addCard(columnId, trimmed)
    setTitle('')
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
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
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
