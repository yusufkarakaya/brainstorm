import { useState, useCallback } from 'react';
import socket from '../socket';
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

  const handleAddCard = useCallback(() => {
    const x = Math.max(40, window.innerWidth / 2 - 100 + (Math.random() - 0.5) * 200);
    const y = Math.max(40, window.innerHeight / 2 - 60 + (Math.random() - 0.5) * 200);
    // Server generates the card ID — no client-supplied ID
    socket.emit('card:create', { sessionId, x, y, color: selectedColor });
  }, [sessionId, selectedColor]);

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
