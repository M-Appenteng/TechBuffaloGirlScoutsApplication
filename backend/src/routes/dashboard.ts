import { Router } from 'express';
import { adminClient } from '../lib/supabase.js';
import { requireUser } from '../middleware/requireUser.js';
import { requireStaff } from '../middleware/requireStaff.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireUser, requireStaff);

dashboardRouter.get('/', async (_req, res) => {
  const { data: events, error } = await adminClient.from('event').select('*, SCHOOL:school(school_name)');
  if (error) return res.status(500).json({ error: error.message });

  const today = new Date().toISOString().slice(0, 10);
  const completed = events.filter((e: any) => e.prospects_count !== null);
  const upcoming = events.filter((e: any) => e.date_of_event >= today && e.status === 'active');
  const unfilledSoon = upcoming
    .filter((e: any) => !e.volunteer_id)
    .sort((a: any, b: any) => a.date_of_event.localeCompare(b.date_of_event))
    .slice(0, 5);

  const impact = {
    shiftsCompleted: completed.length,
    prospectsGathered: completed.reduce((sum: number, e: any) => sum + (e.prospects_count ?? 0), 0),
    schoolsReached: new Set(completed.map((e: any) => e.school_id)).size,
    volunteersActive: new Set(events.filter((e: any) => e.volunteer_id).map((e: any) => e.volunteer_id)).size,
  };

  res.json({
    impact,
    totals: {
      totalEvents: events.length,
      filled: events.filter((e: any) => e.volunteer_id).length,
      unfilled: events.filter((e: any) => !e.volunteer_id).length,
      paused: events.filter((e: any) => e.status === 'paused').length,
    },
    needsAttention: unfilledSoon,
  });
});
