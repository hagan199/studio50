import { useEffect, useMemo, useState, useRef } from 'react';
import api from '../../utils/api';
import useAdminSave from '../../hooks/useAdminSave';
import AdminToast from './AdminToast';
import AdminSaveBar from './AdminSaveBar';

/* Fixed page sections that always exist */
const STATIC_ANCHORS = [
  { value: '#', label: 'Home (top of page)' },
  { value: '#about', label: 'About Us' },
  { value: '#services', label: 'Services (all)' },
  { value: '#auditions', label: 'Auditions' },
  { value: '#programs', label: 'Programs' },
  { value: '#awards', label: 'Awards & Marquee' },
  { value: '#contact', label: 'Contact' },
];

function toAnchorId(title) {
  return title?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') || '';
}

export default function MenuEditor() {
  const [data, setData] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [anchors, setAnchors] = useState(STATIC_ANCHORS);
  const initialLoad = useRef(true);

  useEffect(() => {
    api.get('/api/menu').then((res) => setData(res.data)).catch(() => {});

    /* Build dynamic anchors from services */
    api.get('/api/services').then((res) => {
      const serviceAnchors = (res.data?.items || [])
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((svc) => ({
          value: `#${toAnchorId(svc.title)}`,
          label: `${svc.title} (service)`,
        }));
      setAnchors([...STATIC_ANCHORS, ...serviceAnchors]);
    }).catch(() => {});
  }, []);

  // Dirty tracking — skip the very first render / initial data load
  useEffect(() => {
    if (initialLoad.current) { initialLoad.current = false; return; }
    setDirty(true);
  }, [data]);

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

  const { saving, toast, save } = useAdminSave(async () => {
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
        <h2>Menu</h2>
        <button className="admin-btn admin-btn--secondary" onClick={addItem}>+ Add Link</button>
      </div>

      <div className="admin-card">
        <h3 className="admin-card__title">Navigation Links</h3>
        <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '16px' }}>
          Set the label and pick which section each link scrolls to.
        </p>

        {items.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-state__text">No menu items yet. Click &quot;+ Add Link&quot; to get started.</div>
          </div>
        ) : (
          items.map((item, i) => {
            const hrefInList = anchors.some((a) => a.value === item.href);
            return (
              <div key={item.id || i} className="admin-social-row">
                <input
                  className="admin-field__input"
                  placeholder="Label"
                  value={item.label || ''}
                  onChange={(e) => updateItem(i, 'label', e.target.value)}
                />
                <select
                  className="admin-field__input"
                  value={hrefInList ? item.href : '__custom__'}
                  onChange={(e) => {
                    if (e.target.value !== '__custom__') {
                      updateItem(i, 'href', e.target.value);
                    }
                  }}
                >
                  {anchors.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label} ({a.value})
                    </option>
                  ))}
                  {!hrefInList && (
                    <option value="__custom__">Custom: {item.href}</option>
                  )}
                </select>
                {!hrefInList && (
                  <input
                    className="admin-field__input"
                    placeholder="Custom href"
                    value={item.href || ''}
                    onChange={(e) => updateItem(i, 'href', e.target.value)}
                    style={{ maxWidth: 160 }}
                  />
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="admin-btn admin-btn--sm" onClick={() => moveItem(i, -1)} title="Move up" disabled={i === 0}>&#8593;</button>
                  <button className="admin-btn admin-btn--sm" onClick={() => moveItem(i, 1)} title="Move down" disabled={i === items.length - 1}>&#8595;</button>
                  <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => removeItem(i)} title="Remove">&#10005;</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AdminSaveBar saving={saving} onSave={save} dirty={dirty} />
    </div>
  );
}
