import api from './api';

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // keep in sync with server (10MB)

export const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
]);

export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/gif,image/webp,image/avif,image/svg+xml';

export function validateImageFile(file) {
  if (!file) return 'No file selected';
  if (file.size > MAX_IMAGE_BYTES) return `File too large (${formatBytes(file.size)}, max 10MB)`;
  if (!ALLOWED_IMAGE_MIMES.has(file.type)) return 'Unsupported file type (JPG, PNG, GIF, WEBP, AVIF, SVG only)';
  return null;
}

export function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Phone photos are routinely 4-8MB. Uploading them raw makes the CMS slow to
// save and the public site slow to paint, so downscale/re-encode first.
const MAX_DIMENSION = 2400;
const COMPRESS_ABOVE_BYTES = 600 * 1024;
const NEVER_COMPRESS = new Set(['image/svg+xml', 'image/gif']); // vector / animation

export async function compressImage(file) {
  if (NEVER_COMPRESS.has(file.type)) return file;
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    const longestEdge = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, MAX_DIMENSION / longestEdge);

    // Already small enough in both bytes and pixels — leave it untouched.
    if (scale === 1 && file.size <= COMPRESS_ABOVE_BYTES) return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82));
    if (!blob || blob.size >= file.size) return file;

    const name = `${file.name.replace(/\.[^.]+$/, '')}.webp`;
    return new File([blob], name, { type: 'image/webp', lastModified: Date.now() });
  } catch {
    return file;
  } finally {
    bitmap?.close?.();
  }
}

/**
 * Compress (when worthwhile) and upload one image.
 * onProgress receives 0-100 for the network transfer.
 */
export async function uploadImage(file, category, onProgress) {
  const prepared = await compressImage(file);

  const formData = new FormData();
  // IMPORTANT: multer's destination() reads req.body.category while streaming,
  // so the category field must arrive before the file.
  formData.append('category', category);
  formData.append('image', prepared);

  const res = await api.post('/api/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!onProgress) return;
      const total = event.total || prepared.size;
      if (total) onProgress(Math.min(100, Math.round((event.loaded / total) * 100)));
    },
  });

  return res.data.url;
}

export function uploadErrorMessage(err) {
  return err?.response?.data?.error || err?.message || 'Upload failed';
}
