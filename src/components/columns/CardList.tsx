import { useState } from 'react'
import { shallow } from 'zustand/shallow'
import { useCardsStore } from '@/store/cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx'

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
    <div className="flex justify-between items-center flex-col gap-3">
      {cards.map((card) => (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
            <CardDescription>{card.description || 'No description provided.'}</CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
                onClick={() => deleteCard(card.id)}
              >
                ×
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      ))}

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="New card"
        className="w-full mb-2"
      />

      <Button
        onClick={handleAdd}
        className="w-full bg-green-600 text-white hover:bg-green-700 cursor-pointer"
      >
        Add Card
      </Button>
    </div>
  )
}
