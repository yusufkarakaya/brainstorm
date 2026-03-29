import { Socket } from 'socket.io';
import { nanoid } from 'nanoid';
import db from '../../db';
import { getSessionId } from '../presence';
import { Card } from '../../types';
import { isValidSessionId, sanitizeString, isValidColor, isValidCoord, isValidDimension } from '../../validate';

export function registerCardHandlers(socket: Socket): void {
  socket.on('card:create', (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const { sessionId, x, y, color } = data as Record<string, unknown>;

    // Verify the socket actually joined this session
    const joinedSession = getSessionId(socket.id);
    if (!isValidSessionId(sessionId) || joinedSession !== sessionId) return;
    if (!isValidCoord(x) || !isValidCoord(y)) return;
    if (!isValidColor(color)) return;

    const id = nanoid(17); // server-generated — never trust client IDs
    const now = Date.now();

    const row = db.prepare('SELECT MAX(z_index) as m FROM cards WHERE session_id = ?').get(sessionId) as { m: number | null } | undefined;
    const maxZ = row?.m ?? 0;

    db.prepare(`
      INSERT INTO cards (id, session_id, content, x, y, width, height, color, z_index, created_at, updated_at)
      VALUES (?, ?, '', ?, ?, 200, 120, ?, ?, ?, ?)
    `).run(id, sessionId, x, y, color, maxZ + 1, now, now);

    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(id) as unknown as Card;
    socket.to(sessionId).emit('card:created', { card });
    socket.emit('card:created', { card }); // send authoritative card (with server-generated id) back to creator
  });

  socket.on('card:update', (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const { id, content, x, y, width, height, color } = data as Record<string, unknown>;

    if (typeof id !== 'string') return;

    const existing = db.prepare('SELECT * FROM cards WHERE id = ?').get(id) as Card | undefined;
    if (!existing) return;

    // Verify socket belongs to this card's session
    const joinedSession = getSessionId(socket.id);
    if (joinedSession !== existing.session_id) return;

    const now = Date.now();
    const updated: Card = {
      ...existing,
      content: sanitizeString(content, 2000) ?? existing.content,
      x: isValidCoord(x) ? x : existing.x,
      y: isValidCoord(y) ? y : existing.y,
      width: isValidDimension(width) ? width : existing.width,
      height: isValidDimension(height) ? height : existing.height,
      color: isValidColor(color) ? color : existing.color,
      updated_at: now,
    };

    db.prepare(`
      UPDATE cards SET content=?, x=?, y=?, width=?, height=?, color=?, z_index=?, updated_at=? WHERE id=?
    `).run(updated.content, updated.x, updated.y, updated.width, updated.height, updated.color, updated.z_index, now, id);

    socket.to(existing.session_id).emit('card:updated', { card: updated });
  });

  socket.on('card:delete', (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const { id } = data as Record<string, unknown>;

    if (typeof id !== 'string') return;

    const existing = db.prepare('SELECT session_id FROM cards WHERE id = ?').get(id) as { session_id: string } | undefined;
    if (!existing) return;

    const joinedSession = getSessionId(socket.id);
    if (joinedSession !== existing.session_id) return;

    db.prepare('DELETE FROM cards WHERE id = ?').run(id);
    socket.to(existing.session_id).emit('card:deleted', { id });
  });

  socket.on('card:bring_to_front', (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const { id } = data as Record<string, unknown>;

    if (typeof id !== 'string') return;

    const existing = db.prepare('SELECT * FROM cards WHERE id = ?').get(id) as Card | undefined;
    if (!existing) return;

    const joinedSession = getSessionId(socket.id);
    if (joinedSession !== existing.session_id) return;

    const row = db.prepare('SELECT MAX(z_index) as m FROM cards WHERE session_id = ?').get(existing.session_id) as { m: number | null } | undefined;
    const newZ = (row?.m ?? 0) + 1;
    db.prepare('UPDATE cards SET z_index=?, updated_at=? WHERE id=?').run(newZ, Date.now(), id);
    const updated = { ...existing, z_index: newZ };
    socket.to(existing.session_id).emit('card:updated', { card: updated });
    socket.emit('card:updated', { card: updated });
  });

  socket.on('card:editing', (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const { id } = data as Record<string, unknown>;
    if (typeof id !== 'string') return;
    const sessionId = getSessionId(socket.id);
    if (sessionId) socket.to(sessionId).emit('card:editing', { id, socketId: socket.id });
  });

  socket.on('card:editing_done', (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const { id } = data as Record<string, unknown>;
    if (typeof id !== 'string') return;
    const sessionId = getSessionId(socket.id);
    if (sessionId) socket.to(sessionId).emit('card:editing_done', { id, socketId: socket.id });
  });
}
