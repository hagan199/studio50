import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useModal, { useSwipe } from '../../hooks/useModal';
import { ArrowIcon, CloseIcon, PauseIcon, PlayIcon, SoundOffIcon, SoundOnIcon } from './icons';
import './ReelViewer.css';

const fmt = (s) => {
  if (!Number.isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

/** Full-screen 9:16 player. Controlled: `index` null = closed. */
export default function ReelViewer({ reels, index, onChange, onClose }) {
  const open = index != null && reels[index] != null;
  const count = reels.length;
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  // Opening a reel is a deliberate tap, so start with sound; browsers that
  // still refuse get muted playback instead of none.
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [loading, setLoading] = useState(true);

  const go = (step) => count > 1 && onChange((index + step + count) % count);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const seek = (e) => {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    el.currentTime = (Number(e.target.value) / 1000) * el.duration;
  };

  const dialogRef = useModal(open, {
    Escape: onClose,
    ' ': togglePlay,
    k: togglePlay,
    m: toggleMute,
    ArrowRight: () => go(1),
    ArrowDown: () => go(1),
    ArrowLeft: () => go(-1),
    ArrowUp: () => go(-1),
  });
  const swipe = useSwipe({ onUp: () => go(1), onDown: () => go(-1), onLeft: () => go(1), onRight: () => go(-1) });

  useEffect(() => {
    const el = videoRef.current;
    if (!open || !el) return;
    setLoading(true);
    setTime({ current: 0, duration: 0 });
    el.muted = muted;
    el.play().catch(() => {
      el.muted = true;
      setMuted(true);
      el.play().catch(() => setPlaying(false));
    });
    // `muted` is read once per reel on purpose: toggling sound must not restart playback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  if (!open) return null;
  const reel = reels[index];
  const progress = time.duration ? (time.current / time.duration) * 1000 : 0;

  return createPortal(
    <div
      className="reel-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={reel.title || 'Graduation reel'}
      ref={dialogRef}
      tabIndex={-1}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {reel.posterUrl && <div className="reel-viewer__backdrop" style={{ backgroundImage: `url("${reel.posterUrl}")` }} aria-hidden="true" />}

      <div className="reel-viewer__frame" {...swipe}>
        <video
          key={reel.videoUrl + index}
          ref={videoRef}
          className="reel-viewer__video"
          src={reel.videoUrl}
          poster={reel.posterUrl || undefined}
          playsInline
          loop
          preload="auto"
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onWaiting={() => setLoading(true)}
          onPlaying={() => setLoading(false)}
          onCanPlay={() => setLoading(false)}
          onTimeUpdate={(e) => setTime({ current: e.target.currentTime, duration: e.target.duration })}
          onLoadedMetadata={(e) => setTime({ current: 0, duration: e.target.duration })}
        />

        {loading && <span className="reel-viewer__spinner" aria-hidden="true" />}
        {!playing && !loading && (
          <button type="button" className="reel-viewer__bigplay" onClick={togglePlay} aria-label="Play">
            <PlayIcon width={30} height={30} />
          </button>
        )}

        <div className="reel-viewer__top">
          {count > 1 && (
            <span className="reel-viewer__count">{index + 1} / {count}</span>
          )}
          <button type="button" className="reel-viewer__btn" onClick={onClose} aria-label="Close reel" data-autofocus>
            <CloseIcon />
          </button>
        </div>

        <div className="reel-viewer__bottom">
          {(reel.title || reel.description) && (
            <div className="reel-viewer__info">
              {reel.title && <h3>{reel.title}</h3>}
              {reel.description && <p>{reel.description}</p>}
            </div>
          )}
          <div className="reel-viewer__controls">
            <button type="button" className="reel-viewer__btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <PauseIcon width={16} height={16} /> : <PlayIcon width={16} height={16} />}
            </button>
            <input
              type="range"
              className="reel-viewer__seek"
              min="0"
              max="1000"
              value={progress}
              onChange={seek}
              aria-label="Seek"
              aria-valuetext={`${fmt(time.current)} of ${fmt(time.duration)}`}
              style={{ '--progress': `${progress / 10}%` }}
            />
            <span className="reel-viewer__time">{fmt(time.current)} / {fmt(time.duration)}</span>
            <button type="button" className="reel-viewer__btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} aria-pressed={!muted}>
              {muted ? <SoundOffIcon width={18} height={18} /> : <SoundOnIcon width={18} height={18} />}
            </button>
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="reel-viewer__nav">
          <button type="button" className="reel-viewer__btn" onClick={() => go(-1)} aria-label="Previous reel">
            <ArrowIcon direction="up" />
          </button>
          <button type="button" className="reel-viewer__btn" onClick={() => go(1)} aria-label="Next reel">
            <ArrowIcon direction="down" />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
