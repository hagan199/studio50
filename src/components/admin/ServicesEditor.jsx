import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ICON_OPTIONS = ['camera', 'palette', 'video', 'share', 'globe', 'broadcast'];

export default function ServicesEditor() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/api/services').then((res) => setData(res.data)).catch(() => {});
  }, []);

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

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/services', data);
      setMessage('Services saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-editor">
      <div className="admin-editor__header">
        <h2>Services Editor</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="admin-btn admin-btn--secondary" onClick={addService}>+ Add Service</button>
          <button className="admin-btn admin-btn--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {message && <div className="admin-alert admin-alert--success">{message}</div>}

      <div className="admin-field">
        <label className="admin-field__label">Section Title</label>
        <input className="admin-field__input" value={data.sectionTitle} onChange={(e) => setData((prev) => ({ ...prev, sectionTitle: e.target.value }))} />
      </div>

      {data.items.map((service, i) => (
        <div key={service.id} className="admin-card admin-card--service">
          <div className="admin-card__header">
            <h3 className="admin-card__title">#{service.order} {service.title}</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="admin-btn admin-btn--sm" onClick={() => moveService(i, -1)} title="Move up">↑</button>
              <button className="admin-btn admin-btn--sm" onClick={() => moveService(i, 1)} title="Move down">↓</button>
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
    </div>
  );
}
