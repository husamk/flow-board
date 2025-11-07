import { describe, it, expect, beforeEach } from 'vitest'
import { useBoardsStore } from '@/store/boards.ts'

describe('Boards Store', () => {
  beforeEach(() => {
    useBoardsStore.setState({ boards: [] })
  })

  it('should add a new board', () => {
    const addBoard = useBoardsStore.getState().addBoard
    addBoard('My Test Board', 'user123')

    const boards = useBoardsStore.getState().boards
    expect(boards).toHaveLength(1)
    expect(boards[0].name).toBe('My Test Board')
    expect(boards[0].ownerId).toBe('user123')
  })

  it('should delete a board', () => {
    const { addBoard, deleteBoard } = useBoardsStore.getState()
    addBoard('Temp Board', 'user456')
    const boardId = useBoardsStore.getState().boards[0].id

    deleteBoard(boardId)
    expect(useBoardsStore.getState().boards).toHaveLength(0)
  })
})
