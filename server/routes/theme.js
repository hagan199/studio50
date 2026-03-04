import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'data', 'theme.json');

const DEFAULTS = {
  navbar: { background: '#ffffff', linkColor: '#0d0d0d', activeColor: '#fb3131', ctaBg: '#fb3131', ctaText: '#ffffff' },
  hero: { background: '#fb3131', heading: '#ffffff', text: '#eeeeee' },
  marquee: { background: '#eeeeee', heading: '#171717', accent: '#fb3131' },
  about: { background: '#1A1A1A', accent: '#D4A843', heading: '#ffffff', text: '#cccccc' },
  whyHmr: { background: '#1e1e1e', heading: '#ffffff', text: '#eeeeee', accent: '#fb3131' },
  services: { background: '#0A0A0A', cardBg: '#1A1A1A', accent: '#D4A843', heading: '#ffffff', text: '#cccccc' },
  audition: { background: '#ffffff', heading: '#171717', badge: '#fb3131' },
  latestContent: { background: '#ffffff', heading: '#171717', tag: '#fb3131' },
  roadmap: { badge: '#fb3131' },
  cta: { background: '#ffffff', heading: '#171717', text: '#171717' },
  credibility: { background: '#ffffff', heading: '#171717', text: '#171717' },
  contact: { background: '#0A0A0A', accent: '#D4A843', heading: '#ffffff', text: '#cccccc' },
  footer: { background: '#171717', heading: '#ffffff', linkColor: '#999999', accent: '#fb3131' },
  buttons: { primaryBg: '#fb3131', primaryText: '#ffffff', ctaBg: '#ffffff', ctaText: '#171717', darkBg: '#1e1e1e', darkText: '#ffffff' },
  fonts: { heading: "'Bricolage Grotesque', sans-serif", body: "'Inter', sans-serif" },
};

const router = Router();

router.get('/defaults', (req, res) => {
  res.json(DEFAULTS);
});

router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read theme' });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    await fs.writeFile(dataPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save theme' });
  }
});

export default router;
