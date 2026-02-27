import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Reusable scroll-triggered animation hook.
 * Attach the returned ref to a container element, then
 * add data-animate attributes to children you want animated.
 *
 * Supported data-animate values:
 *   fade-up, fade-down, fade-left, fade-right,
 *   scale-in, blur-in, flip-up, rotate-in,
 *   stagger-children (animates direct children)
 *
 * Optional attributes:
 *   data-delay="0.2"   — extra delay (seconds)
 *   data-duration="1"  — animation duration
 *   data-stagger="0.1" — stagger interval (for stagger-children)
 */
export default function useScrollAnimation(deps = []) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Individual element animations
      el.querySelectorAll('[data-animate]').forEach((target) => {
        const type = target.getAttribute('data-animate');
        const delay = parseFloat(target.getAttribute('data-delay') || '0');
        const duration = parseFloat(target.getAttribute('data-duration') || '0.9');

        const base = {
          opacity: 0,
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: target,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        };

        switch (type) {
          case 'fade-up':
            gsap.from(target, { ...base, y: 60 });
            break;
          case 'fade-down':
            gsap.from(target, { ...base, y: -40 });
            break;
          case 'fade-left':
            gsap.from(target, { ...base, x: -80 });
            break;
          case 'fade-right':
            gsap.from(target, { ...base, x: 80 });
            break;
          case 'scale-in':
            gsap.from(target, { ...base, scale: 0.8 });
            break;
          case 'blur-in':
            gsap.from(target, { ...base, y: 30, filter: 'blur(12px)' });
            break;
          case 'flip-up':
            gsap.from(target, { ...base, rotateX: 30, y: 40, transformPerspective: 800 });
            break;
          case 'rotate-in':
            gsap.from(target, { ...base, rotate: 8, y: 50, scale: 0.95 });
            break;
          case 'stagger-children': {
            const stagger = parseFloat(target.getAttribute('data-stagger') || '0.12');
            gsap.from(target.children, {
              opacity: 0,
              y: 40,
              duration,
              stagger,
              delay,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: target,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            });
            break;
          }
          default:
            gsap.from(target, base);
        }
      });

      // Parallax images
      el.querySelectorAll('[data-parallax]').forEach((target) => {
        const speed = parseFloat(target.getAttribute('data-parallax') || '-15');
        gsap.to(target, {
          yPercent: speed,
          ease: 'none',
          scrollTrigger: {
            trigger: target.parentElement || target,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // Counter animations
      el.querySelectorAll('[data-count-to]').forEach((target) => {
        const end = parseFloat(target.getAttribute('data-count-to'));
        const suffix = target.getAttribute('data-count-suffix') || '';
        gsap.from(target, {
          textContent: 0,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: target,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          onUpdate() {
            target.textContent = Math.round(parseFloat(target.textContent)) + suffix;
          },
        });
      });
    }, el);

    return () => ctx.revert();
  }, deps);

  return containerRef;
}
