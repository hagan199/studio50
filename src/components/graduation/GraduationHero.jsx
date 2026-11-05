import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../../utils/motion';
import { LongArrowIcon, PauseIcon, PlayIcon } from './icons';
// Same visual language as the homepage hero: overlay, type scale, buttons.
import '../sections/HeroSection.css';

function HeroSkeleton() {
  return (
    <section className="hero">
      <div className="hero__bg">
        <div className="skeleton-block dark" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, borderRadius: 0 }} />
      </div>
      <div className="hero__inner">
        <div className="hero__content">
          <div className="skeleton-block" style={{ width: 160, height: 28, marginBottom: 24, borderRadius: 50 }} />
          <div className="skeleton-block" style={{ width: '70%', height: '3.5rem', marginBottom: 16 }} />
          <div className="skeleton-block" style={{ width: '50%', height: '3.5rem', marginBottom: 24 }} />
          <div className="skeleton-block" style={{ width: '60%', height: '1rem', marginBottom: 40 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="skeleton-block" style={{ width: 160, height: 50, borderRadius: 8 }} />
            <div className="skeleton-block" style={{ width: 160, height: 50, borderRadius: 8 }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function GraduationHero({ hero, brand }) {
  const videos = (hero?.videos || []).filter((v) => v?.url);
  const count = videos.length;
  const seconds = Math.max(3, Number(hero?.slideSeconds) || 8);

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(() => prefersReducedMotion());
  const [hovering, setHovering] = useState(false);
  const sectionRef = useRef(null);
  const videoRefs = useRef([]);

  const next = useCallback(() => setCurrent((i) => (i + 1) % Math.max(count, 1)), [count]);

  useEffect(() => {
    if (current >= count) setCurrent(0);
  }, [count, current]);

  // Rotate between clips; each clip loops on its own while it is showing.
  useEffect(() => {
    if (count < 2 || paused || hovering) return;
    const id = setInterval(next, seconds * 1000);
    return () => clearInterval(id);
  }, [count, paused, hovering, seconds, next, current]);

  // Only the visible clip plays; the rest are paused and rewound so they
  // start from the top when they fade in.
  useEffect(() => {
    videoRefs.current.forEach((el, i) => {
      if (!el) return;
      el.muted = true;
      if (i === current && !paused) {
        el.play().catch(() => {});
      } else {
        el.pause();
        if (i !== current) el.currentTime = 0;
      }
    });
  }, [current, paused, count]);

  useEffect(() => {
    if (!hero || !sectionRef.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-label', { y: 30, opacity: 0, duration: 0.8 })
        .from('.hero-heading', { y: 80, opacity: 0, duration: 1.2, ease: 'power4.out' }, '-=0.5')
        .from('.hero-divider', { scaleX: 0, opacity: 0, duration: 0.8 }, '-=0.6')
        .from('.section-paragraph', { y: 40, opacity: 0, duration: 0.9 }, '-=0.5')
        .from('.hero-buttons .button', { y: 30, opacity: 0, duration: 0.7, stagger: 0.12 }, '-=0.4')
        .from('.hero-slide-nav', { y: 20, opacity: 0, duration: 0.6 }, '-=0.3');
    }, sectionRef);
    return () => ctx.revert();
  }, [hero]);

  if (!hero) return <HeroSkeleton />;

  return (
    <section
      className="hero grad-hero"
      ref={sectionRef}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ '--grad-slide-duration': `${seconds}s` }}
      aria-label={hero.headline}
    >
      <div className="hero__bg">
        {videos.map((video, i) => {
          // Mount the visible clip and its neighbours only; background video
          // is heavy and nobody has asked for the rest yet.
          const distance = Math.min(Math.abs(i - current), count - Math.abs(i - current));
          if (distance > 1) return <div key={video.id || i} className="hero__slide" />;
          return (
            <div key={video.id || i} className={`hero__slide ${i === current ? 'active' : ''}`}>
              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                className="hero__slide-img"
                src={video.url}
                poster={video.posterUrl || undefined}
                muted
                loop
                playsInline
                autoPlay={i === current && !paused}
                preload={i === current ? 'auto' : 'metadata'}
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
          );
        })}
        <div className="hero__overlay" />
      </div>

      <div className="hero__inner">
        <div className="hero__content">
          <span className="hero-label">{hero.label || brand?.shortName || 'Graduation'}</span>
          <h1 className="hero-heading">{hero.headline}</h1>
          <div className="hero-divider" />
          {hero.subheadline && <p className="section-paragraph">{hero.subheadline}</p>}

          <div className="hero-buttons">
            {hero.ctaText && (
              <a href={hero.ctaLink || '#graduation-packages'} className="button hero-btn primary">
                <span>{hero.ctaText}</span>
                <LongArrowIcon />
              </a>
            )}
            {hero.secondaryCtaText && (
              <a href={hero.secondaryCtaLink || '#graduation-reels'} className="button hero-btn secondary">
                <span>{hero.secondaryCtaText}</span>
              </a>
            )}
          </div>
        </div>

        {count > 0 && (
          <div className="hero-slide-nav">
            <button
              type="button"
              className="grad-hero__toggle"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? 'Play background video' : 'Pause background video'}
            >
              {paused ? <PlayIcon width={14} height={14} /> : <PauseIcon width={14} height={14} />}
            </button>
            {count > 1 && (
              <>
                <div className="hero-slide-counter">
                  <span className="hero-slide-current">{String(current + 1).padStart(2, '0')}</span>
                  <span className="hero-slide-sep">/</span>
                  <span className="hero-slide-total">{String(count).padStart(2, '0')}</span>
                </div>
                <div className={`hero-slide-bars${paused || hovering ? ' is-paused' : ''}`}>
                  {videos.map((video, i) => (
                    <button
                      key={video.id || i}
                      type="button"
                      className={`hero-bar ${i === current ? 'active' : ''}`}
                      onClick={() => setCurrent(i)}
                      aria-label={`Show video ${i + 1}`}
                      aria-current={i === current}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
