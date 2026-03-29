import { Socket } from 'socket.io';
import { updateCursor, getSessionId } from '../presence';
import { isValidCoord } from '../../validate';

export function registerCursorHandlers(socket: Socket): void {
  socket.on('cursor:move', (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const { x, y } = data as Record<string, unknown>;
    if (!isValidCoord(x) || !isValidCoord(y)) return;

    const sessionId = getSessionId(socket.id);
    if (!sessionId) return;
    updateCursor(sessionId, socket.id, x, y);
    socket.to(sessionId).emit('cursor:updated', { socketId: socket.id, x, y });
  });
}
