import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { authMiddleware } from "../middleware/auth.js";
import {
  safeCategory,
  safeFilename,
  resolveInsideUploads,
} from "../utils/uploads.js";

// Graduation reels and hero clips are far larger than photos, so videos get
// their own endpoint and limit instead of loosening the image upload rules.
const MAX_VIDEO_MB = Number(process.env.MAX_VIDEO_MB) || 200;

const ALLOWED = new Map([
  [".mp4", new Set(["video/mp4"])],
  [".m4v", new Set(["video/mp4", "video/x-m4v"])],
  [".webm", new Set(["video/webm"])],
  [".mov", new Set(["video/quicktime"])],
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = resolveInsideUploads(safeCategory(req.body.category || "videos"));
    if (!dir) return cb(new Error("Invalid category"));
    fs.mkdir(dir, { recursive: true })
      .then(() => cb(null, dir))
      .catch(cb);
  },
  filename: (req, file, cb) => {
    cb(null, safeFilename(file.originalname, "video"));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED.get(ext)?.has(file.mimetype)) return cb(null, true);
    cb(new Error("Unsupported video type. Allowed: MP4, M4V, WEBM, MOV."));
  },
});

const router = Router();

router.post("/upload", authMiddleware, (req, res) => {
  upload.single("video")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .json({ error: `File too large. Max size is ${MAX_VIDEO_MB}MB.` });
      }
      return res.status(400).json({ error: err.message || "Upload failed" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Derive the category from where multer actually stored the file (the
    // form field can arrive after the file in a multipart body).
    const category = path.basename(req.file.destination);
    res.json({
      url: `/uploads/${category}/${req.file.filename}`,
      filename: req.file.filename,
      category,
    });
  });
});

export default router;
