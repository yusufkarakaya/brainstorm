import { CursorState } from '../types';

// roomId → socketId → CursorState
const rooms = new Map<string, Map<string, CursorState>>();

export function joinRoom(sessionId: string, cursor: CursorState): void {
  if (!rooms.has(sessionId)) rooms.set(sessionId, new Map());
  rooms.get(sessionId)!.set(cursor.socketId, cursor);
}

export function updateCursor(sessionId: string, socketId: string, x: number, y: number): void {
  rooms.get(sessionId)?.get(socketId) && Object.assign(rooms.get(sessionId)!.get(socketId)!, { x, y });
}

export function leaveRoom(sessionId: string, socketId: string): void {
  rooms.get(sessionId)?.delete(socketId);
  if (rooms.get(sessionId)?.size === 0) rooms.delete(sessionId);
}

export function getCursors(sessionId: string, excludeSocketId: string): CursorState[] {
  const room = rooms.get(sessionId);
  if (!room) return [];
  return Array.from(room.values()).filter(c => c.socketId !== excludeSocketId);
}

export function getSessionId(socketId: string): string | undefined {
  for (const [sessionId, cursors] of rooms) {
    if (cursors.has(socketId)) return sessionId;
  }
  return undefined;
}
