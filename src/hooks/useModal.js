import { useEffect, useRef } from 'react';

/**
 * Shared behaviour for full-screen viewers (photo lightbox, reel player):
 * locks page scroll, wires keyboard shortcuts, keeps Tab focus inside the
 * dialog and returns focus to whatever opened it on close.
 *
 * @param {boolean} open
 * @param {Record<string, (e: KeyboardEvent) => void>} keys - handlers keyed by e.key
 */
export default function useModal(open, keys = {}) {
  const dialogRef = useRef(null);
  const keysRef = useRef(keys);
  keysRef.current = keys;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const focusFirst = () => {
      const target = dialogRef.current?.querySelector('[data-autofocus]') || dialogRef.current;
      target?.focus({ preventScroll: true });
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKey = (e) => {
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        return;
      }
      // Let focused controls keep their native keys (Space presses a button,
      // arrows move a slider).
      const tag = e.target?.tagName;
      if (tag === 'INPUT' && e.key !== 'Escape') return;
      if (tag === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
      const handler = keysRef.current[e.key];
      if (handler) {
        e.preventDefault();
        handler(e);
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      if (opener && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
    };
  }, [open]);

  return dialogRef;
}

/** Horizontal/vertical swipe detection for touch devices. */
export function useSwipe({ onLeft, onRight, onUp, onDown, threshold = 50 }) {
  const start = useRef(null);
  return {
    onTouchStart: (e) => {
      // Dragging a slider (e.g. the seek bar) is not a swipe.
      if (e.target?.tagName === 'INPUT') { start.current = null; return; }
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e) => {
      if (!start.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      start.current = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
      if (Math.abs(dx) > Math.abs(dy)) (dx < 0 ? onLeft : onRight)?.();
      else (dy < 0 ? onUp : onDown)?.();
    },
  };
}
