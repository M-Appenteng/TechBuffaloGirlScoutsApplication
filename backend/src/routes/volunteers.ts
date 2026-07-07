import { Router } from 'express';
import type { Request, Response } from 'express';
import { adminClient } from '../lib/supabase.js';
import { requireUser } from '../middleware/requireUser.js';
import { resolveVolunteerId } from '../lib/resolveVolunteerId.js';

export const volunteersRouter = Router();
volunteersRouter.use(requireUser);

// Postgres folds unquoted CREATE TABLE names to lowercase, so the real table is `event`/`school`.
// Alias the embed back to SCHOOL so the JSON shape the frontend expects doesn't change.
const EVENT_SELECT = '*, SCHOOL:school(school_name, street, city_town)';
const AVAILABILITY_OPTIONS = ['Weekdays', 'Weekends', 'Both'];

/** Confirms the caller is the same volunteer named in the URL. Writes the 403 response itself on mismatch. */
async function assertOwnVolunteer(req: Request, res: Response): Promise<number | null> {
  const authedId = await resolveVolunteerId(req);
  const paramId = Number(req.params.volunteerId);
  if (!authedId || authedId !== paramId) {
    res.status(403).json({ error: 'You can only manage your own volunteer profile.' });
    return null;
  }
  return authedId;
}

volunteersRouter.get('/:volunteerId/events/upcoming', async (req, res) => {
  const volunteerId = await assertOwnVolunteer(req, res);
  if (volunteerId === null) return;
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await adminClient
    .from('event')
    .select(EVENT_SELECT)
    .eq('volunteer_id', volunteerId)
    .gte('date_of_event', today)
    .order('date_of_event', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ events: data });
});

volunteersRouter.get('/:volunteerId/events/past', async (req, res) => {
  const volunteerId = await assertOwnVolunteer(req, res);
  if (volunteerId === null) return;
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await adminClient
    .from('event')
    .select(EVENT_SELECT)
    .eq('volunteer_id', volunteerId)
    .lt('date_of_event', today)
    .order('date_of_event', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ events: data });
});

volunteersRouter.patch('/:volunteerId/onboarding', async (req, res) => {
  const volunteerId = await assertOwnVolunteer(req, res);
  if (volunteerId === null) return;

  const { zip_code, preferred_event_type, availability } = req.body ?? {};
  if (!zip_code || !preferred_event_type || !availability) {
    return res.status(400).json({ error: 'zip_code, preferred_event_type, and availability are all required.' });
  }
  if (!AVAILABILITY_OPTIONS.includes(availability)) {
    return res.status(400).json({ error: `availability must be one of: ${AVAILABILITY_OPTIONS.join(', ')}` });
  }

  const { data, error } = await adminClient
    .from('volunteer')
    .update({ zip_code, preferred_event_type, availability, onboarding_completed: true })
    .eq('volunteer_id', volunteerId)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Volunteer not found.' });

  res.json({
    profile: {
      role: 'volunteer',
      id: data.volunteer_id,
      name: data.name,
      zip_code: data.zip_code,
      email: data.email,
      onboarding_completed: data.onboarding_completed,
      preferred_event_type: data.preferred_event_type,
      availability: data.availability,
    },
  });
});
