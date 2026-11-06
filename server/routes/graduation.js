import { Router } from 'express';
import fs from 'fs/promises';
import { authMiddleware } from '../middleware/auth.js';
import { getDataPath } from '../data/dataDir.js';

const dataPath = getDataPath('graduation.json');

const REQUIRED_KEYS = ['sections', 'hero', 'gallery', 'packages', 'reels', 'photos'];

const router = Router();

router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch {
    res.status(500).json({ error: 'Failed to read graduation content' });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  const body = req.body;
  // The page reads every one of these blocks, so a partial or malformed save
  // would blank the public page rather than just one section.
  const missing =
    !body || typeof body !== 'object' || Array.isArray(body)
      ? REQUIRED_KEYS
      : REQUIRED_KEYS.filter((key) => body[key] == null || typeof body[key] !== 'object');
  if (missing.length) {
    return res.status(400).json({ error: `Invalid graduation content: missing ${missing.join(', ')}` });
  }

  try {
    // Write to a temp file then rename, so a crash mid-write can't leave
    // half a JSON file behind.
    const tmp = `${dataPath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(body, null, 2));
    await fs.rename(tmp, dataPath);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to save graduation content' });
  }
});

export default router;
