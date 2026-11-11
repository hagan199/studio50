import { useRef, useState } from 'react';
import {
  IMAGE_ACCEPT,
  formatBytes,
  MAX_IMAGE_BYTES,
  uploadErrorMessage,
  uploadImage,
  validateImageFile,
} from '../../utils/imageUpload';
import { newId } from '../../utils/media';

/**
 * Multi-image gallery editor built on the existing image upload endpoint.
 * value = [{ id, url, caption }], onChange(nextList).
 * Upload several at once, reorder, replace or remove single images and add
 * optional captions. The first image is used as the cover.
 */
export default function GalleryField({ label = 'Images', value, onChange, category = 'general', withCaptions = true }) {
  const images = Array.isArray(value) ? value : [];
  const [busy, setBusy] = useState(null); // { label, percent }
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const addRef = useRef(null);
  const replaceRef = useRef(null);
  const replaceIndex = useRef(null);
  // Uploads finish asynchronously; read the latest list, not the one captured when they started.
  const latest = useRef(images);
  latest.current = images;

  const uploadMany = async (files) => {
    const accepted = [];
    const rejected = [];
    for (const file of files) {
      const invalid = validateImageFile(file);
      if (invalid) rejected.push(`${file.name}: ${invalid}`);
      else accepted.push(file);
    }
    if (!accepted.length) {
      setError(rejected[0] || 'No valid image selected');
      return;
    }
    setError('');
    const added = [];
    try {
      for (let i = 0; i < accepted.length; i += 1) {
        const file = accepted[i];
        const prefix = accepted.length > 1 ? `Uploading ${i + 1} of ${accepted.length}` : 'Uploading';
        setBusy({ label: prefix, percent: 0 });
        const url = await uploadImage(file, category, (percent) => setBusy({ label: prefix, percent }));
        added.push({ id: newId('img'), url, caption: '' });
      }
      if (rejected.length) setError(`Skipped ${rejected.length} file(s) — ${rejected[0]}`);
    } catch (err) {
      setError(uploadErrorMessage(err));
    } finally {
      // Keep whatever already reached the server.
      if (added.length) onChange([...latest.current, ...added]);
      setBusy(null);
    }
  };

  const replaceOne = async (file) => {
    const index = replaceIndex.current;
    if (file == null || index == null) return;
    const invalid = validateImageFile(file);
    if (invalid) { setError(invalid); return; }
    setError('');
    setBusy({ label: `Replacing image ${index + 1}`, percent: 0 });
    try {
      const url = await uploadImage(file, category, (percent) => setBusy({ label: `Replacing image ${index + 1}`, percent }));
      onChange(latest.current.map((img, i) => (i === index ? { ...img, url } : img)));
    } catch (err) {
      setError(uploadErrorMessage(err));
    } finally {
      setBusy(null);
      replaceIndex.current = null;
    }
  };

  const move = (index, dir) => {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const makeCover = (index) => {
    if (index === 0) return;
    const next = [...images];
    const [img] = next.splice(index, 1);
    onChange([img, ...next]);
  };

  const patch = (index, changes) => onChange(images.map((img, i) => (i === index ? { ...img, ...changes } : img)));
  const remove = (index) => onChange(images.filter((_, i) => i !== index));

  return (
    <div className="admin-field">
      <label className="admin-field__label">
        {label}
        {images.length > 0 && <span className="admin-gallery-field__count">{images.length} image{images.length === 1 ? '' : 's'}</span>}
      </label>

      {images.length > 0 && (
        <div className="admin-gallery-field__grid">
          {images.map((img, i) => (
            <div key={img.id || `${img.url}-${i}`} className="admin-gallery-field__item">
              <div className="admin-gallery-field__thumb">
                <img src={img.url} alt="" loading="lazy" />
                <span className="admin-gallery-field__index">{i === 0 ? 'Cover' : i + 1}</span>
              </div>
              {withCaptions && (
                <input
                  className="admin-field__input"
                  placeholder="Caption (optional)"
                  value={img.caption ?? ''}
                  onChange={(e) => patch(i, { caption: e.target.value })}
                />
              )}
              <div className="admin-gallery-field__actions">
                <button type="button" className="admin-btn admin-btn--sm" onClick={() => move(i, -1)} disabled={!!busy || i === 0} aria-label={`Move image ${i + 1} earlier`}>←</button>
                <button type="button" className="admin-btn admin-btn--sm" onClick={() => move(i, 1)} disabled={!!busy || i === images.length - 1} aria-label={`Move image ${i + 1} later`}>→</button>
                {i > 0 && (
                  <button type="button" className="admin-btn admin-btn--sm" onClick={() => makeCover(i)} disabled={!!busy}>Cover</button>
                )}
                <button
                  type="button"
                  className="admin-btn admin-btn--sm"
                  disabled={!!busy}
                  onClick={() => { replaceIndex.current = i; replaceRef.current?.click(); }}
                >
                  Replace
                </button>
                <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => remove(i)} disabled={!!busy} aria-label={`Remove image ${i + 1}`}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className={`admin-image-field${dragOver ? ' admin-image-field--dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (!busy) uploadMany(Array.from(e.dataTransfer.files)); }}
        onClick={() => !busy && addRef.current?.click()}
        style={{ cursor: busy ? 'progress' : 'pointer' }}
      >
        <div className="admin-image-field__empty">
          <div className="admin-image-field__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <span>{busy ? `${busy.label} — ${busy.percent}%` : 'Click or drag images here — select several at once'}</span>
          {!busy && (
            <span className="admin-image-field__hint">
              JPG, PNG, GIF, WEBP, AVIF or SVG — up to {formatBytes(MAX_IMAGE_BYTES)} each. Large photos are resized automatically.
            </span>
          )}
        </div>
      </div>

      {busy && (
        <div className="admin-upload-progress" role="progressbar" aria-valuenow={busy.percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="admin-upload-progress__bar" style={{ width: `${busy.percent}%` }} />
        </div>
      )}
      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <input
        ref={addRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        style={{ display: 'none' }}
        onChange={(e) => { uploadMany(Array.from(e.target.files)); e.target.value = ''; }}
      />
      <input
        ref={replaceRef}
        type="file"
        accept={IMAGE_ACCEPT}
        style={{ display: 'none' }}
        onChange={(e) => { replaceOne(e.target.files[0]); e.target.value = ''; }}
      />
    </div>
  );
}
