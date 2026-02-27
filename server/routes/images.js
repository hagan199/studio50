import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { authMiddleware } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || 'general';
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
    const allowed = /jpeg|jpg|png|gif|webp|avif|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

const router = Router();

router.post('/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const category = req.body.category || 'general';
  const url = `/uploads/${category}/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

router.get('/:category', async (req, res) => {
  try {
    const dir = path.join(uploadsDir, req.params.category);
    const files = await fs.readdir(dir);
    const urls = files
      .filter((f) => f !== '.gitkeep')
      .map((f) => `/uploads/${req.params.category}/${f}`);
    res.json(urls);
  } catch {
    res.json([]);
  }
});

router.delete('/:category/:filename', authMiddleware, async (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.category, req.params.filename);
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
