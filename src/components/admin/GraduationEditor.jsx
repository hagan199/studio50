import { useEffect, useRef, useState } from 'react';
import api from '../../utils/api';
import useAdminSave from '../../hooks/useAdminSave';
import AdminToast from './AdminToast';
import AdminSaveBar from './AdminSaveBar';
import ImageField from './ImageField';
import VideoField from './VideoField';
import { Section, LoadingSkeleton } from './AdminSection';

const UPLOAD_CATEGORY = 'graduation';
const newId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

// Lists are edited as one-item-per-line text.
const toLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');
const fromLines = (text) => text.split('\n');
const cleanLines = (arr) => (Array.isArray(arr) ? arr.map((s) => s.trim()).filter(Boolean) : []);

function Field({ label, hint, children }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      {children}
      {hint && <span className="admin-field__hint">{hint}</span>}
    </div>
  );
}

function TextInput({ value, onChange, ...rest }) {
  return <input className="admin-field__input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

function TextArea({ value, onChange, rows = 3, ...rest }) {
  return <textarea className="admin-field__textarea" rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

function ItemControls({ index, total, onMove, onRemove, label }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button type="button" className="admin-btn admin-btn--sm" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${label} up`}>↑</button>
      <button type="button" className="admin-btn admin-btn--sm" onClick={() => onMove(1)} disabled={index === total - 1} aria-label={`Move ${label} down`}>↓</button>
      <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={onRemove} aria-label={`Delete ${label}`}>✕</button>
    </div>
  );
}

/** Common heading/label/description fields every section has. */
function SectionText({ block, onChange }) {
  return (
    <>
      <div className="admin-grid-2">
        <Field label="Eyebrow Label">
          <TextInput value={block.label} onChange={(v) => onChange('label', v)} />
        </Field>
        <Field label="Heading">
          <TextInput value={block.heading} onChange={(v) => onChange('heading', v)} />
        </Field>
      </div>
      <Field label="Description">
        <TextArea rows={2} value={block.description} onChange={(v) => onChange('description', v)} />
      </Field>
    </>
  );
}

/** Thumbnail card for gallery images and latest photos. */
function PhotoCard({ item, index, total, onPatch, onMove, onRemove, children }) {
  const name = item.title || `photo ${index + 1}`;
  return (
    <div className="grad-admin-photo">
      <div className="grad-admin-photo__thumb">
        <img src={item.url} alt="" loading="lazy" />
        <span className="grad-admin-photo__index">{index + 1}</span>
      </div>
      <div className="grad-admin-photo__body">
        <input className="admin-field__input" placeholder="Title" value={item.title ?? ''} onChange={(e) => onPatch({ title: e.target.value })} />
        <input className="admin-field__input" placeholder="Caption (optional)" value={item.caption ?? ''} onChange={(e) => onPatch({ caption: e.target.value })} />
        {children}
        <div className="grad-admin-photo__actions">
          <button type="button" className="admin-btn admin-btn--sm" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${name} earlier`}>←</button>
          <button type="button" className="admin-btn admin-btn--sm" onClick={() => onMove(1)} disabled={index === total - 1} aria-label={`Move ${name} later`}>→</button>
          <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={onRemove}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function GraduationEditor() {
  const [data, setData] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [galleryFilter, setGalleryFilter] = useState('');
  // Skip the dirty flag for the initial load and for post-save refreshes.
  const skipDirty = useRef(true);

  useEffect(() => {
    api.get('/api/graduation')
      .then((res) => setData(res.data))
      .catch(() => setLoadError('Could not load graduation content. Is the server running?'));
  }, []);

  useEffect(() => {
    if (!data) return;
    if (skipDirty.current) { skipDirty.current = false; return; }
    setDirty(true);
  }, [data]);

  const { saving, toast, save } = useAdminSave(async () => {
    // Drop blank list lines and empty media rows before they reach the site.
    const cleaned = {
      ...data,
      hero: { ...data.hero, videos: data.hero.videos.filter((v) => v.url) },
      packages: {
        ...data.packages,
        items: data.packages.items.map((p) => ({ ...p, inclusions: cleanLines(p.inclusions), benefits: cleanLines(p.benefits) })),
      },
    };
    await api.put('/api/graduation', cleaned);
    // Showing the cleaned copy is not an edit, so don't flag it dirty.
    skipDirty.current = true;
    setData(cleaned);
    setDirty(false);
  });

  // ── State helpers ──
  const setField = (block, field, value) =>
    setData((prev) => ({ ...prev, [block]: { ...prev[block], [field]: value } }));

  const listOf = (prev, block, key) => prev[block][key] || [];

  const patchItem = (block, key, index, patch) =>
    setData((prev) => {
      const list = [...listOf(prev, block, key)];
      list[index] = { ...list[index], ...patch };
      return { ...prev, [block]: { ...prev[block], [key]: list } };
    });

  const addItems = (block, key, items) =>
    setData((prev) => ({ ...prev, [block]: { ...prev[block], [key]: [...listOf(prev, block, key), ...items] } }));

  const removeItem = (block, key, index) =>
    setData((prev) => ({ ...prev, [block]: { ...prev[block], [key]: listOf(prev, block, key).filter((_, i) => i !== index) } }));

  const moveItem = (block, key, index, dir) =>
    setData((prev) => {
      const list = [...listOf(prev, block, key)];
      const target = index + dir;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, [block]: { ...prev[block], [key]: list } };
    });

  const moveSection = (id, dir) =>
    setData((prev) => {
      const sorted = [...prev.sections].sort((a, b) => a.order - b.order);
      const i = sorted.findIndex((s) => s.id === id);
      const j = i + dir;
      if (j < 0 || j >= sorted.length) return prev;
      [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
      return { ...prev, sections: sorted.map((s, order) => ({ ...s, order })) };
    });

  const removeCollection = (index) =>
    setData((prev) => {
      const removed = prev.gallery.collections[index];
      return {
        ...prev,
        gallery: {
          ...prev.gallery,
          collections: prev.gallery.collections.filter((_, i) => i !== index),
          // Photos in a deleted collection stay in the gallery, uncategorised.
          items: prev.gallery.items.map((item) => (item.collectionId === removed.id ? { ...item, collectionId: '' } : item)),
        },
      };
    });

  if (loadError) return <div className="admin-alert admin-alert--error">{loadError}</div>;
  if (!data) return <LoadingSkeleton />;

  const { hero, gallery, packages, reels, photos } = data;
  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);
  const collections = gallery.collections || [];

  return (
    <div className="admin-editor">
      <AdminToast toast={toast} />

      <div className="admin-editor__header">
        <h2>Graduation Page</h2>
        <a href="/graduation" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--secondary">View page ↗</a>
      </div>

      {/* ── Page layout ── */}
      <Section title="Page Layout" defaultOpen>
        <p className="grad-admin-note">Show, hide and reorder the sections of the Graduation page.</p>
        {sortedSections.map((section, idx) => (
          <div key={section.id} className="admin-list-row">
            <label className="admin-checkbox" style={{ flex: 1, margin: 0 }}>
              <input
                type="checkbox"
                checked={section.visible}
                onChange={(e) => setData((prev) => ({
                  ...prev,
                  sections: prev.sections.map((s) => (s.id === section.id ? { ...s, visible: e.target.checked } : s)),
                }))}
              />
              {section.label || section.id}
            </label>
            <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" disabled={idx === 0} onClick={() => moveSection(section.id, -1)}>&uarr;</button>
            <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" disabled={idx === sortedSections.length - 1} onClick={() => moveSection(section.id, 1)}>&darr;</button>
          </div>
        ))}
      </Section>

      {/* ── Hero ── */}
      <Section title="Hero Section" count={hero.videos.length}>
        <Field label="Label chip">
          <TextInput value={hero.label} onChange={(v) => setField('hero', 'label', v)} placeholder="e.g. Graduation Season" />
        </Field>
        <Field label="Headline">
          <TextInput value={hero.headline} onChange={(v) => setField('hero', 'headline', v)} />
        </Field>
        <Field label="Description">
          <TextArea value={hero.subheadline} onChange={(v) => setField('hero', 'subheadline', v)} />
        </Field>
        <div className="admin-grid-2">
          <Field label="Primary button text"><TextInput value={hero.ctaText} onChange={(v) => setField('hero', 'ctaText', v)} /></Field>
          <Field label="Primary button link" hint="e.g. #graduation-packages, #contact or a full URL">
            <TextInput value={hero.ctaLink} onChange={(v) => setField('hero', 'ctaLink', v)} />
          </Field>
          <Field label="Secondary button text" hint="Leave empty to hide"><TextInput value={hero.secondaryCtaText} onChange={(v) => setField('hero', 'secondaryCtaText', v)} /></Field>
          <Field label="Secondary button link"><TextInput value={hero.secondaryCtaLink} onChange={(v) => setField('hero', 'secondaryCtaLink', v)} /></Field>
        </div>
        <Field label="Seconds per video" hint="With more than one video, the hero cross-fades to the next clip after this long.">
          <TextInput type="number" min="3" max="60" value={hero.slideSeconds} onChange={(v) => setField('hero', 'slideSeconds', Number(v) || 8)} style={{ maxWidth: 120 }} />
        </Field>

        <h4 className="admin-item-card__heading">Background videos</h4>
        {hero.videos.map((video, i) => (
          <div key={video.id} className="admin-item-card">
            <div className="admin-item-card__header">
              <span className="admin-item-card__title">Video {i + 1}</span>
              <ItemControls index={i} total={hero.videos.length} label={`video ${i + 1}`}
                onMove={(dir) => moveItem('hero', 'videos', i, dir)} onRemove={() => removeItem('hero', 'videos', i)} />
            </div>
            <div className="admin-grid-2">
              <VideoField label="Video file" value={video.url} category={UPLOAD_CATEGORY} onChange={(url) => patchItem('hero', 'videos', i, { url })} />
              <ImageField label="Poster image (shown while loading)" value={video.posterUrl} category={UPLOAD_CATEGORY} onChange={(posterUrl) => patchItem('hero', 'videos', i, { posterUrl })} />
            </div>
          </div>
        ))}
        <button type="button" className="admin-btn admin-btn--secondary" onClick={() => addItems('hero', 'videos', [{ id: newId('hero-vid'), url: '', posterUrl: '' }])}>
          + Add background video
        </button>
      </Section>

      {/* ── Gallery ── */}
      <Section title="Graduation Gallery" count={gallery.items.length}>
        <SectionText block={gallery} onChange={(f, v) => setField('gallery', f, v)} />

        <h4 className="admin-item-card__heading">Collections</h4>
        <p className="grad-admin-note">Visitors can filter the gallery by collection. Deleting a collection keeps its photos.</p>
        {collections.map((c, i) => (
          <div key={c.id} className="admin-list-row">
            <input className="admin-field__input" value={c.name} onChange={(e) => patchItem('gallery', 'collections', i, { name: e.target.value })} />
            <span className="grad-admin-count">{gallery.items.filter((it) => it.collectionId === c.id).length} photos</span>
            <ItemControls index={i} total={collections.length} label={c.name}
              onMove={(dir) => moveItem('gallery', 'collections', i, dir)} onRemove={() => removeCollection(i)} />
          </div>
        ))}
        <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => addItems('gallery', 'collections', [{ id: newId('col'), name: 'New collection' }])}>
          + Add collection
        </button>

        <h4 className="admin-item-card__heading">Photos</h4>
        <ImageField
          label="Upload photos"
          multiple
          value={[]}
          category={UPLOAD_CATEGORY}
          onChange={(urls) => addItems('gallery', 'items', urls.map((url) => ({
            id: newId('gal'), url, title: '', caption: '', collectionId: galleryFilter || collections[0]?.id || '',
          })))}
        />
        {collections.length > 0 && (
          <div className="admin-list-row">
            <span className="grad-admin-note" style={{ margin: 0 }}>Show:</span>
            <select className="admin-field__input" value={galleryFilter} onChange={(e) => setGalleryFilter(e.target.value)} style={{ maxWidth: 260 }}>
              <option value="">All collections</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {galleryFilter && <span className="grad-admin-note" style={{ margin: 0 }}>New uploads go into this collection.</span>}
          </div>
        )}
        <div className="grad-admin-photos">
          {gallery.items.map((item, i) => (galleryFilter && item.collectionId !== galleryFilter ? null : (
            <PhotoCard key={item.id} item={item} index={i} total={gallery.items.length}
              onPatch={(patch) => patchItem('gallery', 'items', i, patch)}
              onMove={(dir) => moveItem('gallery', 'items', i, dir)}
              onRemove={() => removeItem('gallery', 'items', i)}>
              <select className="admin-field__input" value={item.collectionId || ''} onChange={(e) => patchItem('gallery', 'items', i, { collectionId: e.target.value })} aria-label="Collection">
                <option value="">No collection</option>
                {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </PhotoCard>
          )))}
        </div>
        {gallery.items.length === 0 && <div className="admin-empty-state"><div className="admin-empty-state__text">No gallery photos yet. Upload some above.</div></div>}
      </Section>

      {/* ── Packages ── */}
      <Section title="Graduation Packages" count={packages.items.length}>
        <SectionText block={packages} onChange={(f, v) => setField('packages', f, v)} />
        <Field label="Currency symbol" hint="Shown before every price, e.g. GH₵, $, £">
          <TextInput value={packages.currency} onChange={(v) => setField('packages', 'currency', v)} style={{ maxWidth: 120 }} />
        </Field>

        {packages.items.map((pkg, i) => {
          const set = (patch) => patchItem('packages', 'items', i, patch);
          return (
            <div key={pkg.id} className="admin-item-card">
              <div className="admin-item-card__header">
                <span className="admin-item-card__title">{pkg.name || `Package ${i + 1}`}{pkg.featured ? ' · Featured' : ''}</span>
                <ItemControls index={i} total={packages.items.length} label={pkg.name || `package ${i + 1}`}
                  onMove={(dir) => moveItem('packages', 'items', i, dir)} onRemove={() => removeItem('packages', 'items', i)} />
              </div>
              <div className="admin-grid-2">
                <Field label="Package name"><TextInput value={pkg.name} onChange={(v) => set({ name: v })} /></Field>
                <Field label="Badge" hint="Optional, e.g. Most popular"><TextInput value={pkg.badge} onChange={(v) => set({ badge: v })} /></Field>
                <Field label="Price"><TextInput value={pkg.price} onChange={(v) => set({ price: v })} placeholder="1,500" /></Field>
                <Field label="Price note"><TextInput value={pkg.priceNote} onChange={(v) => set({ priceNote: v })} placeholder="per graduate" /></Field>
                <Field label="Edited photos"><TextInput value={pkg.photos} onChange={(v) => set({ photos: v })} placeholder="40" /></Field>
                <Field label="Shoot duration"><TextInput value={pkg.duration} onChange={(v) => set({ duration: v })} placeholder="2 hours" /></Field>
              </div>
              <Field label="Description"><TextArea rows={2} value={pkg.description} onChange={(v) => set({ description: v })} /></Field>
              <div className="admin-grid-2">
                <Field label="Included services" hint="One per line">
                  <TextArea rows={5} value={toLines(pkg.inclusions)} onChange={(v) => set({ inclusions: fromLines(v) })} />
                </Field>
                <Field label="Additional benefits" hint="One per line. Leave empty if none.">
                  <TextArea rows={5} value={toLines(pkg.benefits)} onChange={(v) => set({ benefits: fromLines(v) })} />
                </Field>
                <Field label="Button text"><TextInput value={pkg.ctaText} onChange={(v) => set({ ctaText: v })} placeholder="Book now" /></Field>
                <Field label="Button link" hint="#contact, a WhatsApp link (https://wa.me/…) or a booking form URL">
                  <TextInput value={pkg.ctaLink} onChange={(v) => set({ ctaLink: v })} />
                </Field>
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" checked={!!pkg.featured} onChange={(e) => set({ featured: e.target.checked })} />
                Highlight this package (dark card)
              </label>
            </div>
          );
        })}
        <button type="button" className="admin-btn admin-btn--secondary" onClick={() => addItems('packages', 'items', [{
          id: newId('pkg'), name: 'New package', badge: '', price: '', priceNote: 'per graduate', photos: '', duration: '',
          description: '', inclusions: [], benefits: [], featured: false, ctaText: 'Book now', ctaLink: '#contact',
        }])}>
          + Add package
        </button>
      </Section>

      {/* ── Reels ── */}
      <Section title="Graduation Reels" count={reels.items.length}>
        <SectionText block={reels} onChange={(f, v) => setField('reels', f, v)} />
        <p className="grad-admin-note">Portrait (9:16) videos look best. Untick “Show on page” to hide a reel without deleting it.</p>
        {reels.items.map((reel, i) => {
          const set = (patch) => patchItem('reels', 'items', i, patch);
          return (
            <div key={reel.id} className={`admin-item-card${reel.visible === false ? ' grad-admin-hidden' : ''}`}>
              <div className="admin-item-card__header">
                <span className="admin-item-card__title">{reel.title || `Reel ${i + 1}`}{reel.visible === false ? ' · Hidden' : ''}</span>
                <ItemControls index={i} total={reels.items.length} label={reel.title || `reel ${i + 1}`}
                  onMove={(dir) => moveItem('reels', 'items', i, dir)} onRemove={() => removeItem('reels', 'items', i)} />
              </div>
              <div className="admin-grid-2">
                <VideoField label="Video" value={reel.videoUrl} category={UPLOAD_CATEGORY} onChange={(videoUrl) => set({ videoUrl })} />
                <ImageField label="Cover image (optional)" value={reel.posterUrl} category={UPLOAD_CATEGORY} onChange={(posterUrl) => set({ posterUrl })} />
              </div>
              <Field label="Title"><TextInput value={reel.title} onChange={(v) => set({ title: v })} /></Field>
              <Field label="Description"><TextArea rows={2} value={reel.description} onChange={(v) => set({ description: v })} /></Field>
              <label className="admin-checkbox">
                <input type="checkbox" checked={reel.visible !== false} onChange={(e) => set({ visible: e.target.checked })} />
                Show on page
              </label>
            </div>
          );
        })}
        <button type="button" className="admin-btn admin-btn--secondary" onClick={() => addItems('reels', 'items', [{
          id: newId('reel'), title: '', description: '', videoUrl: '', posterUrl: '', visible: true,
        }])}>
          + Add reel
        </button>
      </Section>

      {/* ── Latest photos ── */}
      <Section title="Latest Graduation Photos" count={photos.items.length}>
        <SectionText block={photos} onChange={(f, v) => setField('photos', f, v)} />
        <ImageField
          label="Upload photos"
          multiple
          value={[]}
          category={UPLOAD_CATEGORY}
          onChange={(urls) => setData((prev) => ({
            ...prev,
            // Newest first: this section is "latest" photos.
            photos: { ...prev.photos, items: [...urls.map((url) => ({ id: newId('photo'), url, title: '', caption: '', visible: true })), ...prev.photos.items] },
          }))}
        />
        <p className="grad-admin-note">New uploads appear first. Use the arrows to change the order.</p>
        <div className="grad-admin-photos">
          {photos.items.map((item, i) => (
            <PhotoCard key={item.id} item={item} index={i} total={photos.items.length}
              onPatch={(patch) => patchItem('photos', 'items', i, patch)}
              onMove={(dir) => moveItem('photos', 'items', i, dir)}
              onRemove={() => removeItem('photos', 'items', i)}>
              <label className="admin-checkbox" style={{ margin: 0 }}>
                <input type="checkbox" checked={item.visible !== false} onChange={(e) => patchItem('photos', 'items', i, { visible: e.target.checked })} />
                Show on page
              </label>
            </PhotoCard>
          ))}
        </div>
        {photos.items.length === 0 && <div className="admin-empty-state"><div className="admin-empty-state__text">No photos yet. Upload some above.</div></div>}
      </Section>

      <AdminSaveBar saving={saving} onSave={save} dirty={dirty} />
    </div>
  );
}
