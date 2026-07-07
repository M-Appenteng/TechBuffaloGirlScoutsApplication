import { useState, type FormEvent } from 'react';
import { submitReport, type EventRecord } from '../lib/api';

interface ReportFormProps {
  event: EventRecord;
  onSaved: (event: EventRecord) => void;
}

export function ReportForm({ event, onSaved }: ReportFormProps) {
  const [notes, setNotes] = useState(event.report_notes ?? '');
  const [count, setCount] = useState(event.prospects_count != null ? String(event.prospects_count) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const alreadyReported = event.prospects_count != null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { event: updated } = await submitReport(event.event_id, notes, Number(count) || 0);
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this report.');
    } finally {
      setSaving(false);
    }
  }

  if (alreadyReported) {
    return (
      <div className="report-summary">
        <p className="report-summary__count">{event.prospects_count} prospect{event.prospects_count === 1 ? '' : 's'} gathered</p>
        {event.report_notes && <p className="report-summary__notes">{event.report_notes}</p>}
      </div>
    );
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Prospects gathered</span>
        <input type="number" min="0" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} required />
      </label>
      <label className="field">
        <span>Notes</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="How did it go?" />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn--block" type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Log Results'}
      </button>
    </form>
  );
}
