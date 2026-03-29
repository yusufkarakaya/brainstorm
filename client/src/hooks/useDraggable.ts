import { useRef, useCallback } from 'react';

interface DragResult {
  x: number;
  y: number;
}

export function useDraggable(onDragEnd: (result: DragResult) => void, onDragMove?: (result: DragResult) => void) {
  const dragging = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent, currentX: number, currentY: number) => {
      e.preventDefault();
      e.stopPropagation();
      dragging.current = true;
      startPointer.current = { x: e.clientX, y: e.clientY };
      startPos.current = { x: currentX, y: currentY };

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const handleMove = (ev: PointerEvent) => {
        if (!dragging.current) return;
        const dx = ev.clientX - startPointer.current.x;
        const dy = ev.clientY - startPointer.current.y;
        onDragMove?.({ x: startPos.current.x + dx, y: startPos.current.y + dy });
      };

      const handleUp = (ev: PointerEvent) => {
        if (!dragging.current) return;
        dragging.current = false;
        const dx = ev.clientX - startPointer.current.x;
        const dy = ev.clientY - startPointer.current.y;
        onDragEnd({ x: startPos.current.x + dx, y: startPos.current.y + dy });
        target.releasePointerCapture(e.pointerId);
        target.removeEventListener('pointermove', handleMove);
        target.removeEventListener('pointerup', handleUp);
      };

      target.addEventListener('pointermove', handleMove);
      target.addEventListener('pointerup', handleUp);
    },
    [onDragEnd, onDragMove]
  );

  return { onPointerDown };
}
