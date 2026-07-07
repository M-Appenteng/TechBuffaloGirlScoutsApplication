import type { Request } from 'express';
import { adminClient } from './supabase.js';

/** Returns the STAFF row id linked to the currently authenticated user, or null if they aren't staff. */
export async function resolveStaffId(req: Request): Promise<number | null> {
  const authUserId = req.userClaims?.id;
  if (!authUserId) return null;

  const { data } = await adminClient.from('staff').select('staff_id').eq('auth_user_id', authUserId).maybeSingle();
  return data?.staff_id ?? null;
}
