import { useEffect, useState, type FormEvent } from 'react';
import {
  getDashboard,
  getManageEvents,
  getSchools,
  createSchool,
  createEvent,
  setEventStatus,
  deleteEvent,
  type DashboardData,
  type EventRecord,
  type School,
} from '../lib/api';
import { EVENT_TYPES } from '../lib/eventTypes';

function dayOfWeekFor(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [status, setStatus] = useState('Loading…');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddSchool, setShowAddSchool] = useState(false);

  const [schoolId, setSchoolId] = useState('');
  const [eventType, setEventType] = useState(EVENT_TYPES[0].value);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolStreet, setNewSchoolStreet] = useState('');
  const [newSchoolCity, setNewSchoolCity] = useState('');
  const [newSchoolZip, setNewSchoolZip] = useState('');

  function loadAll() {
    Promise.all([getDashboard(), getManageEvents(), getSchools()])
      .then(([dashboard, manage, schoolList]) => {
        setData(dashboard);
        setEvents(manage.events);
        setSchools(schoolList.schools);
        setStatus('');
      })
      .catch((err) => setStatus(err instanceof Error ? err.message : 'Something went wrong.'));
  }

  useEffect(loadAll, []);

  async function handleAddSchool(e: FormEvent) {
    e.preventDefault();
    try {
      const { school } = await createSchool({
        school_name: newSchoolName,
        street: newSchoolStreet,
        city_town: newSchoolCity,
        zip_code: newSchoolZip,
      });
      setSchools((prev) => [...prev, school].sort((a, b) => a.school_name.localeCompare(b.school_name)));
      setSchoolId(String(school.school_id));
      setShowAddSchool(false);
      setNewSchoolName('');
      setNewSchoolStreet('');
      setNewSchoolCity('');
      setNewSchoolZip('');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not add school.');
    }
  }

  async function handleAddEvent(e: FormEvent) {
    e.preventDefault();
    const school = schools.find((s) => s.school_id === Number(schoolId));
    if (!school) {
      setStatus('Pick a school first.');
      return;
    }
    try {
      await createEvent({
        school_id: school.school_id,
        day_of_week: dayOfWeekFor(date),
        date_of_event: date,
        time_of_event: time,
        type_of_event: eventType,
        zip_code: school.zip_code,
        notes,
      });
      setShowAddEvent(false);
      setDate('');
      setTime('');
      setNotes('');
      loadAll();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not create event.');
    }
  }

  async function handleToggleStatus(event: EventRecord) {
    const next = event.status === 'paused' ? 'active' : 'paused';
    try {
      await setEventStatus(event.event_id, next);
      setEvents((prev) => prev.map((e) => (e.event_id === event.event_id ? { ...e, status: next } : e)));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not update event.');
    }
  }

  async function handleDelete(event: EventRecord) {
    if (!confirm('Remove this event for good?')) return;
    try {
      await deleteEvent(event.event_id);
      setEvents((prev) => prev.filter((e) => e.event_id !== event.event_id));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not remove event.');
    }
  }

  return (
    <section className="screen">
      <p className="eyebrow">Dashboard</p>
      <h1 className="hero-title">This season</h1>

      {status && <p className="status-message">{status}</p>}

      {data && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <p className="stat-card__number">{data.impact.shiftsCompleted}</p>
              <p className="stat-card__label">Shifts completed</p>
            </div>
            <div className="stat-card">
              <p className="stat-card__number">{data.impact.prospectsGathered}</p>
              <p className="stat-card__label">Prospects gathered</p>
            </div>
            <div className="stat-card">
              <p className="stat-card__number">{data.impact.schoolsReached}</p>
              <p className="stat-card__label">Schools reached</p>
            </div>
            <div className="stat-card">
              <p className="stat-card__number">{data.impact.volunteersActive}</p>
              <p className="stat-card__label">Active volunteers</p>
            </div>
          </div>

          {data.needsAttention.length > 0 && (
            <div className="needs-attention">
              <h2 className="section-title">Needs a volunteer soon</h2>
              {data.needsAttention.map((event) => (
                <div key={event.event_id} className="needs-attention__row">
                  <span>{event.SCHOOL?.school_name}</span>
                  <span>{event.date_of_event}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="dashboard-actions">
        <button className="btn" onClick={() => setShowAddEvent((v) => !v)}>
          {showAddEvent ? 'Cancel' : '+ Add Event'}
        </button>
      </div>

      {showAddEvent && (
        <form className="manage-form" onSubmit={handleAddEvent}>
          <label className="field">
            <span>School</span>
            <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} required>
              <option value="">Select a school</option>
              {schools.map((s) => (
                <option key={s.school_id} value={s.school_id}>
                  {s.school_name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="link-button" onClick={() => setShowAddSchool((v) => !v)}>
            {showAddSchool ? 'Cancel new school' : '+ Add a new school'}
          </button>

          {showAddSchool && (
            <div className="manage-form__nested">
              <label className="field">
                <span>School name</span>
                <input value={newSchoolName} onChange={(e) => setNewSchoolName(e.target.value)} />
              </label>
              <label className="field">
                <span>Street</span>
                <input value={newSchoolStreet} onChange={(e) => setNewSchoolStreet(e.target.value)} />
              </label>
              <label className="field">
                <span>City</span>
                <input value={newSchoolCity} onChange={(e) => setNewSchoolCity(e.target.value)} />
              </label>
              <label className="field">
                <span>ZIP code</span>
                <input value={newSchoolZip} onChange={(e) => setNewSchoolZip(e.target.value)} />
              </label>
              <button className="btn btn--block" type="button" onClick={handleAddSchool}>
                Save School
              </button>
            </div>
          )}

          <label className="field">
            <span>Event type</span>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="field">
            <span>Time</span>
            <input placeholder="4:00 PM - 5:00 PM" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
          <label className="field">
            <span>Notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </label>
          <button className="btn btn--block" type="submit">
            Create Event
          </button>
        </form>
      )}

      <h2 className="section-title">All events</h2>
      <div className="manage-list">
        {events.map((event) => (
          <div key={event.event_id} className={`manage-row${event.status === 'paused' ? ' manage-row--paused' : ''}`}>
            <div>
              <p className="manage-row__title">{event.type_of_event}</p>
              <p className="manage-row__meta">
                {event.SCHOOL?.school_name} · {event.date_of_event}
              </p>
              <p className="manage-row__meta">{event.VOLUNTEER?.name ? `Volunteer: ${event.VOLUNTEER.name}` : 'Unfilled'}</p>
              {event.status === 'paused' && <p className="manage-row__meta">Paused</p>}
            </div>
            <div className="manage-row__actions">
              <button className="btn btn--ghost" onClick={() => handleToggleStatus(event)}>
                {event.status === 'paused' ? 'Resume' : 'Pause'}
              </button>
              <button className="btn btn--ghost" onClick={() => handleDelete(event)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
