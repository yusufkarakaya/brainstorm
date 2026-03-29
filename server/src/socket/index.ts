import { Server, Socket } from 'socket.io';
import { registerSessionHandlers } from './handlers/session';
import { registerCardHandlers } from './handlers/card';
import { registerCursorHandlers } from './handlers/cursor';
import { leaveRoom, getSessionId } from './presence';

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    registerSessionHandlers(socket);
    registerCardHandlers(socket);
    registerCursorHandlers(socket);

    socket.on('disconnect', () => {
      const sessionId = getSessionId(socket.id);
      if (sessionId) {
        leaveRoom(sessionId, socket.id);
        socket.to(sessionId).emit('cursor:left', { socketId: socket.id });
      }
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });
}
