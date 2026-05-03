import { useState, useCallback } from 'react';

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  moduleId: string;
}

export function useDragDrop() {
  const [drag, setDrag] = useState<DragState | null>(null);

  const startDrag = useCallback((moduleId: string, clientX: number, clientY: number) => {
    setDrag({ isDragging: true, startX: clientX, startY: clientY, moduleId });
  }, []);

  const onDrag = useCallback(
    (clientX: number, clientY: number, onMove: (id: string, dx: number, dy: number) => void) => {
      if (!drag) return;
      const dx = clientX - drag.startX;
      const dy = clientY - drag.startY;
      onMove(drag.moduleId, dx, dy);
      setDrag({ ...drag, startX: clientX, startY: clientY });
    },
    [drag]
  );

  const endDrag = useCallback(() => setDrag(null), []);

  return { drag, startDrag, onDrag, endDrag };
}
