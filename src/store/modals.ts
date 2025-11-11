import { create } from 'zustand';

interface ModalState {
  cardModal: {
    isOpen: boolean;
    boardId?: string | null;
    columnId?: string | null;
    cardId?: string | null;
  };
  openCardModal: (boardId: string, columnId: string, cardId: string) => void;
  closeCardModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  cardModal: { isOpen: false, boardId: null, columnId: null, cardId: null },
  openCardModal: (boardId, columnId, cardId) =>
    set({ cardModal: { isOpen: true, boardId, columnId, cardId } }),
  closeCardModal: () =>
    set({ cardModal: { isOpen: false, boardId: null, columnId: null, cardId: null } }),
}));
