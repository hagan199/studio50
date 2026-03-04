import { useState, useEffect } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

const SECTIONS = [
  {
    key: 'navbar',
    label: 'Navbar',
    desc: 'Top navigation bar',
    fields: {
      background: 'Background',
      linkColor: 'Link Color',
      activeColor: 'Active Link',
      ctaBg: 'CTA Button Bg',
      ctaText: 'CTA Button Text',
    },
  },
  {
    key: 'hero',
    label: 'Hero Section',
    desc: 'Main banner at the top',
    fields: {
      background: 'Background',
      heading: 'Heading',
      text: 'Text',
    },
  },
  {
    key: 'marquee',
    label: 'Gallery / Marquee',
    desc: 'Scrolling image gallery',
    fields: {
      background: 'Background',
      heading: 'Heading',
      accent: 'Accent Text',
    },
  },
  {
    key: 'about',
    label: 'About Section',
    desc: 'About info with stats',
    fields: {
      background: 'Background',
      accent: 'Accent / Labels',
      heading: 'Heading',
      text: 'Text',
    },
  },
  {
    key: 'whyHmr',
    label: 'Why HMR Section',
    desc: 'Dark section with features list',
    fields: {
      background: 'Background',
      heading: 'Heading',
      text: 'Text',
      accent: 'Accent Label',
    },
  },
  {
    key: 'services',
    label: 'Services Section',
    desc: 'Service cards grid',
    fields: {
      background: 'Background',
      cardBg: 'Card Background',
      accent: 'Accent / Labels',
      heading: 'Heading',
      text: 'Text',
    },
  },
  {
    key: 'audition',
    label: 'Audition Process',
    desc: 'Numbered step cards',
    fields: {
      background: 'Background',
      heading: 'Heading',
      badge: 'Badge / Number',
    },
  },
  {
    key: 'latestContent',
    label: 'Latest Content',
    desc: 'Video grid section',
    fields: {
      background: 'Background',
      heading: 'Heading',
      tag: 'Tag Badge',
    },
  },
  {
    key: 'roadmap',
    label: 'Roadmap',
    desc: 'Stage cards on dark background',
    fields: {
      badge: 'Badge / Number',
    },
  },
  {
    key: 'cta',
    label: 'CTA Section',
    desc: 'Call-to-action banner',
    fields: {
      background: 'Background',
      heading: 'Heading',
      text: 'Text',
    },
  },
  {
    key: 'credibility',
    label: 'Credibility Section',
    desc: 'Features list on white background',
    fields: {
      background: 'Background',
      heading: 'Heading',
      text: 'Text',
    },
  },
  {
    key: 'contact',
    label: 'Contact Section',
    desc: 'Contact info and socials',
    fields: {
      background: 'Background',
      accent: 'Accent / Labels',
      heading: 'Heading',
      text: 'Text',
    },
  },
  {
    key: 'footer',
    label: 'Footer',
    desc: 'Site footer',
    fields: {
      background: 'Background',
      heading: 'Heading',
      linkColor: 'Link Color',
      accent: 'Accent Link',
    },
  },
  {
    key: 'buttons',
    label: 'Buttons',
    desc: 'Global button styles',
    fields: {
      primaryBg: 'Primary Bg',
      primaryText: 'Primary Text',
      ctaBg: 'CTA Bg',
      ctaText: 'CTA Text',
      darkBg: 'Dark Bg',
      darkText: 'Dark Text',
    },
  },
];

