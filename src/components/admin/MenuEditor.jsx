import { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';

export default function MenuEditor() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/api/menu').then((res) => setData(res.data)).catch(() => {});
  }, []);

  const items = useMemo(() => {
    if (!data?.items) return [];
    return [...data.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [data]);

  const setItems = (updater) => {
    setData((prev) => {
      const nextItems = updater(prev?.items || []);
      return { ...(prev || {}), items: nextItems };
    });
  };

  const updateItem = (index, field, value) => {
    setItems((prevItems) => {
      const next = [...prevItems];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addItem = () => {
    setItems((prevItems) => {
      const next = [...prevItems];
      next.push({
        id: `menu-${Date.now()}`,
        label: 'New Link',
        href: '#',
        order: next.length + 1,
      });
      return next;
    });
  };

  const removeItem = (index) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const moveItem = (index, dir) => {
    setItems((prevItems) => {
      const next = [...prevItems];
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= next.length) return prevItems;
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next.map((item, i) => ({ ...item, order: i + 1 }));
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const normalized = {
        ...(data || {}),
        items: items.map((item, i) => ({
          id: item.id || `menu-${i + 1}`,
          label: item.label ?? '',
          href: item.href ?? '',
          order: i + 1,
        })),
      };

      await api.put('/api/menu', normalized);
      setData(normalized);
      setMessage('Menu saved!');
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
        <h2>Menu</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="admin-btn admin-btn--secondary" onClick={addItem}>+ Add Link</button>
          <button className="admin-btn admin-btn--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Menu'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`admin-alert ${message.includes('Failed') ? 'admin-alert--error' : 'admin-alert--success'}`}>
          {message}
        </div>
      )}

      <div className="admin-card">
        <h3 className="admin-card__title">Navigation Links</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Edit labels and anchors/URLs (e.g. <code>#about</code>, <code>/about</code>, <code>https://...</code>).
        </p>

        {items.map((item, i) => (
          <div key={item.id || i} className="admin-social-row">
            <input
              className="admin-field__input"
              placeholder="Label"
              value={item.label || ''}
              onChange={(e) => updateItem(i, 'label', e.target.value)}
            />
            <input
              className="admin-field__input"
              placeholder="Href (e.g. #about)"
              value={item.href || ''}
              onChange={(e) => updateItem(i, 'href', e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="admin-btn admin-btn--sm" onClick={() => moveItem(i, -1)} title="Move up">↑</button>
              <button className="admin-btn admin-btn--sm" onClick={() => moveItem(i, 1)} title="Move down">↓</button>
              <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => removeItem(i)} title="Remove">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
