import { describe, it, expect, beforeEach } from 'vitest';
import { useModalStore } from './modals';

describe('useModalStore', () => {
  beforeEach(() => {
    useModalStore.setState({
      cardModal: { isOpen: false, boardId: null, columnId: null, cardId: null },
    });
  });

  it('should initialize with closed modal state', () => {
    const { cardModal } = useModalStore.getState();
    expect(cardModal.isOpen).toBe(false);
    expect(cardModal.boardId).toBeNull();
    expect(cardModal.columnId).toBeNull();
    expect(cardModal.cardId).toBeNull();
  });

  it('should open modal with provided ids', () => {
    const { openCardModal } = useModalStore.getState();
    openCardModal('board1', 'col1', 'card1');

    const { cardModal } = useModalStore.getState();
    expect(cardModal.isOpen).toBe(true);
    expect(cardModal.boardId).toBe('board1');
    expect(cardModal.columnId).toBe('col1');
    expect(cardModal.cardId).toBe('card1');
  });

  it('should close modal and reset ids', () => {
    const { openCardModal, closeCardModal } = useModalStore.getState();
    openCardModal('board2', 'col2', 'card2');
    closeCardModal();

    const { cardModal } = useModalStore.getState();
    expect(cardModal.isOpen).toBe(false);
    expect(cardModal.boardId).toBeNull();
    expect(cardModal.columnId).toBeNull();
    expect(cardModal.cardId).toBeNull();
  });

  it('should replace previous modal state when reopened', () => {
    const { openCardModal } = useModalStore.getState();
    openCardModal('board1', 'col1', 'card1');
    openCardModal('board2', 'col2', 'card2');

    const { cardModal } = useModalStore.getState();
    expect(cardModal.isOpen).toBe(true);
    expect(cardModal.boardId).toBe('board2');
    expect(cardModal.columnId).toBe('col2');
    expect(cardModal.cardId).toBe('card2');
  });

  it('should maintain referential state updates properly', () => {
    const firstState = useModalStore.getState();
    firstState.openCardModal('b1', 'c1', 'cardA');

    const nextState = useModalStore.getState();
    expect(nextState.cardModal).not.toBe(firstState.cardModal);
    expect(nextState.cardModal.boardId).toBe('b1');
  });
});
