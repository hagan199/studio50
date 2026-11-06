// Homepage section layout used when the CMS has not saved one (content.sections).
// The homepage, the admin Page Layout panel and sections that change behaviour
// depending on what else is shown all read it from here so they agree.
export const DEFAULT_SECTIONS = [
  { id: 'hero', label: 'Hero', visible: true, order: 0 },
  { id: 'marquee', label: 'Marquee', visible: true, order: 1 },
  // One card per service, each with its own anchor (#photography, ...), which
  // the menu's service links point at.
  { id: 'services', label: 'Services', visible: true, order: 2 },
  { id: 'auditionProcess', label: 'Audition Process', visible: true, order: 3 },
  { id: 'whyHMR', label: 'Why HMR', visible: true, order: 4 },
  { id: 'latestContent', label: 'Latest Content', visible: true, order: 5 },
  { id: 'credibility', label: 'Credibility', visible: true, order: 6 },
  { id: 'roadmap', label: 'Roadmap', visible: true, order: 7 },
  { id: 'cta', label: 'CTA Section', visible: true, order: 8 },
  { id: 'contact', label: 'Contact', visible: true, order: 9 },
];

/** The saved layout if there is one, otherwise the defaults. */
export const resolveSections = (content) =>
  content?.sections?.length ? content.sections : DEFAULT_SECTIONS;

export const isSectionVisible = (content, id) =>
  resolveSections(content).some((s) => s.id === id && s.visible);
