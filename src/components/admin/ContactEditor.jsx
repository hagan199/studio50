import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import useAdminSave from '../../hooks/useAdminSave';
import AdminToast from './AdminToast';
import AdminSaveBar from './AdminSaveBar';

const PLATFORM_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'tiktok', label: 'TikTok' },
];

const SOCIAL_ICONS = {
  linkedin: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  facebook: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  instagram: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
  youtube: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  twitter: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  tiktok: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
};

export default function ContactEditor() {
  const [contact, setContact] = useState(null);
  const [dirty, setDirty] = useState(false);
  const initialLoad = useRef(true);

  useEffect(() => {
    api.get('/api/contact').then((res) => setContact(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialLoad.current) { initialLoad.current = false; return; }
    setDirty(true);
  }, [contact]);

  const update = (field, value) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  const updateSocial = (index, field, value) => {
    setContact((prev) => {
      const links = [...prev.socialLinks];
      links[index] = { ...links[index], [field]: value };
      if (field === 'platform') links[index].icon = value;
      return { ...prev, socialLinks: links };
    });
  };

  const addSocial = () => {
    setContact((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: 'linkedin', url: '', icon: 'linkedin' }],
    }));
  };

  const removeSocial = (index) => {
    setContact((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const { saving, toast, save } = useAdminSave(async () => {
    await api.put('/api/contact', contact);
    setDirty(false);
  });

  if (!contact) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__bar" />
        <div className="admin-loading__bar" />
        <div className="admin-loading__bar" />
        <div className="admin-loading__bar" />
      </div>
    );
  }

  return (
    <div className="admin-editor">
      <AdminToast toast={toast} />

      <div className="admin-editor__header">
        <h2>Contact Editor</h2>
      </div>

      {/* Info note */}
      <div className="admin-alert admin-alert--info" style={{
        background: 'rgba(212, 168, 67, 0.08)',
        border: '1px solid rgba(212, 168, 67, 0.2)',
        color: '#d4a843',
        padding: '12px 16px',
        borderRadius: 12,
        fontSize: '0.85rem',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        These details appear in the Contact section and Footer across the site.
      </div>

      {/* Contact Details */}
      <div className="admin-card">
        <h3 className="admin-card__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Contact Details
        </h3>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">Phone Number</label>
            <input className="admin-field__input" value={contact.phone} onChange={(e) => update('phone', e.target.value)} placeholder="e.g. 050 134 5492" />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">WhatsApp Link</label>
            <input className="admin-field__input" value={contact.whatsappLink} onChange={(e) => update('whatsappLink', e.target.value)} placeholder="e.g. https://wa.me/233501345492" />
            <span className="admin-field__hint">Full WhatsApp URL with country code</span>
          </div>
        </div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">Email</label>
            <input className="admin-field__input" type="email" value={contact.email} onChange={(e) => update('email', e.target.value)} placeholder="e.g. info@studio50global.com" />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Website</label>
            <input className="admin-field__input" value={contact.website} onChange={(e) => update('website', e.target.value)} placeholder="e.g. www.studio50global.com" />
            <span className="admin-field__hint">Without https:// prefix</span>
          </div>
        </div>
        <div className="admin-field">
          <label className="admin-field__label">Address</label>
          <input className="admin-field__input" value={contact.address} onChange={(e) => update('address', e.target.value)} placeholder="e.g. Accra, Ghana" />
        </div>
      </div>

      {/* Social Links */}
      <div className="admin-card">
        <div className="admin-card__header">
          <h3 className="admin-card__title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Social Links
          </h3>
          <button className="admin-btn admin-btn--secondary" onClick={addSocial}>+ Add Link</button>
        </div>

        {contact.socialLinks.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-state__icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </div>
            <p className="admin-empty-state__text">No social links yet. Click "+ Add Link" to get started.</p>
          </div>
        ) : (
          contact.socialLinks.map((link, i) => (
            <div key={i} className="contact-social-row">
              <div className="contact-social-row__icon">
                {SOCIAL_ICONS[link.platform] || null}
              </div>
              <select className="admin-field__input" value={link.platform} onChange={(e) => updateSocial(i, 'platform', e.target.value)} style={{ width: 140, flexShrink: 0 }}>
                {PLATFORM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input className="admin-field__input" placeholder="https://..." value={link.url} onChange={(e) => updateSocial(i, 'url', e.target.value)} style={{ flex: 1 }} />
              <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => removeSocial(i)}>✕</button>
            </div>
          ))
        )}
      </div>

      {/* Live preview */}
      <div className="admin-card">
        <h3 className="admin-card__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Preview
        </h3>
        <div className="contact-preview">
          <div className="contact-preview__row">
            {contact.phone && (
              <div className="contact-preview__item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.email && (
              <div className="contact-preview__item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>{contact.email}</span>
              </div>
            )}
          </div>
          <div className="contact-preview__socials">
            {contact.socialLinks.map((link) => (
              <div key={link.platform} className="contact-preview__social">
                {SOCIAL_ICONS[link.platform]}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdminSaveBar saving={saving} onSave={save} dirty={dirty} />
    </div>
  );
}
