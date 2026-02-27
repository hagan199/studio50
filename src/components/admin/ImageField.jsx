import { useState, useRef } from 'react';
import api from '../../utils/api';

// Single image: value = string, onChange(string)
// Multiple images: multiple=true, value = [string], onChange([string])
export default function ImageField({ label, value, onChange, category = 'general', multiple = false }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);
    const res = await api.post('/api/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      if (multiple) {
        const urls = [];
        for (const file of files) {
          if (file.type.startsWith('image/')) {
            urls.push(await uploadFile(file));
          }
        }
        onChange([...(value || []), ...urls]);
      } else {
        const url = await uploadFile(files[0]);
        onChange(url);
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onFileChange = (e) => {
    handleUpload(Array.from(e.target.files));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) handleUpload(files);
  };

  const removeImage = (index) => {
    if (multiple) {
      onChange(value.filter((_, i) => i !== index));
    } else {
      onChange('');
    }
  };

  const images = multiple ? (value || []) : (value ? [value] : []);

  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>

      {/* Show existing images */}
      {images.length > 0 && (
        <div className={`admin-image-field__gallery${multiple ? ' admin-image-field__gallery--multi' : ''}`}>
          {images.map((url, i) => (
            <div key={`${url}-${i}`} className="admin-image-field__thumb">
              <img src={url} alt={`${label} ${i + 1}`} />
              <div className="admin-image-field__thumb-actions">
                {!multiple && (
                  <button
                    className="admin-btn admin-btn--sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    Replace
                  </button>
                )}
                <button
                  className="admin-btn admin-btn--sm admin-btn--danger"
                  onClick={() => removeImage(i)}
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
          onClick={() => fileRef.current?.click()}
          style={{ cursor: 'pointer' }}
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
                ? 'Uploading...'
                : multiple
                  ? 'Click or drag images here (multiple allowed)'
                  : 'Click or drag image here'}
            </span>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={onFileChange}
        disabled={uploading}
      />
    </div>
  );
}
