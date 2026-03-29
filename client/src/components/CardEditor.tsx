import { useRef, useEffect, useCallback } from 'react';
import socket from '../socket';

interface CardEditorProps {
  cardId: string;
  content: string;
  onContentChange: (content: string) => void;
  onBlur: () => void;
}

export default function CardEditor({ cardId, content, onContentChange, onBlur }: CardEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    ref.current?.focus();
    socket.emit('card:editing', { id: cardId });
    return () => {
      socket.emit('card:editing_done', { id: cardId });
    };
  }, [cardId]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      onContentChange(value);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        socket.emit('card:update', { id: cardId, content: value, updated_at: Date.now() });
      }, 500);
    },
    [cardId, onContentChange]
  );

  const handleBlur = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      socket.emit('card:update', { id: cardId, content, updated_at: Date.now() });
    }
    onBlur();
  }, [cardId, content, onBlur]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        (e.target as HTMLTextAreaElement).blur();
      }
    },
    []
  );

  return (
    <textarea
      ref={ref}
      className="card-editor"
      value={content}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="Type your idea..."
    />
  );
}
