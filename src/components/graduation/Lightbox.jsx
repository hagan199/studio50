import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useModal, { useSwipe } from '../../hooks/useModal';
import { ArrowIcon, CloseIcon } from './icons';
import './Lightbox.css';

/**
 * Full-screen photo viewer. `items` are { url, title, caption }.
 * Controlled: the parent owns `index` (null = closed).
 */
export default function Lightbox({ items, index, onChange, onClose }) {
  const open = index != null && items[index] != null;
  const count = items.length;
  const [loaded, setLoaded] = useState(false);

  const prev = () => onChange((index - 1 + count) % count);
  const next = () => onChange((index + 1) % count);

  const dialogRef = useModal(open, {
    Escape: onClose,
    ArrowLeft: () => count > 1 && prev(),
    ArrowRight: () => count > 1 && next(),
  });
  const swipe = useSwipe({ onLeft: next, onRight: prev, onDown: onClose });

  useEffect(() => setLoaded(false), [index]);

  // Warm the neighbours so stepping through feels instant.
  useEffect(() => {
    if (!open || count < 2) return;
    [items[(index + 1) % count], items[(index - 1 + count) % count]].forEach((item) => {
      if (item?.url) { const img = new Image(); img.src = item.url; }
    });
  }, [open, index, count, items]);

  if (!open) return null;
  const item = items[index];
  const label = item.title || `Photo ${index + 1} of ${count}`;

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      ref={dialogRef}
      tabIndex={-1}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      {...swipe}
    >
      <div className="lightbox__top">
        <span className="lightbox__counter" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
        <button type="button" className="lightbox__btn" onClick={onClose} aria-label="Close" data-autofocus>
          <CloseIcon />
        </button>
      </div>

      <figure className="lightbox__stage" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <img
          key={item.url}
          src={item.url}
          alt={item.title || item.caption || label}
          className={`lightbox__img${loaded ? ' is-loaded' : ''}`}
          onLoad={() => setLoaded(true)}
          decoding="async"
        />
        {!loaded && <span className="lightbox__spinner" aria-hidden="true" />}
        {(item.title || item.caption) && (
          <figcaption className="lightbox__caption">
            {item.title && <strong>{item.title}</strong>}
            {item.caption && <span>{item.caption}</span>}
          </figcaption>
        )}
      </figure>

      {count > 1 && (
        <>
          <button type="button" className="lightbox__btn lightbox__nav lightbox__nav--prev" onClick={prev} aria-label="Previous photo">
            <ArrowIcon direction="left" />
          </button>
          <button type="button" className="lightbox__btn lightbox__nav lightbox__nav--next" onClick={next} aria-label="Next photo">
            <ArrowIcon direction="right" />
          </button>
        </>
      )}
    </div>,
    document.body
  );
}
