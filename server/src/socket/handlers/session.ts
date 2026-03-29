import { Socket } from 'socket.io';
import db from '../../db';
import { joinRoom, getCursors } from '../presence';
import { Card } from '../../types';
import { isValidSessionId, sanitizeString } from '../../validate';

export function registerSessionHandlers(socket: Socket): void {
  socket.on('session:join', (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const { sessionId, userName, userColor } = data as Record<string, unknown>;

    if (!isValidSessionId(sessionId)) {
      socket.emit('error', { message: 'Invalid session ID' });
      return;
    }

    const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    const safeName = sanitizeString(userName, 32) || 'Guest';
    // Only allow hex colors (client sends one of the fixed palette colors)
    const safeColor = typeof userColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(userColor)
      ? userColor
      : '#888888';

    socket.join(sessionId);
    joinRoom(sessionId, { socketId: socket.id, sessionId, userName: safeName, userColor: safeColor, x: 0, y: 0 });

    const cards = db.prepare('SELECT * FROM cards WHERE session_id = ? ORDER BY z_index ASC').all(sessionId) as unknown as Card[];
    socket.emit('session:state', { cards });

    const peers = getCursors(sessionId, socket.id);
    socket.emit('cursors:init', { cursors: peers });
    socket.to(sessionId).emit('cursor:updated', { socketId: socket.id, userName: safeName, userColor: safeColor, x: 0, y: 0 });
  });
}
