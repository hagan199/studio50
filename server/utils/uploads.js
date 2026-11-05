import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In production, UPLOADS_DIR should point to a Railway persistent volume (e.g. /data/uploads)
export const uploadsDir =
  process.env.UPLOADS_DIR || path.join(__dirname, "..", "uploads");

// Category and filename both end up in a filesystem path, so neither may
// contain separators or traversal segments.
export function safeCategory(value) {
  const cleaned = String(value || "general")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "");
  return cleaned || "general";
}

export function safeFilename(originalname, fallback = "file") {
  const base = path.basename(String(originalname || fallback));
  const ext = path.extname(base).toLowerCase();
  const stem = base
    .slice(0, base.length - ext.length)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${Date.now()}-${stem || fallback}${ext}`;
}

// Resolved path must stay inside uploadsDir.
export function resolveInsideUploads(...segments) {
  const target = path.resolve(uploadsDir, ...segments);
  const root = path.resolve(uploadsDir);
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}
