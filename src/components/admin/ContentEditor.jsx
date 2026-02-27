import { useState, useEffect } from 'react';
import api from '../../utils/api';
import ImageField from './ImageField';

function Section({ title, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`admin-section${open ? ' admin-section--open' : ''}`}>
      <button className="admin-section__toggle" onClick={() => setOpen(!open)}>
        <span className="admin-section__title">
          {title}
          {count !== undefined && <span className="admin-section__count">{count}</span>}
        </span>
        <svg className="admin-section__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && <div className="admin-section__body">{children}</div>}
    </div>
  );
}

export default function ContentEditor() {
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/api/content').then((res) => setContent(res.data)).catch(() => {});
  }, []);

  const update = (section, field, value) => {
    setContent((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const updateListItem = (section, field, index, value) => {
    setContent((prev) => {
      const list = [...prev[section][field]];
      list[index] = value;
      return { ...prev, [section]: { ...prev[section], [field]: list } };
    });
  };

  const addListItem = (section, field, defaultValue) => {
    setContent((prev) => {
      const list = [...prev[section][field], defaultValue];
      return { ...prev, [section]: { ...prev[section], [field]: list } };
    });
  };

  const removeListItem = (section, field, index) => {
    setContent((prev) => {
      const list = prev[section][field].filter((_, i) => i !== index);
      return { ...prev, [section]: { ...prev[section], [field]: list } };
    });
  };

  const updateArrayObj = (section, field, index, key, value) => {
    setContent((prev) => {
      const list = [...prev[section][field]];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, [section]: { ...prev[section], [field]: list } };
    });
  };

  const addArrayObj = (section, field, defaultObj) => {
    setContent((prev) => {
      const list = [...prev[section][field], { ...defaultObj, id: Date.now() }];
      return { ...prev, [section]: { ...prev[section], [field]: list } };
    });
  };

  const removeArrayObj = (section, field, index) => {
    setContent((prev) => {
      const list = prev[section][field].filter((_, i) => i !== index);
      return { ...prev, [section]: { ...prev[section], [field]: list } };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/content', content);
      setMessage('Content saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!content) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-editor">
      {/* Toast notification */}
      <div className={`admin-toast ${message ? 'admin-toast--visible' : ''} ${message && message.includes('Failed') ? 'admin-toast--error' : 'admin-toast--success'}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {message && message.includes('Failed')
            ? <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>
            : <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}
        </svg>
        {message}
      </div>

      {/* Brand Info */}
      <Section title="Brand Info" defaultOpen={true}>
        <div className="admin-field">
          <label className="admin-field__label">Brand Name</label>
          <input className="admin-field__input" value={content.brand.name} onChange={(e) => update('brand', 'name', e.target.value)} />
        </div>
        <div className="admin-field">
          <label className="admin-field__label">Short Name (Logo Text)</label>
          <input className="admin-field__input" value={content.brand.shortName} onChange={(e) => update('brand', 'shortName', e.target.value)} />
        </div>
        <div className="admin-field">
          <label className="admin-field__label">Tagline</label>
          <input className="admin-field__input" value={content.brand.tagline} onChange={(e) => update('brand', 'tagline', e.target.value)} />
        </div>
        <ImageField label="Logo" value={content.brand.logoUrl} onChange={(url) => update('brand', 'logoUrl', url)} category="logo" />
      </Section>

      {/* Hero Section */}
      <Section title="Hero Section" defaultOpen={true}>
        <div className="admin-field">
          <label className="admin-field__label">Headline</label>
          <input className="admin-field__input" value={content.hero.headline} onChange={(e) => update('hero', 'headline', e.target.value)} />
        </div>
        <div className="admin-field">
          <label className="admin-field__label">Subheadline</label>
          <textarea className="admin-field__textarea" rows={3} value={content.hero.subheadline} onChange={(e) => update('hero', 'subheadline', e.target.value)} />
        </div>
        <div className="admin-field">
          <label className="admin-field__label">CTA Button Text</label>
          <input className="admin-field__input" value={content.hero.ctaText} onChange={(e) => update('hero', 'ctaText', e.target.value)} />
        </div>
        <div className="admin-field">
          <label className="admin-field__label">CTA Link</label>
          <input className="admin-field__input" value={content.hero.ctaLink} onChange={(e) => update('hero', 'ctaLink', e.target.value)} />
        </div>
        <ImageField label="Background Image" value={content.hero.backgroundImageUrl} onChange={(url) => update('hero', 'backgroundImageUrl', url)} category="hero" />
        <ImageField label="Gallery Images" value={content.hero.galleryImages || []} onChange={(urls) => update('hero', 'galleryImages', urls)} category="hero" multiple />
      </Section>

      {/* About Section */}
      <Section title="About Section">
        <div className="admin-field">
          <label className="admin-field__label">Section Title</label>
          <input className="admin-field__input" value={content.about.sectionTitle} onChange={(e) => update('about', 'sectionTitle', e.target.value)} />
        </div>
        <div className="admin-field">
          <label className="admin-field__label">Section Subtitle</label>
          <input className="admin-field__input" value={content.about.sectionSubtitle} onChange={(e) => update('about', 'sectionSubtitle', e.target.value)} />
        </div>
        <div className="admin-field">
          <label className="admin-field__label">About Text</label>
          <textarea className="admin-field__textarea" rows={5} value={content.about.text} onChange={(e) => update('about', 'text', e.target.value)} />
        </div>
        <ImageField label="About Image" value={content.about.imageUrl} onChange={(url) => update('about', 'imageUrl', url)} category="about" />
        <ImageField label="Gallery Images" value={content.about.galleryImages || []} onChange={(urls) => update('about', 'galleryImages', urls)} category="about" multiple />
      </Section>

      {/* Audition Process */}
      {content.auditionProcess && (
        <Section title="Audition Process" count={content.auditionProcess.steps.length}>
          <div className="admin-field">
            <label className="admin-field__label">Heading</label>
            <input className="admin-field__input" value={content.auditionProcess.heading} onChange={(e) => update('auditionProcess', 'heading', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Subheading</label>
            <input className="admin-field__input" value={content.auditionProcess.subheading} onChange={(e) => update('auditionProcess', 'subheading', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Payment Note</label>
            <input className="admin-field__input" value={content.auditionProcess.paymentNote} onChange={(e) => update('auditionProcess', 'paymentNote', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">PWD Note</label>
            <input className="admin-field__input" value={content.auditionProcess.pwdNote} onChange={(e) => update('auditionProcess', 'pwdNote', e.target.value)} />
          </div>
          <h4 className="admin-item-card__heading">Steps</h4>
          {content.auditionProcess.steps.map((step, i) => (
            <div key={step.id} className="admin-item-card">
              <div className="admin-item-card__header">
                <strong>Step {i + 1}</strong>
                <button className="admin-btn admin-btn--danger" onClick={() => removeArrayObj('auditionProcess', 'steps', i)}>Remove</button>
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Title</label>
                <input className="admin-field__input" value={step.title} onChange={(e) => updateArrayObj('auditionProcess', 'steps', i, 'title', e.target.value)} />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Description</label>
                <textarea className="admin-field__textarea" rows={3} value={step.desc} onChange={(e) => updateArrayObj('auditionProcess', 'steps', i, 'desc', e.target.value)} />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Link Label</label>
                <input className="admin-field__input" value={step.linkLabel} onChange={(e) => updateArrayObj('auditionProcess', 'steps', i, 'linkLabel', e.target.value)} />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Link URL</label>
                <input className="admin-field__input" value={step.linkHref} onChange={(e) => updateArrayObj('auditionProcess', 'steps', i, 'linkHref', e.target.value)} />
              </div>
            </div>
          ))}
          <button className="admin-btn admin-btn--secondary" onClick={() => addArrayObj('auditionProcess', 'steps', { title: '', desc: '', linkLabel: '', linkHref: '' })}>+ Add Step</button>
        </Section>
      )}

      {/* Why HMR */}
      {content.whyHMR && (
        <Section title="Why HMR" count={content.whyHMR.whyItems.length + content.whyHMR.whatItems.length}>
          <div className="admin-field">
            <label className="admin-field__label">Why Title</label>
            <input className="admin-field__input" value={content.whyHMR.whyTitle} onChange={(e) => update('whyHMR', 'whyTitle', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Why Intro Text</label>
            <textarea className="admin-field__textarea" rows={3} value={content.whyHMR.whyIntro} onChange={(e) => update('whyHMR', 'whyIntro', e.target.value)} />
          </div>
          <h4 className="admin-item-card__heading">Why Items</h4>
          {content.whyHMR.whyItems.map((item, i) => (
            <div key={i} className="admin-list-row">
              <input className="admin-field__input" value={item} onChange={(e) => updateListItem('whyHMR', 'whyItems', i, e.target.value)} />
              <button className="admin-btn admin-btn--danger" onClick={() => removeListItem('whyHMR', 'whyItems', i)}>X</button>
            </div>
          ))}
          <button className="admin-btn admin-btn--secondary" onClick={() => addListItem('whyHMR', 'whyItems', '')}>+ Add Item</button>

          <div className="admin-field" style={{ marginTop: '1.5rem' }}>
            <label className="admin-field__label">What We Do Title</label>
            <input className="admin-field__input" value={content.whyHMR.whatTitle} onChange={(e) => update('whyHMR', 'whatTitle', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">What We Do Intro</label>
            <textarea className="admin-field__textarea" rows={3} value={content.whyHMR.whatIntro} onChange={(e) => update('whyHMR', 'whatIntro', e.target.value)} />
          </div>
          <h4 className="admin-item-card__heading">What We Do Items</h4>
          {content.whyHMR.whatItems.map((item, i) => (
            <div key={i} className="admin-list-row">
              <input className="admin-field__input" value={item} onChange={(e) => updateListItem('whyHMR', 'whatItems', i, e.target.value)} />
              <button className="admin-btn admin-btn--danger" onClick={() => removeListItem('whyHMR', 'whatItems', i)}>X</button>
            </div>
          ))}
          <button className="admin-btn admin-btn--secondary" onClick={() => addListItem('whyHMR', 'whatItems', '')}>+ Add Item</button>
        </Section>
      )}

      {/* Latest Content */}
      {content.latestContent && (
        <Section title="Latest Content" count={content.latestContent.items.length}>
          <div className="admin-field">
            <label className="admin-field__label">Heading</label>
            <input className="admin-field__input" value={content.latestContent.heading} onChange={(e) => update('latestContent', 'heading', e.target.value)} />
          </div>
          {content.latestContent.items.map((item, i) => (
            <div key={item.id} className="admin-item-card">
              <div className="admin-item-card__header">
                <strong>Item {i + 1}</strong>
                <button className="admin-btn admin-btn--danger" onClick={() => removeArrayObj('latestContent', 'items', i)}>Remove</button>
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Type</label>
                <select className="admin-field__input" value={item.type} onChange={(e) => updateArrayObj('latestContent', 'items', i, 'type', e.target.value)}>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Title</label>
                <input className="admin-field__input" value={item.title} onChange={(e) => updateArrayObj('latestContent', 'items', i, 'title', e.target.value)} />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Subtitle</label>
                <input className="admin-field__input" value={item.subtitle} onChange={(e) => updateArrayObj('latestContent', 'items', i, 'subtitle', e.target.value)} />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Tag</label>
                <input className="admin-field__input" value={item.tag} onChange={(e) => updateArrayObj('latestContent', 'items', i, 'tag', e.target.value)} />
              </div>
              {item.type === 'video' ? (
                <>
                  <ImageField label="Poster Image" value={item.poster || ''} onChange={(url) => updateArrayObj('latestContent', 'items', i, 'poster', url)} category="content" />
                  <div className="admin-field">
                    <label className="admin-field__label">Video MP4 URL</label>
                    <input className="admin-field__input" value={item.videoMp4 || ''} onChange={(e) => updateArrayObj('latestContent', 'items', i, 'videoMp4', e.target.value)} />
                  </div>
                  <div className="admin-field">
                    <label className="admin-field__label">Video WebM URL</label>
                    <input className="admin-field__input" value={item.videoWebm || ''} onChange={(e) => updateArrayObj('latestContent', 'items', i, 'videoWebm', e.target.value)} />
                  </div>
                </>
              ) : (
                <ImageField label="Image" value={item.imageUrl || ''} onChange={(url) => updateArrayObj('latestContent', 'items', i, 'imageUrl', url)} category="content" />
              )}
              <div className="admin-field">
                <label className="admin-field__label">
                  <input type="checkbox" checked={item.wide || false} onChange={(e) => updateArrayObj('latestContent', 'items', i, 'wide', e.target.checked)} />
                  {' '}Wide layout
                </label>
              </div>
            </div>
          ))}
          <button className="admin-btn admin-btn--secondary" onClick={() => addArrayObj('latestContent', 'items', { type: 'image', title: '', subtitle: '', tag: '', imageUrl: '', wide: false })}>+ Add Item</button>
        </Section>
      )}

      {/* Marquee / What HMR Seeks */}
      {content.marquee && (
        <Section title="What HMR Seeks (Marquee)" count={content.marquee.categories.length}>
          <div className="admin-field">
            <label className="admin-field__label">Heading</label>
            <input className="admin-field__input" value={content.marquee.heading} onChange={(e) => update('marquee', 'heading', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Subheading</label>
            <textarea className="admin-field__textarea" rows={3} value={content.marquee.subheading} onChange={(e) => update('marquee', 'subheading', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Footer Note</label>
            <textarea className="admin-field__textarea" rows={2} value={content.marquee.footerNote} onChange={(e) => update('marquee', 'footerNote', e.target.value)} />
          </div>
          <h4 className="admin-item-card__heading">Categories</h4>
          {content.marquee.categories.map((cat, i) => (
            <div key={cat.id} className="admin-item-card">
              <div className="admin-item-card__header">
                <strong>{cat.label || `Category ${i + 1}`}</strong>
                <button className="admin-btn admin-btn--danger" onClick={() => removeArrayObj('marquee', 'categories', i)}>X</button>
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Label</label>
                <input className="admin-field__input" value={cat.label} onChange={(e) => updateArrayObj('marquee', 'categories', i, 'label', e.target.value)} />
              </div>
              <ImageField label="Category Image" value={cat.imageUrl} onChange={(url) => updateArrayObj('marquee', 'categories', i, 'imageUrl', url)} category="marquee" />
            </div>
          ))}
          <button className="admin-btn admin-btn--secondary" onClick={() => addArrayObj('marquee', 'categories', { label: '', imageUrl: '', alt: false })}>+ Add Category</button>
        </Section>
      )}

      {/* Roadmap */}
      {content.roadmap && (
        <Section title="Roadmap" count={content.roadmap.stages.length}>
          <div className="admin-field">
            <label className="admin-field__label">Heading</label>
            <input className="admin-field__input" value={content.roadmap.heading} onChange={(e) => update('roadmap', 'heading', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Subheading</label>
            <textarea className="admin-field__textarea" rows={3} value={content.roadmap.subheading} onChange={(e) => update('roadmap', 'subheading', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Quote</label>
            <textarea className="admin-field__textarea" rows={2} value={content.roadmap.quote} onChange={(e) => update('roadmap', 'quote', e.target.value)} />
          </div>
          <h4 className="admin-item-card__heading">Stages</h4>
          {content.roadmap.stages.map((stage, i) => (
            <div key={stage.id} className="admin-item-card">
              <div className="admin-item-card__header">
                <strong>Stage {i + 1}</strong>
                <button className="admin-btn admin-btn--danger" onClick={() => removeArrayObj('roadmap', 'stages', i)}>Remove</button>
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Title</label>
                <input className="admin-field__input" value={stage.title} onChange={(e) => updateArrayObj('roadmap', 'stages', i, 'title', e.target.value)} />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Description</label>
                <textarea className="admin-field__textarea" rows={2} value={stage.desc} onChange={(e) => updateArrayObj('roadmap', 'stages', i, 'desc', e.target.value)} />
              </div>
              <ImageField label="Stage Image" value={stage.imageUrl} onChange={(url) => updateArrayObj('roadmap', 'stages', i, 'imageUrl', url)} category="roadmap" />
            </div>
          ))}
          <button className="admin-btn admin-btn--secondary" onClick={() => addArrayObj('roadmap', 'stages', { title: '', desc: '', imageUrl: '' })}>+ Add Stage</button>
        </Section>
      )}

      {/* Credibility */}
      {content.credibility && (
        <Section title="Credibility" count={content.credibility.items.length}>
          <div className="admin-field">
            <label className="admin-field__label">Title</label>
            <input className="admin-field__input" value={content.credibility.title} onChange={(e) => update('credibility', 'title', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Footer Text</label>
            <textarea className="admin-field__textarea" rows={2} value={content.credibility.footerText} onChange={(e) => update('credibility', 'footerText', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">CTA Button Text</label>
            <input className="admin-field__input" value={content.credibility.ctaText} onChange={(e) => update('credibility', 'ctaText', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">CTA Link</label>
            <input className="admin-field__input" value={content.credibility.ctaLink} onChange={(e) => update('credibility', 'ctaLink', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Secondary CTA Text</label>
            <input className="admin-field__input" value={content.credibility.secondaryCtaText} onChange={(e) => update('credibility', 'secondaryCtaText', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Secondary CTA Link</label>
            <input className="admin-field__input" value={content.credibility.secondaryCtaLink} onChange={(e) => update('credibility', 'secondaryCtaLink', e.target.value)} />
          </div>
          <h4 className="admin-item-card__heading">Credibility Items</h4>
          {content.credibility.items.map((item, i) => (
            <div key={i} className="admin-list-row">
              <input className="admin-field__input" value={item} onChange={(e) => updateListItem('credibility', 'items', i, e.target.value)} />
              <button className="admin-btn admin-btn--danger" onClick={() => removeListItem('credibility', 'items', i)}>X</button>
            </div>
          ))}
          <button className="admin-btn admin-btn--secondary" onClick={() => addListItem('credibility', 'items', '')}>+ Add Item</button>
        </Section>
      )}

      {/* CTA Section */}
      {content.cta && (
        <Section title="CTA Section">
          <div className="admin-field">
            <label className="admin-field__label">Heading</label>
            <input className="admin-field__input" value={content.cta.heading} onChange={(e) => update('cta', 'heading', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Subtitle</label>
            <textarea className="admin-field__textarea" rows={3} value={content.cta.subtitle} onChange={(e) => update('cta', 'subtitle', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Button Text</label>
            <input className="admin-field__input" value={content.cta.buttonText} onChange={(e) => update('cta', 'buttonText', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Button Link</label>
            <input className="admin-field__input" value={content.cta.buttonLink} onChange={(e) => update('cta', 'buttonLink', e.target.value)} />
          </div>
        </Section>
      )}

      {/* Sticky save bar */}
      <div className="admin-save-bar">
        <span className="admin-save-bar__hint">Unsaved changes will be lost if you leave this page</span>
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
