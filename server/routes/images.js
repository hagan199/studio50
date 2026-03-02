import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { authMiddleware } from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || "general";
    const dir = path.join(uploadsDir, category);
    fs.mkdir(dir, { recursive: true }).then(() => cb(null, dir));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
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
  try {
    const dir = path.join(uploadsDir, req.params.category);
    const files = await fs.readdir(dir);
    const urls = files
      .filter((f) => f !== ".gitkeep")
      .map((f) => `/uploads/${req.params.category}/${f}`);
    res.json(urls);
  } catch {
    res.json([]);
  }
});

router.delete("/:category/:filename", authMiddleware, async (req, res) => {
  try {
    const filePath = path.join(
      uploadsDir,
      req.params.category,
      req.params.filename,
    );
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: "File not found" });
  }
});

export default router;
