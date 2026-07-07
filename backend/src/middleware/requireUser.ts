import type { Request, Response, NextFunction } from 'express';
import { verifyCredentials } from '@supabase/server/core';

/**
 * Verifies the caller's Supabase JWT and attaches their identity to the request.
 * Routes behind this middleware can no longer be called with a forged/guessed id —
 * they must derive whose data to touch from req.userClaims, not from the request body.
 */
export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const { data: auth, error } = await verifyCredentials({ token, apikey: null }, { auth: 'user' });
  if (error) {
    return res.status(error.status).json({ error: error.message });
  }

  req.userClaims = auth.userClaims ?? undefined;
  next();
}
