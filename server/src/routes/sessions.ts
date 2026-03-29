import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import db from '../db';

const router = Router();

router.post('/', (_req: Request, res: Response) => {
  const id = nanoid(17);
  const now = Date.now();
  db.prepare('INSERT INTO sessions (id, created_at, updated_at) VALUES (?, ?, ?)').run(id, now, now);
  res.json({ id });
});

router.get('/:id', (req: Request, res: Response) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json(session);
});

export default router;
