import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const ThemeContext = createContext();

const VAR_MAP = {
  navbar: {
    background: '--navbar-bg',
    linkColor: '--navbar-link-color',
    activeColor: '--navbar-active-color',
    ctaBg: '--navbar-cta-bg',
    ctaText: '--navbar-cta-text',
  },
  hero: {
    background: '--hero-bg',
    heading: '--hero-heading',
    text: '--hero-text',
  },
  marquee: {
    background: '--marquee-bg',
    heading: '--marquee-heading',
    accent: '--marquee-accent',
  },
  about: {
    background: '--about-bg',
    accent: '--about-accent',
    heading: '--about-heading',
    text: '--about-text',
  },
  whyHmr: {
    background: '--whyhmr-bg',
    heading: '--whyhmr-heading',
    text: '--whyhmr-text',
    accent: '--whyhmr-accent',
  },
  services: {
    background: '--services-bg',
    cardBg: '--services-card-bg',
    accent: '--services-accent',
    heading: '--services-heading',
    text: '--services-text',
  },
  audition: {
    background: '--audition-bg',
    heading: '--audition-heading',
    badge: '--audition-badge',
  },
  latestContent: {
    background: '--latest-bg',
    heading: '--latest-heading',
    tag: '--latest-tag',
  },
  roadmap: {
    badge: '--roadmap-badge',
  },
  cta: {
    background: '--cta-bg',
    heading: '--cta-heading',
    text: '--cta-text',
  },
  credibility: {
    background: '--credibility-bg',
    heading: '--credibility-heading',
    text: '--credibility-text',
  },
  contact: {
    background: '--contact-bg',
    accent: '--contact-accent',
    heading: '--contact-heading',
    text: '--contact-text',
  },
  footer: {
    background: '--footer-bg',
    heading: '--footer-heading',
    linkColor: '--footer-link-color',
    accent: '--footer-accent',
  },
  buttons: {
    primaryBg: '--btn-primary-bg',
    primaryText: '--btn-primary-text',
    ctaBg: '--btn-cta-bg',
    ctaText: '--btn-cta-text',
    darkBg: '--btn-dark-bg',
    darkText: '--btn-dark-text',
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyTheme = (themeData) => {
    const root = document.documentElement;
    for (const [section, fields] of Object.entries(VAR_MAP)) {
      if (!themeData[section]) continue;
      for (const [field, cssVar] of Object.entries(fields)) {
        if (themeData[section][field]) {
          root.style.setProperty(cssVar, themeData[section][field]);
        }
      }
    }
    if (themeData.fonts) {
      root.style.setProperty('--font-heading', themeData.fonts.heading);
      root.style.setProperty('--font-body', themeData.fonts.body);
    }
    if (themeData.typography) {
      const t = themeData.typography;
      if (t.h1) root.style.setProperty('--font-size-h1', t.h1 + 'rem');
      if (t.h2) root.style.setProperty('--font-size-h2', t.h2 + 'rem');
      if (t.h3) root.style.setProperty('--font-size-h3', t.h3 + 'rem');
      if (t.h4) root.style.setProperty('--font-size-h4', t.h4 + 'rem');
      if (t.bodyLarge) root.style.setProperty('--font-size-body-large', t.bodyLarge + 'rem');
      if (t.bodyNormal) root.style.setProperty('--font-size-body-normal', t.bodyNormal + 'rem');
    }
    if (themeData.spacing) {
      const s = themeData.spacing;
      if (s.sectionPaddingY) root.style.setProperty('--section-padding-y', s.sectionPaddingY + 'px');
      if (s.containerWidth) root.style.setProperty('--container-max-width', s.containerWidth + 'px');
    }
    if (themeData.borderRadius) {
      const br = themeData.borderRadius;
      if (br.button != null) root.style.setProperty('--radius-button', br.button + 'px');
      if (br.card != null) root.style.setProperty('--radius-card', br.card + 'px');
      if (br.badge != null) root.style.setProperty('--radius-badge', br.badge + 'px');
      if (br.image != null) root.style.setProperty('--radius-image', br.image + 'px');
    }
  };

  useEffect(() => {
    api.get('/api/theme')
      .then((res) => {
        setTheme(res.data);
        applyTheme(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
