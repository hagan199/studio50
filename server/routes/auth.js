import { Router } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.post('/login', (req, res) => {
  const { password } = req.body ?? {};

  if (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD) {
    return res.status(500).json({
      error:
        'Server auth is not configured. Set JWT_SECRET and ADMIN_PASSWORD in the environment.',
    });
  }

  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid password' });
});

export default router;
