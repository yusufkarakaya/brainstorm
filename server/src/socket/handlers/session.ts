import { Socket } from 'socket.io';
import db from '../../db';
import { joinRoom, getCursors } from '../presence';
import { Card } from '../../types';

export function registerSessionHandlers(socket: Socket): void {
  socket.on('session:join', ({ sessionId, userName, userColor }: { sessionId: string; userName: string; userColor: string }) => {
    const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    socket.join(sessionId);

    joinRoom(sessionId, { socketId: socket.id, sessionId, userName, userColor, x: 0, y: 0 });

    const cards = db.prepare('SELECT * FROM cards WHERE session_id = ? ORDER BY z_index ASC').all(sessionId) as unknown as Card[];
    socket.emit('session:state', { cards });

    const peers = getCursors(sessionId, socket.id);
    socket.emit('cursors:init', { cursors: peers });
    socket.to(sessionId).emit('cursor:updated', { socketId: socket.id, userName, userColor, x: 0, y: 0 });
  });
}
