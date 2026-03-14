import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import useAdminSave from '../../hooks/useAdminSave';
import AdminToast from './AdminToast';
import AdminSaveBar from './AdminSaveBar';

const ICON_OPTIONS = ['camera', 'palette', 'video', 'share', 'globe', 'broadcast'];

export default function ServicesEditor() {
  const [data, setData] = useState(null);
  const [dirty, setDirty] = useState(false);
  const initialLoad = useRef(true);

  useEffect(() => {
    api.get('/api/services').then((res) => setData(res.data)).catch(() => {});
  }, []);

  // Dirty tracking — skip the very first render / initial data load
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

      <div className="admin-grid-2">
        <div className="admin-field">
          <label className="admin-field__label">Eyebrow Label <span style={{ opacity: 0.5, fontWeight: 400 }}>(small text above title)</span></label>
          <input
            className="admin-field__input"
            value={data.sectionLabel ?? 'What We Do'}
            onChange={(e) => setData((prev) => ({ ...prev, sectionLabel: e.target.value }))}
            placeholder="e.g. What We Do"
          />
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

      {data.items.map((service, i) => (
        <div key={service.id} className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">#{service.order} {service.title}</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="admin-btn admin-btn--sm" onClick={() => moveService(i, -1)} title="Move up" disabled={i === 0}>↑</button>
              <button className="admin-btn admin-btn--sm" onClick={() => moveService(i, 1)} title="Move down" disabled={i === data.items.length - 1}>↓</button>
              <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => removeService(i)} title="Remove">✕</button>
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="admin-field">
              <label className="admin-field__label">
                Title
                {service.title && (
                  <span style={{ opacity: 0.45, fontWeight: 400, marginLeft: 8 }}>
                    → link: <code style={{ background: 'rgba(0,0,0,0.08)', borderRadius: 4, padding: '1px 5px' }}>
                      #{service.title.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}
                    </code>
                  </span>
                )}
              </label>
              <input className="admin-field__input" value={service.title} onChange={(e) => updateItem(i, 'title', e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Icon</label>
              <select className="admin-field__input" value={service.icon} onChange={(e) => updateItem(i, 'icon', e.target.value)}>
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-field__label">Description</label>
            <textarea className="admin-field__textarea" rows={2} value={service.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
          </div>
        </div>
      ))}

      <AdminSaveBar saving={saving} onSave={save} dirty={dirty} />
    </div>
  );
}
