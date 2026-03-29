import { useCallback, useRef } from 'react';
import socket from '../socket';
import { useBoardStore } from '../store/useBoardStore';
import IdeaCard from './IdeaCard';
import PeerCursor from './PeerCursor';

interface CanvasProps {
  sessionId: string;
  userName: string;
  userColor: string;
}

export default function Canvas({ sessionId, userColor }: CanvasProps) {
  const cards = useBoardStore((s) => s.cards);
  const cursors = useBoardStore((s) => s.cursors);
  const lastEmit = useRef(0);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const now = Date.now();
      if (now - lastEmit.current < 33) return; // ~30fps
      lastEmit.current = now;
      const rect = e.currentTarget.getBoundingClientRect();
      socket.emit('cursor:move', { x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    []
  );

  return (
    <div className="canvas" onPointerMove={handlePointerMove}>
      {cards.length === 0 && (
        <div className="empty-state">
          <p>No ideas yet.</p>
          <p>Click <strong>+ Add Card</strong> to start brainstorming.</p>
        </div>
      )}
      {cards.map((card) => (
        <IdeaCard key={card.id} card={card} sessionId={sessionId} />
      ))}
      {Object.values(cursors).map((cursor) => (
        <PeerCursor key={cursor.socketId} cursor={cursor} color={userColor} />
      ))}
    </div>
  );
}
