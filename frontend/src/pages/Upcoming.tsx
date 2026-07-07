import { useEffect, useState } from 'react';
import { cancelEvent, getUpcomingEvents, type EventRecord } from '../lib/api';
import { EventCard } from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

export function Upcoming() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [status, setStatus] = useState('Loading your upcoming shifts…');
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  useEffect(() => {
    if (!profile || profile.role !== 'volunteer') return;
    getUpcomingEvents(profile.id)
      .then(({ events }) => {
        setEvents(events);
        setStatus(events.length === 0 ? 'You have not claimed any upcoming events yet.' : '');
      })
      .catch((err) => setStatus(err instanceof Error ? err.message : 'Something went wrong.'));
  }, [profile]);

  async function handleCancel(eventId: number) {
    if (!profile) return;
    setCancelingId(eventId);
    try {
      await cancelEvent(eventId);
      setEvents((prev) => prev.filter((event) => event.event_id !== eventId));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not update this event.");
    } finally {
      setCancelingId(null);
    }
  }

  return (
    <section className="screen">
      <p className="eyebrow">Upcoming</p>
      <h1 className="hero-title">Your upcoming shifts</h1>

      {profile?.role !== 'volunteer' ? (
        <p className="screen__intro">Staff accounts don't claim shifts — check the Explore tab to see events in your area.</p>
      ) : (
        <>
          {status && <p className="status-message">{status}</p>}
          <div className="event-grid">
            {events.map((event) => (
              <div key={event.event_id}>
                <EventCard
                  event={event}
                  actionLabel={cancelingId === event.event_id ? 'Opening the spot back up…' : "Can't Make It"}
                  actionDisabled={cancelingId === event.event_id}
                  actionVariant="ghost"
                  onAction={() => handleCancel(event.event_id)}
                />
                <p className="event-card__helper">Marking this opens the spot back up for another volunteer.</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
