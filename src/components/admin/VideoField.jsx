import { useRef, useState } from 'react';
import { formatBytes, uploadErrorMessage } from '../../utils/imageUpload';
import { MAX_VIDEO_BYTES, VIDEO_ACCEPT, uploadVideo, validateVideoFile } from '../../utils/videoUpload';

/**
 * Single video upload with preview, the video counterpart of ImageField.
 * value = URL string, onChange(url)
 */
export default function VideoField({ label, value, onChange, category = 'videos', hint }) {
  const [uploading, setUploading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const invalid = validateVideoFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError('');
    setUploading(true);
    setPercent(0);
    try {
      const url = await uploadVideo(file, category, setPercent);
      onChange(url);
    } catch (err) {
      setError(uploadErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="admin-field">
      {label && <label className="admin-field__label">{label}</label>}

      {value ? (
        <div className="admin-video-field__preview">
          <video src={value} controls muted playsInline preload="metadata" />
          <div className="admin-image-field__thumb-actions">
            <button type="button" className="admin-btn admin-btn--sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? `Uploading ${percent}%` : 'Replace'}
            </button>
            <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => onChange('')} disabled={uploading}>
              Remove
            </button>
          </div>
          <div className="admin-image-field__thumb-url">{value}</div>
        </div>
      ) : (
        <div
          className={`admin-image-field${dragOver ? ' admin-image-field--dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => !uploading && fileRef.current?.click()}
          style={{ cursor: uploading ? 'progress' : 'pointer' }}
        >
          <div className="admin-image-field__empty">
            <div className="admin-image-field__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            </div>
            <span>{uploading ? `Uploading ${percent}%` : 'Click or drag a video here'}</span>
            {!uploading && (
              <span className="admin-image-field__hint">
                {hint || `MP4 (H.264) recommended. WEBM or MOV also accepted, up to ${formatBytes(MAX_VIDEO_BYTES)}.`}
              </span>
            )}
          </div>
        </div>
      )}

      {uploading && (
        <div className="admin-upload-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="admin-upload-progress__bar" style={{ width: `${percent}%` }} />
        </div>
      )}
      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <input ref={fileRef} type="file" accept={VIDEO_ACCEPT} style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} disabled={uploading} />
    </div>
  );
}
