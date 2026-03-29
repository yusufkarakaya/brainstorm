import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import db from '../db';

const router = Router();

// Simple in-memory rate limiter: max 10 sessions per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

// Valid session ID: nanoid url-safe alphabet, exactly 17 chars
const SESSION_ID_RE = /^[A-Za-z0-9_-]{17}$/;

router.post('/', (req: Request, res: Response) => {
  const ip = req.ip ?? 'unknown';
  if (isRateLimited(ip)) {
    res.status(429).json({ error: 'Too many sessions created. Try again later.' });
    return;
  }

  const id = nanoid(17);
  const now = Date.now();
  db.prepare('INSERT INTO sessions (id, created_at, updated_at) VALUES (?, ?, ?)').run(id, now, now);
  res.json({ id });
});

router.get('/:id', (req: Request, res: Response) => {
  if (!SESSION_ID_RE.test(req.params.id)) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json(session);
});

export default router;
