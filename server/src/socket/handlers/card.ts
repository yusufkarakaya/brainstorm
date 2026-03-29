import { Socket } from 'socket.io';
import db from '../../db';
import { getSessionId } from '../presence';
import { Card } from '../../types';

export function registerCardHandlers(socket: Socket): void {
  socket.on('card:create', (data: { id: string; sessionId: string; x: number; y: number; color: string }) => {
    const { id, sessionId, x, y, color } = data;
    const now = Date.now();

    const row = db.prepare('SELECT MAX(z_index) as m FROM cards WHERE session_id = ?').get(sessionId) as { m: number | null } | undefined;
    const maxZ = row?.m ?? 0;

    db.prepare(`
      INSERT INTO cards (id, session_id, content, x, y, width, height, color, z_index, created_at, updated_at)
      VALUES (?, ?, '', ?, ?, 200, 120, ?, ?, ?, ?)
    `).run(id, sessionId, x, y, color, maxZ + 1, now, now);

    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(id) as unknown as Card;
    socket.to(sessionId).emit('card:created', { card });
    socket.emit('card:created', { card });
  });

  socket.on('card:update', (data: Partial<Card> & { id: string }) => {
    const existing = db.prepare('SELECT * FROM cards WHERE id = ?').get(data.id) as Card | undefined;
    if (!existing) return;

    const now = Date.now();
    const updated: Card = {
      ...existing,
      content: data.content ?? existing.content,
      x: data.x ?? existing.x,
      y: data.y ?? existing.y,
      width: data.width ?? existing.width,
      height: data.height ?? existing.height,
      color: data.color ?? existing.color,
      z_index: data.z_index ?? existing.z_index,
      updated_at: now,
    };

    db.prepare(`
      UPDATE cards SET content=?, x=?, y=?, width=?, height=?, color=?, z_index=?, updated_at=? WHERE id=?
    `).run(updated.content, updated.x, updated.y, updated.width, updated.height, updated.color, updated.z_index, now, data.id);

    socket.to(existing.session_id).emit('card:updated', { card: updated });
  });

  socket.on('card:delete', ({ id }: { id: string }) => {
    const existing = db.prepare('SELECT session_id FROM cards WHERE id = ?').get(id) as { session_id: string } | undefined;
    if (!existing) return;
    db.prepare('DELETE FROM cards WHERE id = ?').run(id);
    socket.to(existing.session_id).emit('card:deleted', { id });
  });

  socket.on('card:bring_to_front', ({ id }: { id: string }) => {
    const existing = db.prepare('SELECT * FROM cards WHERE id = ?').get(id) as Card | undefined;
    if (!existing) return;
    const row = db.prepare('SELECT MAX(z_index) as m FROM cards WHERE session_id = ?').get(existing.session_id) as { m: number | null } | undefined;
    const newZ = (row?.m ?? 0) + 1;
    db.prepare('UPDATE cards SET z_index=?, updated_at=? WHERE id=?').run(newZ, Date.now(), id);
    socket.to(existing.session_id).emit('card:updated', { card: { ...existing, z_index: newZ } });
    socket.emit('card:updated', { card: { ...existing, z_index: newZ } });
  });

  socket.on('card:editing', ({ id }: { id: string }) => {
    const sessionId = getSessionId(socket.id);
    if (sessionId) socket.to(sessionId).emit('card:editing', { id, socketId: socket.id });
  });

  socket.on('card:editing_done', ({ id }: { id: string }) => {
    const sessionId = getSessionId(socket.id);
    if (sessionId) socket.to(sessionId).emit('card:editing_done', { id, socketId: socket.id });
  });
}
