import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeOnboarding } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { EVENT_TYPES } from '../lib/eventTypes';

const EVENT_TYPE_OPTIONS = [
  ...EVENT_TYPES,
  { value: 'Any', label: 'Surprise me — any role', description: "Not sure yet? We'll show you a mix of everything that's open." },
];

const AVAILABILITY_OPTIONS = ['Weekdays', 'Weekends', 'Both'];

export function Onboarding() {
  const { profile, setProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [zip, setZip] = useState(profile?.zip_code ?? '');
  const [preferredEventType, setPreferredEventType] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleZipSubmit(e: FormEvent) {
    e.preventDefault();
    if (!zip.trim()) {
      setError('Please enter a ZIP code.');
      return;
    }
    setError('');
    setStep(1);
  }

  function handleEventTypeChoice(value: string) {
    setPreferredEventType(value);
    setStep(2);
  }

  function toggleExpanded(value: string, e: React.MouseEvent) {
    e.stopPropagation();
    setExpanded((current) => (current === value ? null : value));
  }

  async function handleAvailabilityChoice(value: string) {
    if (!profile) return;
    setSaving(true);
    setError('');
    try {
      const { profile: updated } = await completeOnboarding(profile.id, {
        zip_code: zip.trim(),
        preferred_event_type: preferredEventType,
        availability: value,
      });
      setProfile(updated);
      navigate('/explore');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSaving(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <p className="eyebrow">Step {step + 1} of 3</p>

        {step === 0 && (
          <>
            <h1>What's your ZIP code?</h1>
            <p className="auth-card__subtitle">We'll use this to find events near you.</p>
            <form onSubmit={handleZipSubmit}>
              <label className="field">
                <span>ZIP Code</span>
                <input type="text" inputMode="numeric" value={zip} onChange={(e) => setZip(e.target.value)} autoFocus />
              </label>
              {error && <p className="form-error">{error}</p>}
              <button className="btn btn--block" type="submit">
                Next
              </button>
            </form>
          </>
        )}

        {step === 1 && (
          <>
            <h1>What kind of volunteering interests you?</h1>
            <p className="auth-card__subtitle">Pick one — we'll show these first. Tap "Learn more" if you're not sure what it involves.</p>
            <div className="choice-list">
              {EVENT_TYPE_OPTIONS.map((option) => (
                <div key={option.value} className="choice-item">
                  <div className="choice-item__row">
                    <button className="choice-button" onClick={() => handleEventTypeChoice(option.value)}>
                      {option.label}
                    </button>
                    <button type="button" className="link-button choice-item__learn-more" onClick={(e) => toggleExpanded(option.value, e)}>
                      {expanded === option.value ? 'Hide' : 'Learn more'}
                    </button>
                  </div>
                  {expanded === option.value && <p className="choice-item__description">{option.description}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1>When are you usually free?</h1>
            <p className="auth-card__subtitle">Last question, promise.</p>
            <div className="choice-list">
              {AVAILABILITY_OPTIONS.map((option) => (
                <button key={option} className="choice-button" disabled={saving} onClick={() => handleAvailabilityChoice(option)}>
                  {saving ? 'Saving…' : option}
                </button>
              ))}
            </div>
            {error && <p className="form-error">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
