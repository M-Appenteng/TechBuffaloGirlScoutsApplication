import { Router } from 'express';
import { adminClient } from '../lib/supabase.js';
import { requireUser } from '../middleware/requireUser.js';
import { requireStaff } from '../middleware/requireStaff.js';
import { resolveVolunteerId } from '../lib/resolveVolunteerId.js';

export const eventsRouter = Router();
eventsRouter.use(requireUser);

// Postgres folds unquoted CREATE TABLE names to lowercase, so the real table is `event`/`school`.
// Alias the embeds back to SCHOOL/VOLUNTEER so the JSON shape stays stable.
const EVENT_SELECT = '*, SCHOOL:school(school_name, street, city_town)';
const MANAGE_SELECT = '*, SCHOOL:school(school_name, street, city_town), VOLUNTEER:volunteer(name)';

const WEEKEND_DAYS = ['Saturday', 'Sunday'];

function matchesAvailability(dayOfWeek: string | null, availability: string | null): boolean {
  if (!availability || availability === 'Both' || !dayOfWeek) return true;
  const isWeekend = WEEKEND_DAYS.includes(dayOfWeek);
  return availability === 'Weekends' ? isWeekend : !isWeekend;
}

eventsRouter.get('/', async (req, res) => {
  const zip = String(req.query.zip ?? '').trim();
  const preferred = String(req.query.preferred ?? '').trim();
  const availability = String(req.query.availability ?? '').trim() || null;
  if (!zip) {
    return res.status(400).json({ error: 'A zip query parameter is required.' });
  }

  const { data, error } = await adminClient
    .from('event')
    .select(EVENT_SELECT)
    .eq('zip_code', zip)
    .eq('status', 'active')
    .is('volunteer_id', null)
    .order('date_of_event', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  // Surface events matching the volunteer's onboarding preferences first, without hiding the rest.
  const score = (e: any) => Number(e.type_of_event === preferred) + Number(matchesAvailability(e.day_of_week, availability));
  const events = preferred || availability ? [...data].sort((a, b) => score(b) - score(a)) : data;

  res.json({ events });
});

// Staff-only: full event list for the manage dashboard, regardless of status or claim.
eventsRouter.get('/manage', requireStaff, async (_req, res) => {
  const { data, error } = await adminClient.from('event').select(MANAGE_SELECT).order('date_of_event', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ events: data });
});

eventsRouter.post('/', requireStaff, async (req, res) => {
  const { school_id, day_of_week, date_of_event, time_of_event, type_of_event, zip_code, notes } = req.body ?? {};
  if (!school_id || !date_of_event || !type_of_event || !zip_code) {
    return res.status(400).json({ error: 'school_id, date_of_event, type_of_event, and zip_code are required.' });
  }

  const { data, error } = await adminClient
    .from('event')
    .insert({
      school_id,
      staff_id: req.staffId,
      day_of_week: day_of_week ?? null,
      date_of_event,
      time_of_event: time_of_event ?? null,
      type_of_event,
      zip_code,
      notes: notes ?? null,
    })
    .select(MANAGE_SELECT)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ event: data });
});

eventsRouter.patch('/:eventId', requireStaff, async (req, res) => {
  const eventId = Number(req.params.eventId);
  const { school_id, day_of_week, date_of_event, time_of_event, type_of_event, zip_code, notes } = req.body ?? {};

  const { data, error } = await adminClient
    .from('event')
    .update({ school_id, day_of_week, date_of_event, time_of_event, type_of_event, zip_code, notes })
    .eq('event_id', eventId)
    .select(MANAGE_SELECT)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Event not found.' });
  res.json({ event: data });
});

eventsRouter.patch('/:eventId/status', requireStaff, async (req, res) => {
  const eventId = Number(req.params.eventId);
  const { status } = req.body ?? {};
  if (status !== 'active' && status !== 'paused') {
    return res.status(400).json({ error: "status must be 'active' or 'paused'." });
  }

  const { data, error } = await adminClient.from('event').update({ status }).eq('event_id', eventId).select(MANAGE_SELECT).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Event not found.' });
  res.json({ event: data });
});

eventsRouter.delete('/:eventId', requireStaff, async (req, res) => {
  const eventId = Number(req.params.eventId);
  const { error } = await adminClient.from('event').delete().eq('event_id', eventId);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

eventsRouter.post('/:eventId/claim', async (req, res) => {
  const eventId = Number(req.params.eventId);
  const volunteerId = await resolveVolunteerId(req);
  if (!volunteerId) return res.status(403).json({ error: 'No volunteer profile is linked to this account.' });

  const { data, error } = await adminClient
    .from('event')
    .update({ volunteer_id: volunteerId })
    .eq('event_id', eventId)
    .is('volunteer_id', null)
    .select(EVENT_SELECT);

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) {
    return res.status(409).json({ error: 'This event was already claimed by someone else.' });
  }

  res.json({ event: data[0] });
});

eventsRouter.post('/:eventId/cancel', async (req, res) => {
  const eventId = Number(req.params.eventId);
  const volunteerId = await resolveVolunteerId(req);
  if (!volunteerId) return res.status(403).json({ error: 'No volunteer profile is linked to this account.' });

  const { data, error } = await adminClient
    .from('event')
    .update({ volunteer_id: null })
    .eq('event_id', eventId)
    .eq('volunteer_id', volunteerId)
    .select(EVENT_SELECT);

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'No matching claimed event found.' });
  }

  res.json({ event: data[0] });
});

eventsRouter.patch('/:eventId/report', async (req, res) => {
  const eventId = Number(req.params.eventId);
  const volunteerId = await resolveVolunteerId(req);
  if (!volunteerId) return res.status(403).json({ error: 'No volunteer profile is linked to this account.' });

  const { report_notes, prospects_count } = req.body ?? {};
  const count = Number(prospects_count);
  if (!Number.isFinite(count) || count < 0) {
    return res.status(400).json({ error: 'prospects_count must be a non-negative number.' });
  }

  const { data, error } = await adminClient
    .from('event')
    .update({ report_notes: report_notes ?? null, prospects_count: count })
    .eq('event_id', eventId)
    .eq('volunteer_id', volunteerId)
    .select(EVENT_SELECT)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'No matching shift found for this account.' });
  res.json({ event: data });
});
