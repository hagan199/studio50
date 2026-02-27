import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';

let lenisInstance = null;

export function useLenis() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || lenisInstance) return;
    initialized.current = true;

    lenisInstance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    lenisInstance.on('scroll', () => {
      if (typeof window.ScrollTrigger !== 'undefined') {
        window.ScrollTrigger.update();
      }
    });

    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Don't destroy on hot reload
    };
  }, []);

  return lenisInstance;
}

export function getLenis() {
  return lenisInstance;
}
