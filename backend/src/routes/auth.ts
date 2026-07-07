import { Router } from 'express';
import { anonClient } from '../lib/supabase.js';
import { findProfileForAuthUser } from '../lib/findProfile.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) {
    return res.status(401).json({ error: error?.message ?? 'Invalid credentials.' });
  }

  const profile = await findProfileForAuthUser(data.user.id, email);
  if (!profile) {
    return res.status(404).json({ error: 'No volunteer or staff profile is linked to this account.' });
  }

  res.json({
    session: { access_token: data.session.access_token },
    profile,
  });
});

authRouter.post('/logout', async (_req, res) => {
  await anonClient.auth.signOut();
  res.status(204).end();
});
