import { PeerCursor as PeerCursorType } from '../store/useBoardStore';

interface PeerCursorProps {
  cursor: PeerCursorType;
  color: string;
}

export default function PeerCursor({ cursor }: PeerCursorProps) {
  return (
    <div
      className="peer-cursor"
      style={{ left: cursor.x, top: cursor.y }}
    >
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
        <path d="M0 0L0 16L4.5 12L7.5 19L9.5 18L6.5 11L12 11Z" fill={cursor.userColor} stroke="white" strokeWidth="1" />
      </svg>
      <span className="cursor-label" style={{ backgroundColor: cursor.userColor }}>{cursor.userName}</span>
    </div>
  );
}
