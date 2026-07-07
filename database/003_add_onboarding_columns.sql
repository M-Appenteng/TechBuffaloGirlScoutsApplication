-- Powers the 3-question onboarding flow and lets Explore prioritize events that
-- match what a volunteer said they're interested in.

ALTER TABLE VOLUNTEER
    ADD COLUMN IF NOT EXISTS preferred_event_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS availability VARCHAR(20),
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
