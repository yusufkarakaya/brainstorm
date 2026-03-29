import { useState, useCallback } from 'react';
import socket from '../socket';
import { useBoardStore, Card } from '../store/useBoardStore';
import { useDraggable } from '../hooks/useDraggable';
import CardEditor from './CardEditor';

interface IdeaCardProps {
  card: Card;
  sessionId: string;
}

export default function IdeaCard({ card }: IdeaCardProps) {
  const [editing, setEditing] = useState(false);
  const [localPos, setLocalPos] = useState<{ x: number; y: number } | null>(null);
  const [localContent, setLocalContent] = useState(card.content);
  const upsertCard = useBoardStore((s) => s.upsertCard);
  const editingState = useBoardStore((s) => s.editing);
  const isPeerEditing = editingState.some((e) => e.cardId === card.id);

  const x = localPos?.x ?? card.x;
  const y = localPos?.y ?? card.y;

  const handleDragEnd = useCallback(
    ({ x: nx, y: ny }: { x: number; y: number }) => {
      setLocalPos(null);
      const updated = { ...card, x: nx, y: ny, updated_at: Date.now() };
      upsertCard(updated);
      socket.emit('card:update', { id: card.id, x: nx, y: ny, updated_at: updated.updated_at });
    },
    [card, upsertCard]
  );

  const handleDragMove = useCallback(({ x: nx, y: ny }: { x: number; y: number }) => {
    setLocalPos({ x: nx, y: ny });
  }, []);

  const { onPointerDown } = useDraggable(handleDragEnd, handleDragMove);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      socket.emit('card:bring_to_front', { id: card.id });
      onPointerDown(e, card.x, card.y);
    },
    [card.id, card.x, card.y, onPointerDown]
  );

  const handleDoubleClick = useCallback(() => {
    setEditing(true);
  }, []);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      socket.emit('card:delete', { id: card.id });
      useBoardStore.getState().removeCard(card.id);
    },
    [card.id]
  );

  return (
    <div
      className={`idea-card ${isPeerEditing ? 'peer-editing' : ''}`}
      style={{
        left: x,
        top: y,
        backgroundColor: card.color,
        zIndex: card.z_index,
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="card-header"
        onPointerDown={handlePointerDown}
      >
        <button className="card-delete" onClick={handleDelete} title="Delete card">×</button>
      </div>
      <div className="card-body">
        {editing ? (
          <CardEditor
            cardId={card.id}
            content={localContent}
            onContentChange={setLocalContent}
            onBlur={() => setEditing(false)}
          />
        ) : (
          <p className="card-text" onDoubleClick={handleDoubleClick}>
            {localContent || <span className="placeholder">Double-click to edit...</span>}
          </p>
        )}
      </div>
    </div>
  );
}
