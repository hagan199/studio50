const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * True when the visitor has asked their OS to limit animation. Decorative
 * motion (auto-advancing slides, the marquee, scroll reveals) must respect it.
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

/** Subscribe to changes so a running animation can stop mid-session. */
export function onReducedMotionChange(handler) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  const listener = (e) => handler(e.matches);
  mq.addEventListener('change', listener);
  return () => mq.removeEventListener('change', listener);
}
