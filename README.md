# Tech Buffalo Girl Scouts Application

A volunteer portal that lets Girl Scout volunteers find, claim, and manage school recruitment events near them by ZIP code.

Backend Development: Kiara Singh

Frontend Development: Melissa Appenteng

Database Development: Tahir Cook

Non-Technical Documentation: Ty Broad

## Structure

```
frontend/   React + Vite + TypeScript single-page app
backend/    Express + TypeScript REST API (owns the Supabase connection)
database/   SQL schema, migrations, and reference queries
```

The frontend never talks to Supabase directly — it calls the backend's REST API, and the backend is the only thing holding Supabase credentials.

## Setup

### 1. Database

Run the SQL files in `database/` against your Supabase project's SQL editor, in order:

1. `001_schema.sql` — core tables (SCHOOL, STAFF, VOLUNTEER, EVENT, etc.)
2. `002_add_auth_columns.sql` — links VOLUNTEER/STAFF rows to Supabase Auth users and adds indexes used by the Explore search
3. `003_add_onboarding_columns.sql` — adds the 3-question onboarding answers (ZIP, preferred event type, availability) to VOLUNTEER
4. `004_add_dashboard_columns.sql` — adds `status` (active/paused), `report_notes`, `prospects_count` to EVENT, and makes event/school ids auto-generate so staff can create rows from the app
5. `seed.sql` (optional) — sample schools, a staff member, a volunteer, and a few events (some claimed, some not) so the UI has something to show right away

`database/queries/` has reference SQL used to design the API's login/lookup queries.

If you ran `seed.sql`, create a matching user in **Supabase Dashboard → Authentication → Users → Add user** with the email `jamie.volunteer@example.com` (any password) to log in as the seeded volunteer. The backend links that auth account to the `VOLUNTEER` row automatically on first login.

### 2. Backend

```
cd backend
cp .env.example .env   # fill in SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, SUPABASE_JWKS_URL
npm install
npm run dev             # http://localhost:4000
```

The backend uses [`@supabase/server`](https://github.com/supabase/server) to verify each request's JWT (via your project's JWKS) and to build two clients per request: an RLS-scoped client for the caller, and an admin client (secret key) for lookups the backend itself needs. Every route except `/api/auth/*` requires a valid `Authorization: Bearer <token>` header — the frontend attaches this automatically once you're signed in.

### 3. Frontend

```
cd frontend
cp .env.example .env    # VITE_API_URL should point at the backend above
npm install
npm run dev              # http://localhost:5173
```

## How login works

Volunteers and staff sign in with the email/password stored in Supabase Auth. On first successful login, the backend links that auth account to the matching `VOLUNTEER`/`STAFF` row by email (via the `auth_user_id` column added in the migration) — so seed data only needs an `email` column filled in, not a pre-existing auth link.

The backend never trusts a volunteer id supplied by the client — every write (claiming an event, canceling a shift, completing onboarding) resolves the caller's own `volunteer_id` server-side from their verified JWT, so one volunteer can't act on another's behalf just by changing a request.

## Volunteer flow

New volunteers land on a 3-question onboarding (ZIP code, preferred event type, availability) right after their first login — it can't be skipped, and it only runs once (`VOLUNTEER.onboarding_completed`). After that, Explore shows a Hinge-style card deck: one event at a time, swipe right or tap **Sign Up** to claim it, swipe left or tap **Skip** to move on (skipping doesn't touch the database — the event just shows up again on a future search). Events matching the volunteer's onboarding preference are sorted to the front of the deck.

Committed events show up under Upcoming with a **Can't Make It** button — canceling clears `volunteer_id` on that event, so it reappears in Explore for someone else to claim.

Once an event's date has passed, its Past card grows a **Log Results** form — prospects gathered plus a short note. That's the one source of truth the staff dashboard's impact numbers are built from.

## Staff flow

Staff sign in to a **Dashboard** tab instead of Explore/Upcoming/Past. It shows:

- **Impact this season**: shifts completed, prospects gathered, schools reached, active volunteers — pulled live from `EVENT`, nothing cached.
- **Needs a volunteer soon**: the next 5 unfilled events, soonest first.
- **All events**: every event with Pause/Remove controls, plus **+ Add Event** (pick a school or add a new one inline, event type, date, time, notes — day of week and the event's ZIP are derived automatically from the date and school).

Pausing an event just flips a `status` flag — it disappears from volunteers' Explore results immediately but stays on the dashboard so staff can resume it later. No developer involvement needed for any of this; it's all driven through the API a staff account already has access to.

### Scope cuts (time-boxed build)

Two things from the objectives were intentionally left out to ship the rest fast and solid:

- **Automatic reminders/notifications** (email or SMS) — would need a delivery provider (SendGrid, Twilio, web push) wired up as new infrastructure. What's in place instead: an immediate on-screen confirmation after signing up, plus Upcoming/Dashboard always reflecting live state when opened.
- **Auto-discovering open houses from school websites** (the stretch goal) — this is a scraping/crawling project on its own; skipped entirely rather than half-built.

## Installing it as an app

The frontend is a PWA built for low-bandwidth, rural use:

- **System fonts only** — no font files to download, no CDN dependency, works the same offline as online.
- **A service worker caches the app shell** — the UI (not live event data) loads instantly even with no connection, and an offline banner tells you clearly when you're disconnected instead of failing silently.
- **Install it**: on Android Chrome, open the site and tap "Add to Home Screen" from the browser menu; on iOS Safari, tap the Share button → "Add to Home Screen". It opens full-screen with its own icon, like a native app.
