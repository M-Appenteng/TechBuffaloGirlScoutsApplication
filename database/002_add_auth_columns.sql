-- Links VOLUNTEER and STAFF rows to Supabase Auth users so the app can log people in
-- with an email/password instead of just a numeric id.
-- auth_user_id is filled in automatically on first successful login (matched by email).

ALTER TABLE VOLUNTEER
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE STAFF
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- Explore searches filter EVENT by zip_code and by an unclaimed volunteer_id;
-- index both to keep that query fast as EVENT grows.
CREATE INDEX IF NOT EXISTS idx_event_zip_code ON EVENT(zip_code);
CREATE INDEX IF NOT EXISTS idx_event_volunteer_id ON EVENT(volunteer_id);
