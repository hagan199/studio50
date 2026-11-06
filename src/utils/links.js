// Menu links are a mix of homepage anchors ("#about"), site routes
// ("/graduation") and external URLs. These helpers keep them all working from
// any page, not just the homepage.

export const isExternalHref = (href = '') => /^(https?:|mailto:|tel:|\/\/)/i.test(href);

/**
 * Anchor id for a service ("Graphic Design" -> "graphicdesign"). The services
 * grid renders these ids and the menu editor offers them as link targets.
 */
export const serviceAnchorId = (title) =>
  String(title ?? '').toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

export const isHomeHref = (href = '') => href === '' || href === '#' || href === '/';

export const isAnchorHref = (href = '') => href.startsWith('#') && href.length > 1;

/** A route on this site other than the homepage, e.g. "/graduation". */
export const isRouteHref = (href = '') =>
  href.startsWith('/') && !href.startsWith('//') && href !== '/';

/**
 * The href to render. Anchors point at homepage sections, so off the
 * homepage they need the "/" prefix to still lead somewhere.
 */
export function resolveSiteHref(href, pathname) {
  if (!href) return '/';
  if (isExternalHref(href) || isRouteHref(href)) return href;
  if (isHomeHref(href)) return pathname === '/' ? '#' : '/';
  return pathname === '/' ? href : `/${href}`;
}
