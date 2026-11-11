import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import ImageField from './ImageField';
import useAdminSave from '../../hooks/useAdminSave';
import AdminToast from './AdminToast';
import AdminSaveBar from './AdminSaveBar';
import { Section, LoadingSkeleton } from './AdminSection';
import { resolveSections } from '../../utils/sections';
import { resolveFooter, DEFAULT_EXISTS_LABEL } from '../../utils/footer';
import LatestContentEditor from './LatestContentEditor';

export default function ContentEditor() {
  const [content, setContent] = useState(null);
  const [dirty, setDirty] = useState(false);
  const initialLoad = useRef(true);

  useEffect(() => {
    api.get('/api/content')
      .then((res) => setContent({
        ...res.data,
        // Show the layout the homepage is actually using, even before one has
        // been saved, so Page Layout can toggle and reorder it.
        sections: resolveSections(res.data).map((s) => ({ ...s })),
        navigation: {
          ctaText: 'Get in Touch',
          ctaLink: '#contact',
          ...(res.data.navigation || {}),
        },
        // Show the footer text the site is actually using, even before saved.
        footer: resolveFooter(res.data),
        ...(res.data.whyHMR && {
          whyHMR: {
            ...res.data.whyHMR,
            existsLabel: res.data.whyHMR.existsLabel ?? DEFAULT_EXISTS_LABEL,
          },
        }),
      }))
      .catch(() => {});
  }, []);

  // Dirty tracking — skip the very first render / initial data load
  useEffect(() => {
    if (initialLoad.current) { initialLoad.current = false; return; }
    setDirty(true);
  }, [content]);

  const { saving, toast, save } = useAdminSave(async () => {
    await api.put('/api/content', content);
    setDirty(false);
  });

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

  if (!content) return <LoadingSkeleton />;

  return (
    <div className="admin-editor">
      <AdminToast toast={toast} />

      {/* Page Layout */}
      <Section title="Page Layout" defaultOpen={true}>
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
          Toggle section visibility and reorder sections on the homepage.
        </p>
        {(content.sections || [])
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((section, idx, sorted) => (
            <div key={section.id} className="admin-list-row">
              <label className="admin-checkbox" style={{ flex: 1, margin: 0 }}>
                <input
                  type="checkbox"
                  checked={section.visible}
                  onChange={(e) => {
                    setContent((prev) => ({
                      ...prev,
                      sections: prev.sections.map((s) =>
                        s.id === section.id ? { ...s, visible: e.target.checked } : s
                      ),
                    }));
                  }}
                />
                {section.label}
              </label>
              <button
                className="admin-btn admin-btn--secondary admin-btn--sm"
                disabled={idx === 0}
                onClick={() => {
                  const prevSection = sorted[idx - 1];
                  setContent((prev) => ({
                    ...prev,
                    sections: prev.sections.map((s) => {
                      if (s.id === section.id) return { ...s, order: prevSection.order };
                      if (s.id === prevSection.id) return { ...s, order: section.order };
                      return s;
                    }),
                  }));
                }}
              >
                &uarr;
              </button>
              <button
                className="admin-btn admin-btn--secondary admin-btn--sm"
                disabled={idx === sorted.length - 1}
                onClick={() => {
                  const nextSection = sorted[idx + 1];
                  setContent((prev) => ({
                    ...prev,
                    sections: prev.sections.map((s) => {
                      if (s.id === section.id) return { ...s, order: nextSection.order };
                      if (s.id === nextSection.id) return { ...s, order: section.order };
                      return s;
                    }),
                  }));
                }}
              >
                &darr;
              </button>
            </div>
          ))}
      </Section>

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

      {/* Navigation */}
      <Section title="Navigation">
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">CTA Button Text</label>
            <input className="admin-field__input" value={content.navigation.ctaText} onChange={(e) => update('navigation', 'ctaText', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">CTA Link</label>
            <input className="admin-field__input" value={content.navigation.ctaLink} onChange={(e) => update('navigation', 'ctaLink', e.target.value)} />
          </div>
        </div>
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
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">CTA Button Text</label>
            <input className="admin-field__input" value={content.hero.ctaText} onChange={(e) => update('hero', 'ctaText', e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">CTA Link</label>
            <input className="admin-field__input" value={content.hero.ctaLink} onChange={(e) => update('hero', 'ctaLink', e.target.value)} />
          </div>
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
          <div className="admin-grid-2">
            <div className="admin-field">
              <label className="admin-field__label">Heading</label>
              <input className="admin-field__input" value={content.auditionProcess.heading} onChange={(e) => update('auditionProcess', 'heading', e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Subheading</label>
              <input className="admin-field__input" value={content.auditionProcess.subheading} onChange={(e) => update('auditionProcess', 'subheading', e.target.value)} />
            </div>
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
                <strong className="admin-item-card__title">Step {i + 1}</strong>
                <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => removeArrayObj('auditionProcess', 'steps', i)}>Remove</button>
              </div>
              <div className="admin-grid-2">
                <div className="admin-field">
                  <label className="admin-field__label">Title</label>
                  <input className="admin-field__input" value={step.title} onChange={(e) => updateArrayObj('auditionProcess', 'steps', i, 'title', e.target.value)} />
                </div>
                <div className="admin-field">
                  <label className="admin-field__label">Link Label</label>
                  <input className="admin-field__input" value={step.linkLabel} onChange={(e) => updateArrayObj('auditionProcess', 'steps', i, 'linkLabel', e.target.value)} />
                </div>
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Description</label>
                <textarea className="admin-field__textarea" rows={3} value={step.desc} onChange={(e) => updateArrayObj('auditionProcess', 'steps', i, 'desc', e.target.value)} />
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
          <div className="admin-field">
            <label className="admin-field__label">List Heading</label>
            <input className="admin-field__input" value={content.whyHMR.existsLabel ?? ''} onChange={(e) => update('whyHMR', 'existsLabel', e.target.value)} placeholder={DEFAULT_EXISTS_LABEL} />
            <span className="admin-field__hint">Shown above the list below, e.g. "Studio50 exists to:". Leave empty to hide it.</span>
          </div>
          <h4 className="admin-item-card__heading">Why Items</h4>
          {content.whyHMR.whyItems.map((item, i) => (
            <div key={i} className="admin-list-row">
              <input className="admin-field__input" value={item} onChange={(e) => updateListItem('whyHMR', 'whyItems', i, e.target.value)} />
              <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => removeListItem('whyHMR', 'whyItems', i)}>X</button>
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
              <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => removeListItem('whyHMR', 'whatItems', i)}>X</button>
            </div>
          ))}
          <button className="admin-btn admin-btn--secondary" onClick={() => addListItem('whyHMR', 'whatItems', '')}>+ Add Item</button>
        </Section>
      )}

      {/* Latest Content */}
      {content.latestContent && (
        <Section title="Latest Content" count={(content.latestContent.items || []).length}>
          <LatestContentEditor
            section={content.latestContent}
            onChange={(latestContent) => setContent((prev) => ({ ...prev, latestContent }))}
          />
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
                <strong className="admin-item-card__title">{cat.label || `Category ${i + 1}`}</strong>
                <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => removeArrayObj('marquee', 'categories', i)}>X</button>
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
                <strong className="admin-item-card__title">Stage {i + 1}</strong>
                <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => removeArrayObj('roadmap', 'stages', i)}>Remove</button>
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
          <div className="admin-grid-2">
            <div className="admin-field">
              <label className="admin-field__label">CTA Button Text</label>
              <input className="admin-field__input" value={content.credibility.ctaText} onChange={(e) => update('credibility', 'ctaText', e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-field__label">CTA Link</label>
              <input className="admin-field__input" value={content.credibility.ctaLink} onChange={(e) => update('credibility', 'ctaLink', e.target.value)} />
            </div>
          </div>
          <div className="admin-grid-2">
            <div className="admin-field">
              <label className="admin-field__label">Secondary CTA Text</label>
              <input className="admin-field__input" value={content.credibility.secondaryCtaText} onChange={(e) => update('credibility', 'secondaryCtaText', e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Secondary CTA Link</label>
              <input className="admin-field__input" value={content.credibility.secondaryCtaLink} onChange={(e) => update('credibility', 'secondaryCtaLink', e.target.value)} />
            </div>
          </div>
          <h4 className="admin-item-card__heading">Credibility Items</h4>
          {content.credibility.items.map((item, i) => (
            <div key={i} className="admin-list-row">
              <input className="admin-field__input" value={item} onChange={(e) => updateListItem('credibility', 'items', i, e.target.value)} />
              <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => removeListItem('credibility', 'items', i)}>X</button>
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
          <div className="admin-grid-2">
            <div className="admin-field">
              <label className="admin-field__label">Button Text</label>
              <input className="admin-field__input" value={content.cta.buttonText} onChange={(e) => update('cta', 'buttonText', e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Button Link</label>
              <input className="admin-field__input" value={content.cta.buttonLink} onChange={(e) => update('cta', 'buttonLink', e.target.value)} />
            </div>
          </div>
        </Section>
      )}

      {/* Footer ("Get in Touch") */}
      <Section title="Footer — Get in Touch">
        <p className="grad-admin-note">
          The footer shown at the bottom of every page. Phone, WhatsApp, email and social links are edited under <strong>Contact</strong>.
        </p>
        <label className="admin-checkbox">
          <input type="checkbox" checked={content.footer.visible !== false} onChange={(e) => update('footer', 'visible', e.target.checked)} />
          Show the footer on all pages
        </label>
        <div className="admin-field">
          <label className="admin-field__label">Small Heading</label>
          <input className="admin-field__input" value={content.footer.label} onChange={(e) => update('footer', 'label', e.target.value)} placeholder="Get in Touch" />
        </div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">Title — first line</label>
            <input className="admin-field__input" value={content.footer.headingLine1} onChange={(e) => update('footer', 'headingLine1', e.target.value)} placeholder="Let's Create" />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">Title — second line</label>
            <input className="admin-field__input" value={content.footer.headingLine2} onChange={(e) => update('footer', 'headingLine2', e.target.value)} placeholder="Something" />
          </div>
        </div>
        <div className="admin-field">
          <label className="admin-field__label">Title — highlighted word</label>
          <input className="admin-field__input" value={content.footer.headingHighlight} onChange={(e) => update('footer', 'headingHighlight', e.target.value)} placeholder="Amazing" />
          <span className="admin-field__hint">Shown in italics in the accent colour at the end of the second line.</span>
        </div>
        <div className="admin-field">
          <label className="admin-field__label">Description</label>
          <textarea className="admin-field__textarea" rows={3} value={content.footer.description} onChange={(e) => update('footer', 'description', e.target.value)} />
        </div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-field__label">CTA Button Text</label>
            <input className="admin-field__input" value={content.footer.ctaText} onChange={(e) => update('footer', 'ctaText', e.target.value)} placeholder="WhatsApp Us" />
          </div>
          <div className="admin-field">
            <label className="admin-field__label">CTA Button Link</label>
            <input className="admin-field__input" value={content.footer.ctaLink} onChange={(e) => update('footer', 'ctaLink', e.target.value)} placeholder="Empty = WhatsApp link from Contact" />
            <span className="admin-field__hint">Any URL, #section, mailto: or tel: link. Leave empty to use the WhatsApp link.</span>
          </div>
        </div>
        <div className="admin-toggle-row">
          <label className="admin-checkbox">
            <input type="checkbox" checked={content.footer.showCta !== false} onChange={(e) => update('footer', 'showCta', e.target.checked)} />
            Show CTA button
          </label>
          <label className="admin-checkbox">
            <input type="checkbox" checked={content.footer.showPhone !== false} onChange={(e) => update('footer', 'showPhone', e.target.checked)} />
            Show phone number
          </label>
          <label className="admin-checkbox">
            <input type="checkbox" checked={content.footer.showEmail !== false} onChange={(e) => update('footer', 'showEmail', e.target.checked)} />
            Show email
          </label>
        </div>
      </Section>

      <AdminSaveBar saving={saving} onSave={save} dirty={dirty} />
    </div>
  );
}
