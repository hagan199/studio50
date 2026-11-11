// The site footer is the "Get in Touch" block (ContactSection). Its text is
// stored in content.footer; anything not saved yet falls back to these, which
// match the copy the site has always shown.
export const FOOTER_DEFAULTS = {
  visible: true,
  label: 'Get in Touch',
  headingLine1: "Let's Create",
  headingLine2: 'Something',
  headingHighlight: 'Amazing',
  description:
    'Talk to our team today to discuss your multimedia needs and discover how we can help you reach your audience in impactful ways.',
  showPhone: true,
  showCta: true,
  ctaText: 'WhatsApp Us',
  // Empty = the WhatsApp link from Contact Info.
  ctaLink: '',
  showEmail: true,
};

export const resolveFooter = (content) => ({ ...FOOTER_DEFAULTS, ...(content?.footer || {}) });

// "Why HMR" list intro. Was hardcoded as "HMR exists to:".
export const DEFAULT_EXISTS_LABEL = 'Studio50 exists to:';
