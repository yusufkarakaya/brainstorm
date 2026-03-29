// Allowed CSS hex colors the client can pick
const ALLOWED_COLORS = new Set([
  '#fef08a', '#86efac', '#93c5fd', '#f9a8d4',
  '#fdba74', '#c4b5fd', '#f87171',
]);

const SESSION_ID_RE = /^[A-Za-z0-9_-]{17}$/;

export function isValidSessionId(id: unknown): id is string {
  return typeof id === 'string' && SESSION_ID_RE.test(id);
}

export function sanitizeString(value: unknown, maxLen: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.slice(0, maxLen);
  return trimmed;
}

export function isValidColor(color: unknown): color is string {
  return typeof color === 'string' && ALLOWED_COLORS.has(color);
}

export function isValidCoord(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v) && v >= -10_000 && v <= 10_000;
}

export function isValidDimension(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v) && v >= 50 && v <= 1_000;
}
