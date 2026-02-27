import { useState, useEffect } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

const COLOR_LABELS = {
  primary: 'Primary Color',
  primaryLight: 'Primary Light',
  secondary: 'Secondary Color',
  accent: 'Accent / Gold',
  background: 'Background (Dark)',
  backgroundLight: 'Background Light',
  surface: 'Surface',
  text: 'Text Color',
  textSecondary: 'Text Secondary',
  textDark: 'Text Dark',
};

export default function ThemeEditor() {
  const { theme, updateTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState(null);
  const [activeColor, setActiveColor] = useState('primary');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (theme) setLocalTheme(JSON.parse(JSON.stringify(theme)));
  }, [theme]);

  const handleColorChange = (color) => {
    setLocalTheme((prev) => ({
      ...prev,
      colors: { ...prev.colors, [activeColor]: color },
    }));
    // Live preview
    updateTheme({
      ...localTheme,
      colors: { ...localTheme.colors, [activeColor]: color },
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

  const resetToDefault = () => {
    const defaults = {
      colors: {
        primary: '#5D3A1A',
        primaryLight: '#8B5E3C',
        secondary: '#8B6914',
        accent: '#D4A843',
        background: '#0A0A0A',
        backgroundLight: '#1A1A1A',
        surface: '#2A2A2A',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        textDark: '#111111',
      },
      fonts: localTheme.fonts,
    };
    setLocalTheme(defaults);
    updateTheme(defaults);
  };

  if (!localTheme) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-editor">
      <div className="admin-editor__header">
        <h2>Theme & Colors</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="admin-btn admin-btn--secondary" onClick={resetToDefault}>Reset Defaults</button>
          <button className="admin-btn admin-btn--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      </div>

      {message && <div className="admin-alert admin-alert--success">{message}</div>}

      <div className="admin-theme-layout">
        <div className="admin-card">
          <h3 className="admin-card__title">Color Palette</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Click a color to edit it with the picker. Changes preview live!
          </p>
          <div className="admin-color-grid">
            {Object.entries(localTheme.colors).map(([key, value]) => (
              <button
                key={key}
                className={`admin-color-swatch ${activeColor === key ? 'admin-color-swatch--active' : ''}`}
                onClick={() => setActiveColor(key)}
              >
                <span className="admin-color-swatch__preview" style={{ background: value }} />
                <span className="admin-color-swatch__label">{COLOR_LABELS[key] || key}</span>
                <span className="admin-color-swatch__value">{value}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-card admin-card--sticky">
          <h3 className="admin-card__title">Editing: {COLOR_LABELS[activeColor]}</h3>
          <div className="admin-picker-container">
            <HexColorPicker color={localTheme.colors[activeColor]} onChange={handleColorChange} />
            <div className="admin-picker-input">
              <label className="admin-field__label">Hex Value</label>
              <HexColorInput
                color={localTheme.colors[activeColor]}
                onChange={handleColorChange}
                prefixed
                className="admin-field__input"
              />
            </div>
          </div>

          <div className="admin-preview-mini" style={{
            background: localTheme.colors.background,
            color: localTheme.colors.text,
            border: `2px solid ${localTheme.colors.primary}`,
            borderRadius: '12px',
            padding: '20px',
            marginTop: '20px',
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: localTheme.colors.accent, marginBottom: 8 }}>
              Preview
            </div>
            <div style={{ fontSize: '0.9rem', color: localTheme.colors.textSecondary, marginBottom: 12 }}>
              This is how your text looks
            </div>
            <div style={{
              background: localTheme.colors.primary,
              color: localTheme.colors.text,
              padding: '8px 20px',
              borderRadius: '50px',
              display: 'inline-block',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              Button Preview
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card__title">Fonts</h3>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">Heading Font</label>
            <input className="admin-field__input" value={localTheme.fonts.heading} onChange={(e) => setLocalTheme((prev) => ({ ...prev, fonts: { ...prev.fonts, heading: e.target.value } }))} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Body Font</label>
            <input className="admin-field__input" value={localTheme.fonts.body} onChange={(e) => setLocalTheme((prev) => ({ ...prev, fonts: { ...prev.fonts, body: e.target.value } }))} />
          </div>
        </div>
      </div>
    </div>
  );
}
