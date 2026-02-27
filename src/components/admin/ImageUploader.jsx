import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

export default function ImageUploader() {
  const [category, setCategory] = useState('hero');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
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

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);

    try {
      const res = await api.post('/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`Uploaded! URL: ${res.data.url}`);
      loadImages();
      setTimeout(() => setMessage(''), 5000);
    } catch {
      setMessage('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const setAsImage = async (url, target) => {
    if (!content) return;
    const updated = { ...content };
    if (target === 'hero') updated.hero.backgroundImageUrl = url;
    else if (target === 'about') updated.about.imageUrl = url;
    else if (target === 'logo') updated.brand.logoUrl = url;

    try {
      await api.put('/api/content', updated);
      setContent(updated);
      setMessage(`Set as ${target} image!`);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to update');
    }
  };

  const deleteImage = async (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const cat = parts[parts.length - 2];

    try {
      await api.delete(`/api/images/${cat}/${filename}`);
      loadImages();
      setMessage('Image deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to delete');
    }
  };

  return (
    <div className="admin-editor">
      <div className="admin-editor__header">
        <h2>Image Manager</h2>
      </div>

      {message && <div className="admin-alert admin-alert--success">{message}</div>}

      <div className="admin-card">
        <h3 className="admin-card__title">Upload Image</h3>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">Category</label>
            <select className="admin-field__input" value={category} onChange={(e) => setCategory(e.target.value)}>
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
              accept="image/*"
              className="admin-field__input"
              onChange={upload}
              disabled={uploading}
            />
          </div>
        </div>
        {uploading && <p style={{ color: 'var(--color-accent)' }}>Uploading...</p>}
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
                  <button className="admin-btn admin-btn--sm" onClick={() => setAsImage(url, 'hero')}>Set as Hero</button>
                  <button className="admin-btn admin-btn--sm" onClick={() => setAsImage(url, 'about')}>Set as About</button>
                  <button className="admin-btn admin-btn--sm" onClick={() => setAsImage(url, 'logo')}>Set as Logo</button>
                  <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => deleteImage(url)}>Delete</button>
                </div>
                <div className="admin-image-card__url">{url}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
