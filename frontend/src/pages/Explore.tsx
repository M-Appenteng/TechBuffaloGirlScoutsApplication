import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { claimEvent, getEventsByZip, type EventRecord } from '../lib/api';
import { SwipeDeck } from '../components/SwipeDeck';
import { useAuth } from '../context/AuthContext';

export function Explore() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const zip = searchParams.get('zip');
  const [zipInput, setZipInput] = useState(zip ?? profile?.zip_code ?? '');
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!zip) {
      setLoaded(false);
      return;
    }
    setStatus('Loading events…');
    setConfirmation('');
    setLoaded(false);
    getEventsByZip(zip, profile?.preferred_event_type, profile?.availability)
      .then(({ events }) => {
        setEvents(events);
        setTotal(events.length);
        setStatus(events.length === 0 ? `No available events found for ZIP ${zip}.` : '');
        setLoaded(true);
      })
      .catch((err) => {
        setStatus(err instanceof Error ? err.message : 'Something went wrong.');
        setLoaded(true);
      });
  }, [zip, profile?.preferred_event_type, profile?.availability]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (!zipInput.trim()) return;
    navigate(`/explore?zip=${encodeURIComponent(zipInput.trim())}`);
  }

  async function handleSignUp(event: EventRecord) {
    if (!profile) return;
    setBusy(true);
    try {
      await claimEvent(event.event_id);
      setEvents((prev) => prev.filter((e) => e.event_id !== event.event_id));
      setConfirmation(`You're signed up for ${event.type_of_event} at ${event.SCHOOL?.school_name}. Find it under Upcoming.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not sign up for this event.');
    } finally {
      setBusy(false);
    }
  }

  function handleSkip(event: EventRecord) {
    setEvents((prev) => prev.filter((e) => e.event_id !== event.event_id));
  }

  const remaining = events.length;

  return (
    <section className="screen">
      <p className="eyebrow">Explore</p>
      <h1 className="hero-title">Find an event near you</h1>
      <p className="screen__intro">Swipe right (or tap Sign Up) to volunteer, swipe left (or tap Skip) to pass.</p>

      <form className="zip-search" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Enter your ZIP code"
          value={zipInput}
          onChange={(e) => setZipInput(e.target.value)}
          aria-label="Search events by ZIP code"
        />
        <button type="submit" className="zip-search__submit">
          Search
        </button>
      </form>

      {confirmation && <p className="confirmation-message">{confirmation}</p>}
      {!zip && <p className="status-message">Enter a ZIP code above to get started.</p>}
      {zip && status && <p className="status-message">{status}</p>}

      {zip && loaded && remaining > 0 && (
        <>
          <p className="result-count">
            <strong>{remaining}</strong> of {total} events near {zip}
          </p>
          <SwipeDeck events={events} onSignUp={handleSignUp} onSkip={handleSkip} busy={busy} />
        </>
      )}
    </section>
  );
}
