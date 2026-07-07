export type Role = 'volunteer' | 'staff';

export interface Profile {
  role: Role;
  id: number;
  name: string;
  zip_code: string | null;
  email: string | null;
  onboarding_completed: boolean;
  preferred_event_type: string | null;
  availability: string | null;
}

export interface EventRecord {
  event_id: number;
  school_id?: number;
  day_of_week: string | null;
  date_of_event: string | null;
  time_of_event: string | null;
  type_of_event: string | null;
  zip_code: string | null;
  notes: string | null;
  volunteer_id: number | null;
  status?: 'active' | 'paused';
  report_notes?: string | null;
  prospects_count?: number | null;
  SCHOOL: { school_name: string; street: string | null; city_town: string | null } | null;
  VOLUNTEER?: { name: string } | null;
}

export interface School {
  school_id: number;
  school_name: string;
  street: string | null;
  city_town: string | null;
  zip_code: string;
}

export interface DashboardData {
  impact: { shiftsCompleted: number; prospectsGathered: number; schoolsReached: number; volunteersActive: number };
  totals: { totalEvents: number; filled: number; unfilled: number; paused: number };
  needsAttention: EventRecord[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Set by AuthContext on login/logout so every request below can attach it
// without threading the token through each call site.
let authToken: string | null = localStorage.getItem('gsva.token');

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, { headers, ...options });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return body as T;
}

export function login(email: string, password: string) {
  return request<{ profile: Profile; session: { access_token: string } }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getEventsByZip(zip: string, preferred?: string | null, availability?: string | null) {
  const params = new URLSearchParams({ zip });
  if (preferred) params.set('preferred', preferred);
  if (availability) params.set('availability', availability);
  return request<{ events: EventRecord[] }>(`/api/events?${params.toString()}`);
}

export function completeOnboarding(
  volunteerId: number,
  answers: { zip_code: string; preferred_event_type: string; availability: string },
) {
  return request<{ profile: Profile }>(`/api/volunteers/${volunteerId}/onboarding`, {
    method: 'PATCH',
    body: JSON.stringify(answers),
  });
}

export function claimEvent(eventId: number) {
  return request<{ event: EventRecord }>(`/api/events/${eventId}/claim`, { method: 'POST' });
}

export function cancelEvent(eventId: number) {
  return request<{ event: EventRecord }>(`/api/events/${eventId}/cancel`, { method: 'POST' });
}

export function submitReport(eventId: number, report_notes: string, prospects_count: number) {
  return request<{ event: EventRecord }>(`/api/events/${eventId}/report`, {
    method: 'PATCH',
    body: JSON.stringify({ report_notes, prospects_count }),
  });
}

export function getUpcomingEvents(volunteerId: number) {
  return request<{ events: EventRecord[] }>(`/api/volunteers/${volunteerId}/events/upcoming`);
}

export function getPastEvents(volunteerId: number) {
  return request<{ events: EventRecord[] }>(`/api/volunteers/${volunteerId}/events/past`);
}

// Staff dashboard + management

export function getDashboard() {
  return request<DashboardData>('/api/dashboard');
}

export function getManageEvents() {
  return request<{ events: EventRecord[] }>('/api/events/manage');
}

export function getSchools() {
  return request<{ schools: School[] }>('/api/schools');
}

export function createSchool(school: { school_name: string; street?: string; city_town?: string; zip_code: string }) {
  return request<{ school: School }>('/api/schools', { method: 'POST', body: JSON.stringify(school) });
}

export function createEvent(event: {
  school_id: number;
  day_of_week?: string;
  date_of_event: string;
  time_of_event?: string;
  type_of_event: string;
  zip_code: string;
  notes?: string;
}) {
  return request<{ event: EventRecord }>('/api/events', { method: 'POST', body: JSON.stringify(event) });
}

export function setEventStatus(eventId: number, status: 'active' | 'paused') {
  return request<{ event: EventRecord }>(`/api/events/${eventId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteEvent(eventId: number) {
  return request<void>(`/api/events/${eventId}`, { method: 'DELETE' });
}
