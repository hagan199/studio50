import { useMemo, useState } from 'react';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import GradSectionHeader from './GradSectionHeader';
import Lightbox from './Lightbox';
import { ExpandIcon } from './icons';

const ALL = '__all__';

export default function GraduationGallery({ gallery }) {
  const [filter, setFilter] = useState(ALL);
  const [openIndex, setOpenIndex] = useState(null);
  const ref = useScrollAnimation([gallery]);

  const items = useMemo(() => (gallery?.items || []).filter((item) => item?.url), [gallery]);

  // Only offer collections that actually have photos in them.
  const collections = useMemo(() => {
    const used = new Set(items.map((item) => item.collectionId));
    return (gallery?.collections || []).filter((c) => used.has(c.id));
  }, [gallery, items]);

  const collectionName = useMemo(
    () => Object.fromEntries((gallery?.collections || []).map((c) => [c.id, c.name])),
    [gallery]
  );

  const visible = filter === ALL ? items : items.filter((item) => item.collectionId === filter);

  if (!items.length) return null;

  return (
    <section className="grad-section grad-gallery" id="graduation-gallery" ref={ref}>
      <div className="grad-container">
        <GradSectionHeader label={gallery.label} heading={gallery.heading} description={gallery.description} />

        {collections.length > 1 && (
          <div className="grad-filters" role="group" aria-label="Filter gallery by collection">
            {[{ id: ALL, name: 'All' }, ...collections].map((c) => (
              <button
                key={c.id}
                type="button"
                className={`grad-filter${filter === c.id ? ' is-active' : ''}`}
                aria-pressed={filter === c.id}
                onClick={() => setFilter(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Re-keyed on filter so the grid fades in fresh each time */}
        <div className="grad-gallery__grid" key={filter}>
          {visible.map((item, i) => (
            <button
              key={item.id || item.url}
              type="button"
              className={`grad-gallery__item${i % 7 === 0 ? ' is-feature' : ''}`}
              onClick={() => setOpenIndex(i)}
              aria-label={`Open ${item.title || 'photo'}`}
              style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
            >
              <img src={item.url} alt={item.title || ''} loading="lazy" decoding="async" />
              <span className="grad-gallery__meta">
                {collectionName[item.collectionId] && (
                  <span className="grad-gallery__tag">{collectionName[item.collectionId]}</span>
                )}
                {item.title && <span className="grad-gallery__title">{item.title}</span>}
              </span>
              <span className="grad-gallery__expand" aria-hidden="true"><ExpandIcon /></span>
            </button>
          ))}
        </div>
      </div>

      <Lightbox items={visible} index={openIndex} onChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
    </section>
  );
}
