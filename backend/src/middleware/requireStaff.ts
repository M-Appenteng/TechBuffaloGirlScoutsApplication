import type { Request, Response, NextFunction } from 'express';
import { resolveStaffId } from '../lib/resolveStaffId.js';

/** Blocks the request unless the caller is linked to a STAFF row. Attaches staffId for handlers to use. */
export async function requireStaff(req: Request, res: Response, next: NextFunction) {
  const staffId = await resolveStaffId(req);
  if (!staffId) return res.status(403).json({ error: 'Staff access required.' });
  req.staffId = staffId;
  next();
}
