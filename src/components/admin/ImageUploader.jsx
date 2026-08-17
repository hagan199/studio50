import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import {
  IMAGE_ACCEPT,
  uploadErrorMessage,
  uploadImage,
  validateImageFile,
} from '../../utils/imageUpload';

export default function ImageUploader() {
  const [category, setCategory] = useState('hero');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total, percent }
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState('');
  const [content, setContent] = useState(null);
  const fileRef = useRef(null);

  const categories = [
    { value: 'hero', label: 'Hero / Background' },
    { value: 'services', label: 'Services' },
    { value: 'logo', label: 'Logo' },
    { value: 'about', label: 'About' },
  ];

  useEffect(() => {
    loadImages();
    api.get('/api/content').then((res) => setContent(res.data)).catch(() => {});
  }, [category]);

  const loadImages = async () => {
    try {
      const res = await api.get(`/api/images/${category}`);
      setImages(res.data);
    } catch {
      setImages([]);
    }
  };

  const flash = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 5000);
  };

  // An image still referenced by the site should not be deleted silently.
  const isInUse = (url) => (content ? JSON.stringify(content).includes(url) : false);

  const upload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const rejected = [];
    const accepted = [];
    for (const file of files) {
      const validationError = validateImageFile(file);
      if (validationError) rejected.push(`${file.name}: ${validationError}`);
      else accepted.push(file);
    }

    if (!accepted.length) {
      setError(rejected[0] || 'No valid files selected');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setError('');
    setUploading(true);
    let uploaded = 0;
    try {
      for (let i = 0; i < accepted.length; i += 1) {
        setProgress({ done: i, total: accepted.length, percent: 0 });
        await uploadImage(accepted[i], category, (percent) => {
          setProgress({ done: i, total: accepted.length, percent });
        });
        uploaded += 1;
      }

      flash(rejected.length
        ? `Uploaded ${uploaded} image(s). Skipped ${rejected.length} invalid file(s).`
        : `Uploaded ${uploaded} image(s)!`);
      if (rejected.length) setError(rejected[0]);
    } catch (err) {
      setError(uploadErrorMessage(err));
      if (uploaded) flash(`Uploaded ${uploaded} image(s) before the error.`);
    } finally {
      await loadImages();
      setUploading(false);
      setProgress(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const setAsImage = async (url, target) => {
    if (!content) return;
    const updated = { ...content };
    if (target === 'hero') updated.hero = { ...updated.hero, backgroundImageUrl: url };
    else if (target === 'about') updated.about = { ...updated.about, imageUrl: url };
    else if (target === 'logo') updated.brand = { ...updated.brand, logoUrl: url };

    try {
      await api.put('/api/content', updated);
      setContent(updated);
      flash(`Set as ${target} image!`);
    } catch (err) {
      setError(uploadErrorMessage(err));
    }
  };

  const deleteImage = async (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const cat = parts[parts.length - 2];

    try {
      await api.delete(`/api/images/${cat}/${encodeURIComponent(filename)}`);
      setPendingDelete('');
      loadImages();
      flash('Image deleted');
    } catch (err) {
      setError(uploadErrorMessage(err));
    }
  };

  const progressLabel = progress
    ? progress.total > 1
      ? `Uploading ${progress.done + 1} of ${progress.total} — ${progress.percent}%`
      : `Uploading ${progress.percent}%`
    : 'Uploading...';

  return (
    <div className="admin-editor">
      <div className="admin-editor__header">
        <h2>Image Manager</h2>
      </div>

      {message && <div className="admin-alert admin-alert--success">{message}</div>}
      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-card">
        <h3 className="admin-card__title">Upload Image</h3>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">Category</label>
            <select className="admin-field__input" value={category} onChange={(e) => setCategory(e.target.value)} disabled={uploading}>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Select Image</label>
            <input
              ref={fileRef}
              type="file"
              accept={IMAGE_ACCEPT}
              className="admin-field__input"
              onChange={upload}
              multiple
              disabled={uploading}
            />
            <span className="admin-image-field__hint">
              Up to 10MB each. Large photos are resized to 2400px and re-encoded as WEBP before upload.
            </span>
          </div>
        </div>
        {uploading && (
          <>
            <p style={{ color: 'var(--color-accent)' }}>{progressLabel}</p>
            <div className="admin-upload-progress" role="progressbar" aria-valuenow={progress?.percent ?? 0} aria-valuemin={0} aria-valuemax={100}>
              <div className="admin-upload-progress__bar" style={{ width: `${progress?.percent ?? 0}%` }} />
            </div>
          </>
        )}
      </div>

      <div className="admin-card">
        <h3 className="admin-card__title">Uploaded Images ({category})</h3>
        {images.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No images in this category</p>
        ) : (
          <div className="admin-image-grid">
            {images.map((url) => (
              <div key={url} className="admin-image-card">
                <img src={url} alt="" loading="lazy" />
                <div className="admin-image-card__actions">
                  <button type="button" className="admin-btn admin-btn--sm" onClick={() => setAsImage(url, 'hero')}>Set as Hero</button>
                  <button type="button" className="admin-btn admin-btn--sm" onClick={() => setAsImage(url, 'about')}>Set as About</button>
                  <button type="button" className="admin-btn admin-btn--sm" onClick={() => setAsImage(url, 'logo')}>Set as Logo</button>
                  {pendingDelete === url ? (
                    <>
                      <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => deleteImage(url)}>
                        {isInUse(url) ? 'In use — delete anyway' : 'Confirm delete'}
                      </button>
                      <button type="button" className="admin-btn admin-btn--sm" onClick={() => setPendingDelete('')}>Cancel</button>
                    </>
                  ) : (
                    <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => setPendingDelete(url)}>Delete</button>
                  )}
                </div>
                <div className="admin-image-card__url">
                  {url}
                  {isInUse(url) && <span className="admin-image-card__badge">in use</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
