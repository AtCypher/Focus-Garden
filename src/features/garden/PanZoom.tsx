import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { IconMinus, IconPlus } from '@/app/ui/icons';

interface Props {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  minScale?: number;
  maxScale?: number;
}

interface View {
  scale: number;
  x: number;
  y: number;
}

/**
 * Pan with drag or one finger, zoom with wheel, pinch or the buttons. Taps still reach children:
 * a click is suppressed only after a real drag.
 */
export function PanZoom({ children, className = '', style, minScale = 0.5, maxScale = 3 }: Props) {
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 });
  const container = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ x: number; y: number; dist: number } | null>(null);
  const dragged = useRef(false);

  const clampScale = useCallback(
    (s: number) => Math.min(maxScale, Math.max(minScale, s)),
    [minScale, maxScale],
  );

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number) => {
      setView((v) => {
        const scale = clampScale(v.scale * factor);
        const k = scale / v.scale;
        return { scale, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k };
      });
    },
    [clampScale],
  );

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    last.current =
      pts.length === 2
        ? {
            x: (pts[0].x + pts[1].x) / 2,
            y: (pts[0].y + pts[1].y) / 2,
            dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
          }
        : { x: e.clientX, y: e.clientY, dist: 0 };
    dragged.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const prev = last.current;
    if (!prev) return;
    if (pts.length >= 2) {
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const rect = container.current!.getBoundingClientRect();
      if (!dragged.current)
        for (const id of pointers.current.keys()) container.current?.setPointerCapture(id);
      if (prev.dist > 0) zoomAt(dist / prev.dist, cx - rect.left, cy - rect.top);
      setView((v) => ({ ...v, x: v.x + (cx - prev.x), y: v.y + (cy - prev.y) }));
      last.current = { x: cx, y: cy, dist };
      dragged.current = true;
    } else {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      if (!dragged.current && Math.hypot(dx, dy) < 6) return;
      if (!dragged.current) {
        // Capture only once a real drag starts, so plain taps still reach the plants underneath.
        for (const id of pointers.current.keys()) container.current?.setPointerCapture(id);
      }
      dragged.current = true;
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
      last.current = { x: e.clientX, y: e.clientY, dist: 0 };
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const pts = [...pointers.current.values()];
    last.current = pts.length === 1 ? { x: pts[0].x, y: pts[0].y, dist: 0 } : null;
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (dragged.current) {
      e.stopPropagation();
      e.preventDefault();
      dragged.current = false;
    }
  };

  const reset = () => setView({ scale: 1, x: 0, y: 0 });

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <div
        ref={container}
        className="h-full w-full touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        onDoubleClick={reset}
      >
        <div
          className="h-full w-full"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: '0 0',
          }}
        >
          {children}
        </div>
      </div>
      <div className="absolute right-2 bottom-2 flex flex-col gap-1" role="group" aria-label="Zoom">
        <button
          type="button"
          aria-label="Zoom in"
          className="focus-ring card flex h-9 w-9 items-center justify-center"
          onClick={() =>
            zoomAt(
              1.25,
              (container.current?.clientWidth ?? 0) / 2,
              (container.current?.clientHeight ?? 0) / 2,
            )
          }
        >
          <IconPlus width={18} height={18} />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          className="focus-ring card flex h-9 w-9 items-center justify-center"
          onClick={() =>
            zoomAt(
              0.8,
              (container.current?.clientWidth ?? 0) / 2,
              (container.current?.clientHeight ?? 0) / 2,
            )
          }
        >
          <IconMinus width={18} height={18} />
        </button>
        <button
          type="button"
          aria-label="Reset view"
          className="focus-ring card flex h-9 w-9 items-center justify-center text-xs font-medium"
          onClick={reset}
        >
          1:1
        </button>
      </div>
    </div>
  );
}
