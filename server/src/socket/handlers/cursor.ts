import { Socket } from 'socket.io';
import { updateCursor, getSessionId } from '../presence';

export function registerCursorHandlers(socket: Socket): void {
  socket.on('cursor:move', ({ x, y }: { x: number; y: number }) => {
    const sessionId = getSessionId(socket.id);
    if (!sessionId) return;
    updateCursor(sessionId, socket.id, x, y);
    socket.to(sessionId).emit('cursor:updated', { socketId: socket.id, x, y });
  });
}
