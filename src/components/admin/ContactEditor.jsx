import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import useAdminSave from '../../hooks/useAdminSave';
import AdminToast from './AdminToast';
import AdminSaveBar from './AdminSaveBar';

export default function ContactEditor() {
  const [contact, setContact] = useState(null);
  const [dirty, setDirty] = useState(false);
  const initialLoad = useRef(true);

  useEffect(() => {
    api.get('/api/contact').then((res) => setContact(res.data)).catch(() => {});
  }, []);

  // Dirty tracking — skip the very first render / initial data load
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

      <div className="admin-card">
        <h3 className="admin-card__title">Contact Details</h3>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">Phone Number</label>
            <input className="admin-field__input" value={contact.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">WhatsApp Link</label>
            <input className="admin-field__input" value={contact.whatsappLink} onChange={(e) => update('whatsappLink', e.target.value)} />
          </div>
        </div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">Email</label>
            <input className="admin-field__input" type="email" value={contact.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Website</label>
            <input className="admin-field__input" value={contact.website} onChange={(e) => update('website', e.target.value)} />
          </div>
        </div>
        <div className="admin-field">
          <label className="admin-field__label">Address</label>
          <input className="admin-field__input" value={contact.address} onChange={(e) => update('address', e.target.value)} />
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__header">
          <h3 className="admin-card__title">Social Links</h3>
          <button className="admin-btn admin-btn--secondary" onClick={addSocial}>+ Add Link</button>
        </div>

        {contact.socialLinks.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-state__text">No social links added yet.</div>
          </div>
        ) : (
          contact.socialLinks.map((link, i) => (
            <div key={i} className="admin-social-row">
              <select className="admin-field__input" value={link.platform} onChange={(e) => {
                updateSocial(i, 'platform', e.target.value);
                updateSocial(i, 'icon', e.target.value);
              }}>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter/X</option>
                <option value="tiktok">TikTok</option>
              </select>
              <input className="admin-field__input" placeholder="URL" value={link.url} onChange={(e) => updateSocial(i, 'url', e.target.value)} />
              <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => removeSocial(i)}>✕</button>
            </div>
          ))
        )}
      </div>

      <AdminSaveBar saving={saving} onSave={save} dirty={dirty} />
    </div>
  );
}
