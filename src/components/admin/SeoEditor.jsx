import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import ImageField from './ImageField';

function LoadingSkeleton() {
  return (
    <div className="admin-loading">
      <div className="admin-loading__bar" />
      <div className="admin-loading__bar" />
      <div className="admin-loading__bar" />
    </div>
  );
}

export default function SeoEditor() {
  const [seo, setSeo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/api/seo').then((res) => setSeo(res.data)).catch(() => {});
  }, []);

  const update = (field, value) => {
    setSeo((prev) => ({ ...prev, [field]: value }));
  };

  const save = useCallback(async () => {
    if (!seo || saving) return;
    setSaving(true);
    try {
      await api.put('/api/seo', seo);
      // Apply meta changes to the live document
      document.title = seo.pageTitle || '';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', seo.metaDescription || '');
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', seo.themeColor || '');
      setMessage('SEO settings saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [seo, saving]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [save]);

  if (!seo) return <LoadingSkeleton />;

  return (
    <div className="admin-editor">
      <div className={`admin-toast ${message ? 'admin-toast--visible' : ''} ${message && message.includes('Failed') ? 'admin-toast--error' : 'admin-toast--success'}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {message && message.includes('Failed')
            ? <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>
            : <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}
        </svg>
        {message}
      </div>

      {/* Search Engine */}
      <div className="admin-card">
        <h3 className="admin-card__title">Search Engine</h3>
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
          These settings control how your site appears in Google and other search engines.
        </p>
        <div className="admin-field">
          <label className="admin-field__label">Page Title</label>
          <input className="admin-field__input" value={seo.pageTitle || ''} onChange={(e) => update('pageTitle', e.target.value)} placeholder="My Website | Tagline" />
          <span className="admin-field__hint">{(seo.pageTitle || '').length}/60 characters recommended</span>
        </div>
        <div className="admin-field">
          <label className="admin-field__label">Meta Description</label>
          <textarea className="admin-field__textarea" rows={3} value={seo.metaDescription || ''} onChange={(e) => update('metaDescription', e.target.value)} placeholder="Brief description of your website..." />
          <span className="admin-field__hint">{(seo.metaDescription || '').length}/160 characters recommended</span>
        </div>
        <div className="admin-field">
          <label className="admin-field__label">Keywords</label>
          <input className="admin-field__input" value={seo.keywords || ''} onChange={(e) => update('keywords', e.target.value)} placeholder="keyword1, keyword2, keyword3" />
        </div>
      </div>

      {/* Social Sharing (Open Graph) */}
      <div className="admin-card" style={{ marginTop: '12px' }}>
        <h3 className="admin-card__title">Social Sharing (Open Graph)</h3>
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
          Controls how your site looks when shared on Facebook, Twitter, WhatsApp, etc.
        </p>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">OG Title</label>
            <input className="admin-field__input" value={seo.ogTitle || ''} onChange={(e) => update('ogTitle', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">OG Description</label>
            <input className="admin-field__input" value={seo.ogDescription || ''} onChange={(e) => update('ogDescription', e.target.value)} />
          </div>
        </div>
        <ImageField label="OG Image (1200x630 recommended)" value={seo.ogImage || ''} onChange={(url) => update('ogImage', url)} category="seo" />
      </div>

      {/* Browser & Icons */}
      <div className="admin-card" style={{ marginTop: '12px' }}>
        <h3 className="admin-card__title">Browser & Icons</h3>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">Favicon URL</label>
            <input className="admin-field__input" value={seo.favicon || ''} onChange={(e) => update('favicon', e.target.value)} placeholder="/images/favicon.png" />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Apple Touch Icon URL</label>
            <input className="admin-field__input" value={seo.appleTouchIcon || ''} onChange={(e) => update('appleTouchIcon', e.target.value)} placeholder="/images/webclip.png" />
          </div>
        </div>
        <div className="admin-field">
          <label className="admin-field__label">Theme Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="color" value={seo.themeColor || '#fb3131'} onChange={(e) => update('themeColor', e.target.value)} style={{ width: '40px', height: '34px', border: 'none', cursor: 'pointer', background: 'transparent' }} />
            <input className="admin-field__input" value={seo.themeColor || ''} onChange={(e) => update('themeColor', e.target.value)} placeholder="#fb3131" style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      {/* Google Preview */}
      <div className="admin-card" style={{ marginTop: '12px' }}>
        <h3 className="admin-card__title">Google Preview</h3>
        <div className="seo-preview">
          <div className="seo-preview__title">{seo.pageTitle || 'Page Title'}</div>
          <div className="seo-preview__url">hypemyregion.com</div>
          <div className="seo-preview__desc">{seo.metaDescription || 'Meta description will appear here...'}</div>
        </div>
      </div>

      {/* Save bar */}
      <div className="admin-save-bar">
        <span className="admin-save-bar__hint">
          Unsaved changes will be lost if you leave
          <span className="admin-save-bar__kbd"><kbd>Ctrl</kbd>+<kbd>S</kbd></span>
        </span>
        <button className="admin-btn admin-btn--primary" onClick={save} disabled={saving}>
          {saving ? (
            <>
              <svg className="admin-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>
              Saving...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
