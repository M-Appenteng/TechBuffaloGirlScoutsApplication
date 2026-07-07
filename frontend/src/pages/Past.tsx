import { useEffect, useState } from 'react';
import { getPastEvents, type EventRecord } from '../lib/api';
import { EventCard } from '../components/EventCard';
import { ReportForm } from '../components/ReportForm';
import { useAuth } from '../context/AuthContext';

export function Past() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [status, setStatus] = useState('Loading your event history…');

  useEffect(() => {
    if (!profile || profile.role !== 'volunteer') return;
    getPastEvents(profile.id)
      .then(({ events }) => {
        setEvents(events);
        setStatus(events.length === 0 ? 'Your past volunteer history will appear here.' : '');
      })
      .catch((err) => setStatus(err instanceof Error ? err.message : 'Something went wrong.'));
  }, [profile]);

  function handleSaved(updated: EventRecord) {
    setEvents((prev) => prev.map((e) => (e.event_id === updated.event_id ? updated : e)));
  }

  return (
    <section className="screen">
      <p className="eyebrow">Past</p>
      <h1 className="hero-title">Your volunteer history</h1>

      {profile?.role !== 'volunteer' ? (
        <p className="screen__intro">Staff accounts don't have volunteer history to show here.</p>
      ) : (
        <>
          {status && <p className="status-message">{status}</p>}
          <div className="event-grid">
            {events.map((event) => (
              <div key={event.event_id}>
                <EventCard event={event} />
                <ReportForm event={event} onSaved={handleSaved} />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
