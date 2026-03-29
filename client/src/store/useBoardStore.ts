import { create } from 'zustand';

export interface Card {
  id: string;
  session_id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  z_index: number;
  created_at: number;
  updated_at: number;
}

export interface PeerCursor {
  socketId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
}

export interface EditingState {
  cardId: string;
  socketId: string;
}

interface BoardState {
  cards: Card[];
  cursors: Record<string, PeerCursor>;
  editing: EditingState[];

  setCards: (cards: Card[]) => void;
  upsertCard: (card: Card) => void;
  removeCard: (id: string) => void;

  upsertCursor: (cursor: PeerCursor) => void;
  removeCursor: (socketId: string) => void;

  setEditing: (cardId: string, socketId: string) => void;
  clearEditing: (cardId: string, socketId: string) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  cards: [],
  cursors: {},
  editing: [],

  setCards: (cards) => set({ cards }),

  upsertCard: (card) =>
    set((s) => {
      const idx = s.cards.findIndex((c) => c.id === card.id);
      if (idx === -1) return { cards: [...s.cards, card] };
      const next = [...s.cards];
      // Only update if incoming is newer
      if (card.updated_at >= next[idx].updated_at) next[idx] = card;
      return { cards: next };
    }),

  removeCard: (id) => set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),

  upsertCursor: (cursor) =>
    set((s) => ({ cursors: { ...s.cursors, [cursor.socketId]: cursor } })),

  removeCursor: (socketId) =>
    set((s) => {
      const next = { ...s.cursors };
      delete next[socketId];
      return { cursors: next };
    }),

  setEditing: (cardId, socketId) =>
    set((s) => ({ editing: [...s.editing.filter((e) => !(e.cardId === cardId && e.socketId === socketId)), { cardId, socketId }] })),

  clearEditing: (cardId, socketId) =>
    set((s) => ({ editing: s.editing.filter((e) => !(e.cardId === cardId && e.socketId === socketId)) })),
}));
