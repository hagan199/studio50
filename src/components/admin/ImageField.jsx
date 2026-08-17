import { useState, useRef } from 'react';
import {
  IMAGE_ACCEPT,
  formatBytes,
  uploadErrorMessage,
  uploadImage,
  validateImageFile,
} from '../../utils/imageUpload';

// Single image: value = string, onChange(string)
// Multiple images: multiple=true, value = [string], onChange([string])
export default function ImageField({ label, value, onChange, category = 'general', multiple = false }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total, percent, name }
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;

    const rejected = [];
    const accepted = [];
    for (const file of files) {
      const validationError = validateImageFile(file);
      if (validationError) rejected.push(`${file.name}: ${validationError}`);
      else accepted.push(file);
    }

    const queue = multiple ? accepted : accepted.slice(0, 1);
    if (!queue.length) {
      setError(rejected[0] || 'No valid image selected');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setError('');
    setUploading(true);

    const uploaded = [];
    try {
      for (let i = 0; i < queue.length; i += 1) {
        const file = queue[i];
        setProgress({ done: i, total: queue.length, percent: 0, name: file.name });
        const url = await uploadImage(file, category, (percent) => {
          setProgress({ done: i, total: queue.length, percent, name: file.name });
        });
        uploaded.push(url);
      }

      if (multiple) onChange([...(value || []), ...uploaded]);
      else onChange(uploaded[0]);

      if (rejected.length) {
        setError(`Skipped ${rejected.length} file(s) — ${rejected[0]}`);
      }
    } catch (err) {
      setError(uploadErrorMessage(err));
      // Keep whatever already made it to the server rather than losing it.
      if (uploaded.length) {
        if (multiple) onChange([...(value || []), ...uploaded]);
        else onChange(uploaded[0]);
      }
    } finally {
      setUploading(false);
      setProgress(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onFileChange = (e) => {
    handleUpload(Array.from(e.target.files));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(Array.from(e.dataTransfer.files));
  };

  const removeImage = (index) => {
    setError('');
    if (multiple) onChange(value.filter((_, i) => i !== index));
    else onChange('');
  };

  const moveImage = (index, direction) => {
    const next = [...(value || [])];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const images = multiple ? (value || []) : (value ? [value] : []);
  const progressLabel = progress
    ? progress.total > 1
      ? `Uploading ${progress.done + 1} of ${progress.total} — ${progress.percent}%`
      : `Uploading ${progress.percent}%`
    : 'Uploading...';

  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>

      {/* Show existing images */}
      {images.length > 0 && (
        <div className={`admin-image-field__gallery${multiple ? ' admin-image-field__gallery--multi' : ''}`}>
          {images.map((url, i) => (
            <div key={`${url}-${i}`} className="admin-image-field__thumb">
              <img src={url} alt={`${label} ${i + 1}`} loading="lazy" />
              <div className="admin-image-field__thumb-actions">
                {multiple && (
                  <>
                    <button
                      type="button"
                      className="admin-btn admin-btn--sm"
                      onClick={() => moveImage(i, -1)}
                      disabled={uploading || i === 0}
                      aria-label={`Move ${label} ${i + 1} earlier`}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--sm"
                      onClick={() => moveImage(i, 1)}
                      disabled={uploading || i === images.length - 1}
                      aria-label={`Move ${label} ${i + 1} later`}
                    >
                      →
                    </button>
                  </>
                )}
                {!multiple && (
                  <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    Replace
                  </button>
                )}
                <button
                  type="button"
                  className="admin-btn admin-btn--sm admin-btn--danger"
                  onClick={() => removeImage(i)}
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
              <div className="admin-image-field__thumb-url">{url}</div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone: always show for multiple, or when no image for single */}
      {(multiple || images.length === 0) && (
        <div
          className={`admin-image-field${dragOver ? ' admin-image-field--dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          style={{ cursor: uploading ? 'progress' : 'pointer' }}
        >
          <div className="admin-image-field__empty">
            <div className="admin-image-field__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <span>
              {uploading
                ? progressLabel
                : multiple
                  ? 'Click or drag images here (multiple allowed)'
                  : 'Click or drag image here'}
            </span>
            {!uploading && (
              <span className="admin-image-field__hint">
                JPG, PNG, GIF, WEBP, AVIF or SVG — up to {formatBytes(10 * 1024 * 1024)}. Large photos are resized automatically.
              </span>
            )}
          </div>
        </div>
      )}

      {uploading && (
        <div className="admin-upload-progress" role="progressbar" aria-valuenow={progress?.percent ?? 0} aria-valuemin={0} aria-valuemax={100}>
          <div className="admin-upload-progress__bar" style={{ width: `${progress?.percent ?? 0}%` }} />
        </div>
      )}

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <input
        ref={fileRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={onFileChange}
        disabled={uploading}
      />
    </div>
  );
}
