import type { EventRecord } from '../lib/api';

function formatWhen(date: string | null, time: string | null) {
  if (!date) return time || 'Date TBD';
  const parsed = new Date(`${date}T00:00:00`);
  const displayDate = Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return time ? `${displayDate} · ${time}` : displayDate;
}

function formatWhere(event: EventRecord) {
  const parts = [event.SCHOOL?.city_town, event.zip_code].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Location TBD';
}

interface EventCardProps {
  event: EventRecord;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  actionVariant?: 'primary' | 'ghost';
}

export function EventCard({ event, actionLabel, onAction, actionDisabled, actionVariant = 'primary' }: EventCardProps) {
  return (
    <article className="event-card">
      <p className="event-card__eyebrow">{event.SCHOOL?.school_name ?? 'School TBD'}</p>
      <h3 className="event-card__title">{event.type_of_event || 'School Event'}</h3>

      <div className="event-card__row">{formatWhen(event.date_of_event, event.time_of_event)}</div>
      <div className="event-card__row">{formatWhere(event)}</div>

      {actionLabel && (
        <button className={`btn btn--block ${actionVariant === 'ghost' ? 'btn--ghost' : ''}`} onClick={onAction} disabled={actionDisabled}>
          {actionLabel}
        </button>
      )}
    </article>
  );
}
