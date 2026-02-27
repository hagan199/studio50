import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollReveal(animationProps = {}, triggerOptions = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const defaults = {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    };

    const tl = gsap.from(ref.current, {
      ...defaults,
      ...animationProps,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        end: 'bottom 20%',
        toggleActions: 'play none none none',
        ...triggerOptions,
      },
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return ref;
}
