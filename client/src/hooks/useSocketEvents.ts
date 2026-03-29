import { useEffect } from 'react';
import socket from '../socket';
import { useBoardStore, Card, PeerCursor } from '../store/useBoardStore';

export function useSocketEvents() {
  const { setCards, upsertCard, removeCard, upsertCursor, removeCursor, setEditing, clearEditing } = useBoardStore();

  useEffect(() => {
    socket.on('session:state', ({ cards }: { cards: Card[] }) => setCards(cards));

    socket.on('cursors:init', ({ cursors }: { cursors: PeerCursor[] }) => {
      cursors.forEach((c) => upsertCursor(c));
    });

    socket.on('card:created', ({ card }: { card: Card }) => upsertCard(card));
    socket.on('card:updated', ({ card }: { card: Card }) => upsertCard(card));
    socket.on('card:deleted', ({ id }: { id: string }) => removeCard(id));

    socket.on('cursor:updated', (data: { socketId: string; userName?: string; userColor?: string; x: number; y: number }) => {
      const existing = useBoardStore.getState().cursors[data.socketId];
      upsertCursor({
        socketId: data.socketId,
        userName: data.userName ?? existing?.userName ?? 'Guest',
        userColor: data.userColor ?? existing?.userColor ?? '#888',
        x: data.x,
        y: data.y,
      });
    });

    socket.on('cursor:left', ({ socketId }: { socketId: string }) => removeCursor(socketId));

    socket.on('card:editing', ({ id, socketId }: { id: string; socketId: string }) => setEditing(id, socketId));
    socket.on('card:editing_done', ({ id, socketId }: { id: string; socketId: string }) => clearEditing(id, socketId));

    return () => {
      socket.off('session:state');
      socket.off('cursors:init');
      socket.off('card:created');
      socket.off('card:updated');
      socket.off('card:deleted');
      socket.off('cursor:updated');
      socket.off('cursor:left');
      socket.off('card:editing');
      socket.off('card:editing_done');
    };
  }, [setCards, upsertCard, removeCard, upsertCursor, removeCursor, setEditing, clearEditing]);
}
