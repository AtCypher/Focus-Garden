import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Button, type ButtonProps } from '@/app/ui/Button';

interface Props extends Omit<ButtonProps, 'onClick'> {
  /** Called when the hold completes (or the keyboard confirmation is accepted). */
  onConfirm: () => void;
  holdMs?: number;
  confirmLabel?: string;
}

/**
 * Press-and-hold to confirm. Pointer users hold for `holdMs`; keyboard and assistive-tech users get a
 * small confirmation dialog instead of a timed hold, which would be inaccessible.
 */
export function HoldButton({
  onConfirm,
  holdMs = 1500,
  confirmLabel = 'Yes, give up',
  children,
  className = '',
  ...rest
}: Props) {
  const [progress, setProgress] = useState(0);
  const [asking, setAsking] = useState(false);
  const raf = useRef<number | null>(null);
  const startedAt = useRef<number | null>(null);
  const confirmed = useRef(false);
  const holding = useRef(false);
  const keepButton = useRef<HTMLButtonElement>(null);

  const stop = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    holding.current = false;
    startedAt.current = null;
    setProgress(0);
  };

  const step = (t: number) => {
    if (!holding.current) return;
    if (startedAt.current === null) startedAt.current = t;
    const p = Math.min(1, (t - startedAt.current) / holdMs);
    setProgress(p);
    if (p >= 1) {
      stop();
      if (!confirmed.current) {
        confirmed.current = true;
        onConfirm();
      }
      return;
    }
    raf.current = requestAnimationFrame(step);
  };

  const begin = () => {
    confirmed.current = false;
    holding.current = true;
    startedAt.current = null;
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => () => stop(), []);
  useEffect(() => {
    if (asking) keepButton.current?.focus();
  }, [asking]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setAsking(true);
    }
  };

  return (
    <>
      <Button
        {...rest}
        className={`relative overflow-hidden ${className}`}
        onPointerDown={(e) => {
          if (e.button === 0) begin();
        }}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onKeyDown={onKeyDown}
        onContextMenu={(e) => e.preventDefault()}
        aria-describedby="hold-hint"
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 bg-black/15 transition-[width] duration-75 dark:bg-white/20"
          style={{ width: `${progress * 100}%` }}
        />
        <span className="relative">{children}</span>
      </Button>
      <span id="hold-hint" className="sr-only">
        Press and hold, or press Enter to confirm.
      </span>
      {asking && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hold-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="card w-full max-w-sm p-5">
            <h2 id="hold-dialog-title" className="text-lg font-semibold">
              Give up on this plant?
            </h2>
            <p className="text-muted mt-1 text-sm">
              It will wilt and earn no dew. You can plant again right away.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button ref={keepButton} variant="ghost" onClick={() => setAsking(false)}>
                Keep going
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setAsking(false);
                  onConfirm();
                }}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
