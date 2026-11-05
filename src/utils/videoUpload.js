import api from './api';
import { formatBytes } from './imageUpload';

// Keep in sync with the server default (MAX_VIDEO_MB in server/routes/videos.js).
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime,.mp4,.m4v,.webm,.mov';

const ALLOWED_EXT = /\.(mp4|m4v|webm|mov)$/i;

export function validateVideoFile(file) {
  if (!file) return 'No file selected';
  if (!ALLOWED_EXT.test(file.name)) return 'Unsupported file type (MP4, WEBM or MOV only)';
  if (file.size > MAX_VIDEO_BYTES) return `File too large (${formatBytes(file.size)}, max ${formatBytes(MAX_VIDEO_BYTES)})`;
  return null;
}

/** Upload one video; onProgress receives 0-100. Resolves to the public URL. */
export async function uploadVideo(file, category, onProgress) {
  const formData = new FormData();
  // multer's destination() reads the category while streaming, so it must come first.
  formData.append('category', category);
  formData.append('video', file);

  const res = await api.post('/api/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // Large files on slow connections; don't let a default timeout cut them off.
    timeout: 0,
    onUploadProgress: (event) => {
      if (!onProgress) return;
      const total = event.total || file.size;
      if (total) onProgress(Math.min(100, Math.round((event.loaded / total) * 100)));
    },
  });
  return res.data.url;
}
