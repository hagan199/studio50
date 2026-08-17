import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { authMiddleware } from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// In production, UPLOADS_DIR should point to a Railway persistent volume (e.g. /data/uploads)
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, "..", "uploads");

// Category and filename both end up in a filesystem path, so neither may
// contain separators or traversal segments.
function safeCategory(value) {
  const cleaned = String(value || "general")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "");
  return cleaned || "general";
}

function safeFilename(originalname) {
  const base = path.basename(String(originalname || "image"));
  const ext = path.extname(base).toLowerCase();
  const stem = base
    .slice(0, base.length - ext.length)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${Date.now()}-${stem || "image"}${ext}`;
}

// Resolved path must stay inside uploadsDir.
function resolveInsideUploads(...segments) {
  const target = path.resolve(uploadsDir, ...segments);
  const root = path.resolve(uploadsDir);
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = resolveInsideUploads(safeCategory(req.body.category));
    if (!dir) return cb(new Error("Invalid category"));
    fs.mkdir(dir, { recursive: true })
      .then(() => cb(null, dir))
      .catch(cb);
  },
  filename: (req, file, cb) => {
    cb(null, safeFilename(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExts = new Set([
      ".jpeg",
      ".jpg",
      ".png",
      ".gif",
      ".webp",
      ".avif",
      ".svg",
    ]);
    const allowedMimes = new Set([
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/avif",
      "image/svg+xml",
    ]);

    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowedExt = allowedExts.has(ext);
    const isAllowedMime = allowedMimes.has(file.mimetype);
    if (isAllowedExt && isAllowedMime) return cb(null, true);
    cb(
      new Error(
        "Unsupported image type. Allowed: JPG, PNG, GIF, WEBP, AVIF, SVG.",
      ),
    );
  },
});

const router = Router();

router.post("/upload", authMiddleware, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(413)
            .json({ error: "File too large. Max size is 10MB." });
        }
        return res.status(400).json({ error: err.message || "Upload failed" });
      }
      return res.status(400).json({ error: err.message || "Upload failed" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // IMPORTANT: field order in multipart can mean req.body.category is not available
    // at destination() time. Derive category from where the file was actually stored.
    const actualCategory = req.file.destination
      ? path.basename(req.file.destination)
      : req.body.category || "general";
    const url = `/uploads/${actualCategory}/${req.file.filename}`;
    res.json({ url, filename: req.file.filename, category: actualCategory });
  });
});

router.get("/:category", async (req, res) => {
  const category = safeCategory(req.params.category);
  const dir = resolveInsideUploads(category);
  if (!dir) return res.json([]);

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const urls = entries
      .filter((e) => e.isFile() && e.name !== ".gitkeep")
      .map((e) => `/uploads/${category}/${encodeURIComponent(e.name)}`);
    res.json(urls);
  } catch {
    res.json([]);
  }
});

router.delete("/:category/:filename", authMiddleware, async (req, res) => {
  const filePath = resolveInsideUploads(
    safeCategory(req.params.category),
    path.basename(req.params.filename),
  );
  if (!filePath) return res.status(400).json({ error: "Invalid path" });

  try {
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: "File not found" });
  }
});

export default router;