export default function ThemeEditor() {
  const { theme, updateTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState(null);
  const [openSection, setOpenSection] = useState('navbar');
  const [activeField, setActiveField] = useState(null); // { section, field }
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (theme) setLocalTheme(JSON.parse(JSON.stringify(theme)));
  }, [theme]);

  const handleColorChange = (color) => {
    if (!activeField) return;
    const { section, field } = activeField;
    setLocalTheme((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: color },
    }));
    updateTheme({
      ...localTheme,
      [section]: { ...localTheme[section], [field]: color },
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/theme', localTheme);
      setMessage('Theme saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    try {
      const res = await api.get('/api/theme/defaults');
      setLocalTheme(res.data);
      updateTheme(res.data);
    } catch {
      setMessage('Failed to load defaults');
    }
  };

  if (!localTheme) return <div className="admin-loading">Loading...</div>;

  const currentColor =
    activeField && localTheme[activeField.section]
      ? localTheme[activeField.section][activeField.field]
      : '#000000';

  return (
    <div className="admin-editor">
      <div className="admin-editor__header">
        <h2>Theme & Colors</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="admin-btn admin-btn--secondary" onClick={resetToDefault}>
            Reset Defaults
          </button>
          <button className="admin-btn admin-btn--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      </div>

      {message && <div className="admin-alert admin-alert--success">{message}</div>}

      <div className="admin-theme-layout">
        <div style={{ flex: 1, minWidth: 0 }}>
          {SECTIONS.map((sec) => {
            const isOpen = openSection === sec.key;
            return (
              <div key={sec.key} className="theme-section-card" style={{
                background: 'var(--color-surface, #2A2A2A)',
                borderRadius: '12px',
                marginBottom: '12px',
                border: isOpen ? '1px solid var(--color-accent, #D4A843)' : '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setOpenSection(isOpen ? null : sec.key)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text, #fff)',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sec.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary, #999)', marginTop: 2 }}>
                      {sec.desc}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {localTheme[sec.key] && Object.values(localTheme[sec.key]).slice(0, 4).map((c, i) => (
                      <span key={i} style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: c, border: '2px solid rgba(255,255,255,0.15)',
                        flexShrink: 0,
                      }} />
                    ))}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginLeft: 4 }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>

                {isOpen && localTheme[sec.key] && (
                  <div style={{ padding: '0 20px 20px' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                      gap: '10px',
                    }}>
                      {Object.entries(sec.fields).map(([fieldKey, fieldLabel]) => {
                        const color = localTheme[sec.key][fieldKey] || '#000';
                        const isActive = activeField?.section === sec.key && activeField?.field === fieldKey;
                        return (
                          <button
                            key={fieldKey}
                            onClick={() => setActiveField({ section: sec.key, field: fieldKey })}
                            className={`admin-color-swatch ${isActive ? 'admin-color-swatch--active' : ''}`}
                            style={{ padding: '10px', textAlign: 'left' }}
                          >
                            <span className="admin-color-swatch__preview" style={{ background: color }} />
                            <span className="admin-color-swatch__label">{fieldLabel}</span>
                            <span className="admin-color-swatch__value">{color}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Fonts */}
          <div className="admin-card" style={{ marginTop: '12px' }}>
            <h3 className="admin-card__title">Fonts</h3>
            <div className="admin-grid-2">
              <div className="admin-field">
                <label className="admin-field__label">Heading Font</label>
                <input
                  className="admin-field__input"
                  value={localTheme.fonts?.heading || ''}
                  onChange={(e) =>
                    setLocalTheme((prev) => ({ ...prev, fonts: { ...prev.fonts, heading: e.target.value } }))
                  }
                />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Body Font</label>
                <input
                  className="admin-field__input"
                  value={localTheme.fonts?.body || ''}
                  onChange={(e) =>
                    setLocalTheme((prev) => ({ ...prev, fonts: { ...prev.fonts, body: e.target.value } }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Color Picker Sidebar */}
        <div className="admin-card admin-card--sticky" style={{ width: '280px', flexShrink: 0 }}>
          {activeField ? (
            <>
              <h3 className="admin-card__title" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                {SECTIONS.find((s) => s.key === activeField.section)?.label}
              </h3>
              <p style={{ color: 'var(--color-text-secondary, #999)', fontSize: '0.8rem', marginBottom: '16px' }}>
                {SECTIONS.find((s) => s.key === activeField.section)?.fields[activeField.field]}
              </p>
              <div className="admin-picker-container">
                <HexColorPicker color={currentColor} onChange={handleColorChange} />
                <div className="admin-picker-input" style={{ marginTop: '12px' }}>
                  <label className="admin-field__label">Hex Value</label>
                  <HexColorInput
                    color={currentColor}
                    onChange={handleColorChange}
                    prefixed
                    className="admin-field__input"
                  />
                </div>
              </div>

              <div style={{
                background: localTheme.hero?.background || '#fb3131',
                color: localTheme.hero?.heading || '#fff',
                border: `2px solid ${currentColor}`,
                borderRadius: '12px',
                padding: '20px',
                marginTop: '20px',
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Preview</div>
                <div style={{ width: '100%', height: '24px', borderRadius: '6px', background: currentColor }} />
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--color-text-secondary, #999)', textAlign: 'center', padding: '40px 0' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                style={{ opacity: 0.4, marginBottom: '12px' }}>
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
              </svg>
              <div style={{ fontSize: '0.85rem' }}>Click a color swatch to edit</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
