import { adminClient } from './supabase.js';

export type Role = 'volunteer' | 'staff';

export interface Profile {
  role: Role;
  id: number;
  name: string;
  zip_code: string | null;
  email: string | null;
  onboarding_completed: boolean;
  preferred_event_type: string | null;
  availability: string | null;
}

function toProfile(role: Role, idColumn: string, row: Record<string, any>): Profile {
  return {
    role,
    id: row[idColumn],
    name: row.name,
    zip_code: row.zip_code,
    email: row.email,
    // Staff rows don't have onboarding columns; treat staff as always "onboarded".
    onboarding_completed: role === 'staff' ? true : Boolean(row.onboarding_completed),
    preferred_event_type: row.preferred_event_type ?? null,
    availability: row.availability ?? null,
  };
}

async function findInTable(table: 'volunteer' | 'staff', idColumn: string, role: Role, authUserId: string, email: string): Promise<Profile | null> {
  const { data: byAuthId } = await adminClient.from(table).select('*').eq('auth_user_id', authUserId).maybeSingle();
  if (byAuthId) {
    return toProfile(role, idColumn, byAuthId);
  }

  const { data: byEmail } = await adminClient.from(table).select('*').ilike('email', email).maybeSingle();
  if (byEmail) {
    await adminClient.from(table).update({ auth_user_id: authUserId }).eq(idColumn, byEmail[idColumn]);
    return toProfile(role, idColumn, byEmail);
  }

  return null;
}

/**
 * Resolves a signed-in Supabase auth user to their VOLUNTEER or STAFF row.
 * Links the row to the auth account by email on first login if not already linked.
 */
export async function findProfileForAuthUser(authUserId: string, email: string): Promise<Profile | null> {
  const volunteer = await findInTable('volunteer', 'volunteer_id', 'volunteer', authUserId, email);
  if (volunteer) return volunteer;

  const staff = await findInTable('staff', 'staff_id', 'staff', authUserId, email);
  if (staff) return staff;

  return null;
}
