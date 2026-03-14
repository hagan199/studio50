import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import useAdminSave from '../../hooks/useAdminSave';
import AdminToast from './AdminToast';
import AdminSaveBar from './AdminSaveBar';

const ICON_OPTIONS = ['camera', 'palette', 'video', 'share', 'globe', 'broadcast'];

const ICONS = {
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
  ),
  palette: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
  ),
  video: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
  ),
  share: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  ),
  broadcast: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
  ),
};

function ServiceCardPreview({ service }) {
  return (
    <div className="svc-preview">
      <div className="svc-preview__icon">
        {ICONS[service.icon] || ICONS.camera}
      </div>
      <div className="svc-preview__number">{String(service.order).padStart(2, '0')}</div>
      <h4 className="svc-preview__title">{service.title || 'Untitled'}</h4>
      <p className="svc-preview__desc">{service.description || 'No description'}</p>
    </div>
  );
}

export default function ServicesEditor() {
  const [data, setData] = useState(null);
  const [dirty, setDirty] = useState(false);
  const initialLoad = useRef(true);

  useEffect(() => {
    api.get('/api/services').then((res) => setData(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialLoad.current) { initialLoad.current = false; return; }
    setDirty(true);
  }, [data]);

  const updateItem = (index, field, value) => {
    setData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addService = () => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `svc-${Date.now()}`,
          title: 'New Service',
          description: 'Service description',
          icon: 'camera',
          imageUrl: '',
          order: prev.items.length + 1,
        },
      ],
    }));
  };

  const removeService = (index) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const moveService = (index, dir) => {
    setData((prev) => {
      const items = [...prev.items];
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= items.length) return prev;
      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      return { ...prev, items: items.map((item, i) => ({ ...item, order: i + 1 })) };
    });
  };

  const { saving, toast, save } = useAdminSave(async () => {
    await api.put('/api/services', data);
    setDirty(false);
  });

  if (!data) {
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
        <h2>Services Editor</h2>
        <button className="admin-btn admin-btn--secondary" onClick={addService}>+ Add Service</button>
      </div>

      {/* Section settings */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 className="admin-card__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Section Settings
        </h3>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">Eyebrow Label</label>
            <input
              className="admin-field__input"
              value={data.sectionLabel ?? 'What We Do'}
              onChange={(e) => setData((prev) => ({ ...prev, sectionLabel: e.target.value }))}
              placeholder="e.g. What We Do"
            />
            <span className="admin-field__hint">Small text displayed above the section title</span>
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Section Title</label>
            <input
              className="admin-field__input"
              value={data.sectionTitle}
              onChange={(e) => setData((prev) => ({ ...prev, sectionTitle: e.target.value }))}
              placeholder="e.g. Our Services"
            />
          </div>
        </div>
      </div>

      {/* Live grid preview */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 className="admin-card__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Live Preview
        </h3>
        <div className="svc-preview-grid">
          {data.items.sort((a, b) => a.order - b.order).map((service) => (
            <ServiceCardPreview key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* Service cards */}
      {data.items.map((service, i) => (
        <div key={service.id} className="admin-card svc-editor-card">
          <div className="admin-card__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="svc-editor-icon">
                {ICONS[service.icon] || ICONS.camera}
              </div>
              <div>
                <h3 className="admin-card__title" style={{ marginBottom: 0 }}>
                  {service.title}
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#555' }}>
                  #{service.title.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="admin-btn admin-btn--sm" onClick={() => moveService(i, -1)} title="Move up" disabled={i === 0}>↑</button>
              <button className="admin-btn admin-btn--sm" onClick={() => moveService(i, 1)} title="Move down" disabled={i === data.items.length - 1}>↓</button>
              <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => removeService(i)} title="Remove">✕</button>
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="admin-field">
              <label className="admin-field__label">Title</label>
              <input className="admin-field__input" value={service.title} onChange={(e) => updateItem(i, 'title', e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Icon</label>
              <div className="svc-icon-select">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`svc-icon-option${service.icon === icon ? ' svc-icon-option--active' : ''}`}
                    onClick={() => updateItem(i, 'icon', icon)}
                    title={icon}
                  >
                    {ICONS[icon]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-field__label">Description</label>
            <textarea className="admin-field__textarea" rows={2} value={service.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
          </div>
        </div>
      ))}

      {data.items.length === 0 && (
        <div className="admin-empty-state">
          <div className="admin-empty-state__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <p className="admin-empty-state__text">No services yet. Click "+ Add Service" to get started.</p>
        </div>
      )}

      <AdminSaveBar saving={saving} onSave={save} dirty={dirty} />
    </div>
  );
}
