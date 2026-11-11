// Homepage section layout used when the CMS has not saved one (content.sections).
// The homepage, the admin Page Layout panel and sections that change behaviour
// depending on what else is shown all read it from here so they agree.
export const DEFAULT_SECTIONS = [
  { id: 'hero', label: 'Hero', visible: true, order: 0 },
  // The "Our Services" block.
  { id: 'marquee', label: 'Marquee', visible: true, order: 1 },
  { id: 'auditionProcess', label: 'Audition Process', visible: true, order: 2 },
  { id: 'whyHMR', label: 'Why HMR', visible: true, order: 3 },
  { id: 'latestContent', label: 'Latest Content', visible: true, order: 4 },
  { id: 'credibility', label: 'Credibility', visible: true, order: 5 },
  { id: 'roadmap', label: 'Roadmap', visible: true, order: 6 },
  { id: 'team', label: 'Our Team', visible: true, order: 7 },
  { id: 'cta', label: 'CTA Section', visible: true, order: 8 },
  { id: 'contact', label: 'Contact', visible: true, order: 9 },
  // Card grid, one card per service. Off by default; it can be switched on from
  // the admin Page Layout panel. While it is off, the menu's service links are
  // spread over the sections above (see SERVICE_LINK_TARGETS).
  { id: 'services', label: 'Services Grid', visible: false, order: 10 },
];

/**
 * Where each service link (#graphicdesign, ...) lands while the services grid
 * is hidden. Each listed section renders a <ServiceAnchor> for its ids.
 */
export const SERVICE_LINK_TARGETS = {
  graphicdesign: 'Our Services marquee',
  photography: 'Why HMR — "What we do" column',
  videography: 'Recent Projects (videos)',
  liveproductions: 'Roadmap (showcases & finale)',
};

/** The saved layout if there is one, otherwise the defaults. */
export const resolveSections = (content) =>
  content?.sections?.length ? content.sections : DEFAULT_SECTIONS;

export const isSectionVisible = (content, id) =>
  resolveSections(content).some((s) => s.id === id && s.visible);
