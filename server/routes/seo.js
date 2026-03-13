import { Router } from 'express';
import fs from 'fs/promises';
import { authMiddleware } from '../middleware/auth.js';
import { getDataPath } from '../data/dataDir.js';

const dataPath = getDataPath('seo.json');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch {
    res.status(500).json({ error: 'Failed to read SEO settings' });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    await fs.writeFile(dataPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to save SEO settings' });
  }
});

export default router;
