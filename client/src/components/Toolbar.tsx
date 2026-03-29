import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import socket from '../socket';
import { useBoardStore } from '../store/useBoardStore';
import ShareModal from './ShareModal';

const CARD_COLORS = [
  '#fef08a', // yellow
  '#86efac', // green
  '#93c5fd', // blue
  '#f9a8d4', // pink
  '#fdba74', // orange
  '#c4b5fd', // purple
  '#f87171', // red
];

interface ToolbarProps {
  sessionId: string;
  userColor: string;
}

export default function Toolbar({ sessionId, userColor }: ToolbarProps) {
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);
  const [showShare, setShowShare] = useState(false);
  const upsertCard = useBoardStore((s) => s.upsertCard);

  const handleAddCard = useCallback(() => {
    const id = nanoid(17);
    const now = Date.now();
    // Place near center with slight random offset
    const x = Math.max(40, window.innerWidth / 2 - 100 + (Math.random() - 0.5) * 200);
    const y = Math.max(40, window.innerHeight / 2 - 60 + (Math.random() - 0.5) * 200);

    const card = {
      id,
      session_id: sessionId,
      content: '',
      x,
      y,
      width: 200,
      height: 120,
      color: selectedColor,
      z_index: 0,
      created_at: now,
      updated_at: now,
    };

    upsertCard(card);
    socket.emit('card:create', { id, sessionId, x, y, color: selectedColor });
  }, [sessionId, selectedColor, upsertCard]);

  return (
    <>
      <div className="toolbar">
        <div className="color-picker">
          {CARD_COLORS.map((color) => (
            <button
              key={color}
              className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              title={color}
            />
          ))}
        </div>
        <button className="btn-primary" onClick={handleAddCard}>+ Add Card</button>
        <button
          className="btn-share"
          onClick={() => setShowShare(true)}
          style={{ '--user-color': userColor } as React.CSSProperties}
        >
          Share
        </button>
      </div>
      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </>
  );
}
