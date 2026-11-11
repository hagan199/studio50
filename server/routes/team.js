import { Router } from 'express';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.js';
import { getDataPath } from '../data/dataDir.js';

const dataPath = getDataPath('team.json');
const router = Router();

const EMPTY = { section: {}, members: [] };

// ── Helpers ──────────────────────────────────────────────────

/** True when the request carries a valid admin token. Never rejects. */
function isAdmin(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return false;
  try {
    jwt.verify(header.slice(7), process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

async function readTeam() {
  try {
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
    return {
      section: data.section && typeof data.section === 'object' ? data.section : {},
      members: Array.isArray(data.members) ? data.members : [],
      ...(Array.isArray(data.migrations) ? { migrations: data.migrations } : {}),
    };
  } catch (err) {
    if (err.code === 'ENOENT') return { ...EMPTY };
    throw err;
  }
}

export function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const str = (v, max = 5000) => (typeof v === 'string' ? v.slice(0, max) : '');
const bool = (v, fallback = true) => (typeof v === 'boolean' ? v : fallback);
// Links are rendered as href values; refuse script-capable schemes.
const safeUrl = (v, max = 1000) => {
  const url = str(v, max).trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(url) && !/^(https?|mailto|tel):/i.test(url) ? '' : url;
};
const id = (v, prefix) => (typeof v === 'string' && v ? v.slice(0, 80) : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);

function cleanImages(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((img) => (typeof img === 'string' ? { url: img } : img))
    .filter((img) => img && typeof img.url === 'string' && img.url)
    .map((img) => ({ id: id(img.id, 'img'), url: str(img.url, 1000), caption: str(img.caption, 500) }));
}

function cleanProject(p) {
  return {
    id: id(p?.id, 'proj'),
    title: str(p?.title, 200),
    description: str(p?.description, 4000),
    category: str(p?.category, 80).trim(),
    type: p?.type === 'video' ? 'video' : 'gallery',
    images: cleanImages(p?.images),
    videoUrl: str(p?.videoUrl, 1000),
    poster: str(p?.poster, 1000),
    published: bool(p?.published),
  };
}

function cleanMember(m) {
  return {
    id: id(m?.id, 'member'),
    slug: slugify(m?.slug || m?.name),
    name: str(m?.name, 120).trim(),
    position: str(m?.position, 160),
    photo: str(m?.photo, 1000),
    coverImage: str(m?.coverImage, 1000),
    shortIntro: str(m?.shortIntro, 600),
    intro: str(m?.intro, 600),
    bio: str(m?.bio, 8000),
    skills: Array.isArray(m?.skills) ? m.skills.map((s) => str(s, 80).trim()).filter(Boolean).slice(0, 40) : [],
    links: Array.isArray(m?.links)
      ? m.links.map((l) => ({ label: str(l?.label, 60).trim(), url: safeUrl(l?.url) })).filter((l) => l.url).slice(0, 20)
      : [],
    email: str(m?.email, 200).trim(),
    enquiryText: str(m?.enquiryText, 80),
    enquiryLink: safeUrl(m?.enquiryLink),
    published: bool(m?.published),
    projects: Array.isArray(m?.projects) ? m.projects.map(cleanProject) : [],
  };
}

/** Clean every member and make slugs unique (first one keeps the plain slug). */
function cleanMembers(list) {
  const used = new Set();
  return list.map((raw) => {
    const member = cleanMember(raw);
    let base = member.slug || `member-${member.id.slice(-6)}`;
    let slug = base;
    for (let n = 2; used.has(slug); n += 1) slug = `${base}-${n}`;
    used.add(slug);
    return { ...member, slug };
  });
}

/** Public view: published members and published projects only. */
function publicMember(m) {
  return { ...m, projects: (m.projects || []).filter((p) => p.published !== false) };
}

// ── Routes ───────────────────────────────────────────────────

// ?all=1 with an admin token returns drafts too (used by the CMS).
router.get('/', async (req, res) => {
  try {
    const data = await readTeam();
    if (req.query.all === '1' && isAdmin(req)) return res.json(data);
    res.json({
      section: data.section,
      members: data.members.filter((m) => m.published !== false).map(publicMember),
    });
  } catch {
    res.status(500).json({ error: 'Failed to read team' });
  }
});

// ?preview=1 with an admin token shows an unpublished profile / projects.
router.get('/:slug', async (req, res) => {
  try {
    const data = await readTeam();
    const preview = req.query.preview === '1' && isAdmin(req);
    const member = data.members.find((m) => m.slug === req.params.slug);
    if (!member || (!preview && member.published === false)) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json({ section: data.section, member: preview ? member : publicMember(member) });
  } catch {
    res.status(500).json({ error: 'Failed to read team member' });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || !Array.isArray(body.members)) {
    return res.status(400).json({ error: 'Invalid team content: members must be a list' });
  }
  if (body.members.some((m) => !m || typeof m !== 'object' || !String(m.name || '').trim())) {
    return res.status(400).json({ error: 'Every team member needs a name' });
  }

  try {
    const current = await readTeam();
    const section = body.section && typeof body.section === 'object' ? body.section : current.section;
    const next = {
      section: {
        label: str(section.label, 200),
        heading: str(section.heading, 200),
        description: str(section.description, 1000),
        ctaText: str(section.ctaText, 60),
        visible: bool(section.visible),
      },
      members: cleanMembers(body.members),
      ...(current.migrations ? { migrations: current.migrations } : {}),
    };
    // Temp file + rename so a crash mid-write can't leave half a JSON file.
    const tmp = `${dataPath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2));
    await fs.rename(tmp, dataPath);
    res.json({ success: true, data: next });
  } catch {
    res.status(500).json({ error: 'Failed to save team' });
  }
});

export default router;
