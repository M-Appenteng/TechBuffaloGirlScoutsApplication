import { Router } from 'express';
import { adminClient } from '../lib/supabase.js';
import { requireUser } from '../middleware/requireUser.js';
import { requireStaff } from '../middleware/requireStaff.js';

export const schoolsRouter = Router();
schoolsRouter.use(requireUser);

schoolsRouter.get('/', async (_req, res) => {
  const { data, error } = await adminClient.from('school').select('school_id, school_name, street, city_town, zip_code').order('school_name');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ schools: data });
});

schoolsRouter.post('/', requireStaff, async (req, res) => {
  const { school_name, street, city_town, zip_code } = req.body ?? {};
  if (!school_name || !zip_code) {
    return res.status(400).json({ error: 'school_name and zip_code are required.' });
  }

  // Schools reference a zip which references a single default SU/county for this lean, single-troop-area tool.
  await adminClient.from('zipcodes').upsert({ zip_code }, { onConflict: 'zip_code' });
  await adminClient.from('county_zipcodes').upsert({ county_name: 'Erie', zip_code }, { onConflict: 'county_name,zip_code' });

  const { data, error } = await adminClient
    .from('school')
    .insert({ su_number: 'SU-01', school_name, street: street ?? null, city_town: city_town ?? null, zip_code })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ school: data });
});
