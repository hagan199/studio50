import { useEffect, useRef, useState } from 'react';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import { prefersReducedMotion } from '../../utils/motion';
import GradSectionHeader from './GradSectionHeader';
import ReelViewer from './ReelViewer';
import { PlayIcon } from './icons';

// Without a poster, asking for the first frame gives the card a thumbnail.
export const reelSrc = (reel, withThumbFragment) =>
  withThumbFragment && !reel.posterUrl ? `${reel.videoUrl}#t=0.1` : reel.videoUrl;

const canAutoPreview = () => {
  if (prefersReducedMotion()) return false;
  const conn = typeof navigator !== 'undefined' ? navigator.connection : null;
  return !(conn?.saveData || /2g/.test(conn?.effectiveType || ''));
};

function ReelCard({ reel, onOpen, autoPreview }) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Preview muted while the card is on screen, like a reels feed.
  useEffect(() => {
    if (!autoPreview || !cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.6 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [autoPreview]);

  const playing = (autoPreview && inView) || hovered;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    if (playing) el.play().catch(() => {});
    else el.pause();
  }, [playing]);

  return (
    <button
      ref={cardRef}
      type="button"
      className={`grad-reel${playing ? ' is-playing' : ''}`}
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={`Play reel: ${reel.title || 'Graduation reel'}`}
    >
      {reel.posterUrl && <img className="grad-reel__poster" src={reel.posterUrl} alt="" loading="lazy" decoding="async" />}
      <video
        ref={videoRef}
        className="grad-reel__video"
        src={reelSrc(reel, true)}
        muted
        loop
        playsInline
        preload={reel.posterUrl ? 'none' : 'metadata'}
        aria-hidden="true"
        tabIndex={-1}
      />
      <span className="grad-reel__shade" aria-hidden="true" />
      <span className="grad-reel__play" aria-hidden="true"><PlayIcon width={22} height={22} /></span>
      <span className="grad-reel__info">
        {reel.title && <span className="grad-reel__title">{reel.title}</span>}
        {reel.description && <span className="grad-reel__desc">{reel.description}</span>}
      </span>
    </button>
  );
}

export default function GraduationReels({ reels }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [autoPreview] = useState(canAutoPreview);
  const ref = useScrollAnimation([reels]);

  const items = (reels?.items || []).filter((r) => r?.videoUrl && r.visible !== false);
  if (!items.length) return null;

  return (
    <section className="grad-section grad-reels" id="graduation-reels" ref={ref}>
      <div className="grad-container">
        <GradSectionHeader label={reels.label} heading={reels.heading} description={reels.description} dark />
        <div className="grad-reels__grid" data-animate="stagger-children" data-stagger="0.1">
          {items.map((reel, i) => (
            <ReelCard key={reel.id || i} reel={reel} autoPreview={autoPreview} onOpen={() => setOpenIndex(i)} />
          ))}
        </div>
      </div>

      <ReelViewer reels={items} index={openIndex} onChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
    </section>
  );
}
