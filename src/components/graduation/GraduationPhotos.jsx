import { useState } from 'react';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import GradSectionHeader from './GradSectionHeader';
import Lightbox from './Lightbox';

export default function GraduationPhotos({ photos }) {
  const [openIndex, setOpenIndex] = useState(null);
  const ref = useScrollAnimation([photos]);

  const items = (photos?.items || []).filter((p) => p?.url && p.visible !== false);
  if (!items.length) return null;

  return (
    <section className="grad-section grad-photos" id="graduation-photos" ref={ref}>
      <div className="grad-container">
        <GradSectionHeader label={photos.label} heading={photos.heading} description={photos.description} />
        <div className="grad-masonry">
          {items.map((photo, i) => (
            <button
              key={photo.id || photo.url}
              type="button"
              className="grad-masonry__item"
              onClick={() => setOpenIndex(i)}
              aria-label={`Open ${photo.title || `photo ${i + 1}`}`}
            >
              <img
                src={photo.url}
                alt={photo.title || photo.caption || ''}
                loading="lazy"
                decoding="async"
                ref={(el) => { if (el?.complete) el.classList.add('is-loaded'); }}
                onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
                onError={(e) => e.currentTarget.classList.add('is-loaded')}
              />
              {photo.title && <span className="grad-masonry__caption">{photo.title}</span>}
            </button>
          ))}
        </div>
      </div>

      <Lightbox items={items} index={openIndex} onChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
    </section>
  );
}
