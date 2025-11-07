import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBoardsStore } from './boards'

vi.mock('localforage', () => {
  const store: Record<string, any> = {}
  return {
    setItem: async (key: string, value: any) => {
      store[key] = value
      return value
    },
    getItem: async (key: string) => store[key],
    removeItem: async (key: string) => delete store[key],
    clear: async () => Object.keys(store).forEach((k) => delete store[k]),
  }
})

describe('useBoardsStore', () => {
  beforeEach(() => {
    useBoardsStore.setState({ boards: [] })
  })

  it('adds a new board', () => {
    const { addBoard } = useBoardsStore.getState()
    addBoard('Project Alpha', 'user123')

    const boards = useBoardsStore.getState().boards
    expect(boards).toHaveLength(1)
    expect(boards[0].name).toBe('Project Alpha')
    expect(boards[0].ownerId).toBe('user123')
  })

  it('deletes a board by ID', () => {
    const { addBoard, deleteBoard } = useBoardsStore.getState()
    addBoard('To Delete', 'user456')
    const boardId = useBoardsStore.getState().boards[0].id

    deleteBoard(boardId)
    const boards = useBoardsStore.getState().boards
    expect(boards).toHaveLength(0)
  })

  it('does not delete other boards', () => {
    const { addBoard, deleteBoard } = useBoardsStore.getState()
    addBoard('Keep Me', 'user1')
    addBoard('Remove Me', 'user2')
    const removeId = useBoardsStore.getState().boards.find((b) => b.name === 'Remove Me')!.id

    deleteBoard(removeId)
    const boards = useBoardsStore.getState().boards
    expect(boards).toHaveLength(1)
    expect(boards[0].name).toBe('Keep Me')
  })
})
