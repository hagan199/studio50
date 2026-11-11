// Helpers shared by Latest Content, team portfolios and their CMS editors.

export const newId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

/**
 * Gallery images as [{ id, url, caption }]. Accepts the new `images` list
 * (objects or plain URL strings) and falls back to the single `imageUrl` that
 * older Latest Content "image" items use, so existing content keeps showing.
 */
export function galleryImages(item) {
  const list = Array.isArray(item?.images) ? item.images : [];
  const images = list
    .map((img, i) => (typeof img === 'string' ? { id: `img-${i}`, url: img, caption: '' } : img))
    .filter((img) => img?.url);
  if (images.length) return images;
  return item?.imageUrl ? [{ id: 'legacy', url: item.imageUrl, caption: '' }] : [];
}

/**
 * A path typed from someone's own computer (C:\..., "D:\...mp4", file://...)
 * can never load for visitors. The CMS warns about these.
 */
export function isLocalPath(url = '') {
  const v = String(url).trim().replace(/^["']|["']$/g, '');
  return /^[a-z]:[\\/]/i.test(v) || v.startsWith('file:') || v.startsWith('\\\\');
}

/** A media URL the browser can actually load (uploaded, site-relative or http). */
export function isPlayableUrl(url = '') {
  const v = String(url).trim();
  return Boolean(v) && !isLocalPath(v) && (/^https?:\/\//i.test(v) || v.startsWith('/'));
}

/**
 * Only allow link schemes that are safe to render as href values
 * (blocks javascript: and similar). Bare domains get https://.
 */
export function safeHref(url = '') {
  const v = String(url).trim();
  if (!v) return '';
  if (/^(https?:|mailto:|tel:)/i.test(v) || v.startsWith('/') || v.startsWith('#')) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return '';
  return `https://${v}`;
}

/** Ask for the first frame so a video without a poster still has a thumbnail. */
export const videoThumbSrc = (url) => (url && !url.includes('#') ? `${url}#t=0.1` : url);

/** URL slug for a team member ("Ama K. Mensah" -> "ama-k-mensah"). Mirrors the server. */
export function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Cover image for a portfolio project: first image, else the video poster. */
export const projectCover = (project) => galleryImages(project)[0]?.url || project?.poster || '';
