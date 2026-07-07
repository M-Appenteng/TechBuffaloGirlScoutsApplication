import type { Request } from 'express';
import { adminClient } from './supabase.js';

/**
 * Looks up the VOLUNTEER row linked to the currently authenticated user.
 * Returns null if the request isn't authenticated or isn't linked to a volunteer.
 */
export async function resolveVolunteerId(req: Request): Promise<number | null> {
  const authUserId = req.userClaims?.id;
  if (!authUserId) return null;

  const { data } = await adminClient.from('volunteer').select('volunteer_id').eq('auth_user_id', authUserId).maybeSingle();
  return data?.volunteer_id ?? null;
}
