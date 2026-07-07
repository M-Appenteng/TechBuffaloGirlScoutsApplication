-- Sample data for local/demo use. Run after 001_schema.sql and 002_add_auth_columns.sql.
-- Safe to re-run: it clears its own rows first.

DELETE FROM EVENT;
DELETE FROM VOLUNTEER;
DELETE FROM STAFF;
DELETE FROM SCHOOL;
DELETE FROM SCHOOL_UNIT;
DELETE FROM COUNTY_ZIPCODES;
DELETE FROM COUNTY;
DELETE FROM ZipCodes;

INSERT INTO ZipCodes (zip_code) VALUES ('14201'), ('14202'), ('14203');

INSERT INTO COUNTY (county_name) VALUES ('Erie');

INSERT INTO COUNTY_ZIPCODES (county_name, zip_code) VALUES
  ('Erie', '14201'), ('Erie', '14202'), ('Erie', '14203');

INSERT INTO SCHOOL_UNIT (su_number, county_name) VALUES ('SU-01', 'Erie');

INSERT INTO SCHOOL (school_id, su_number, school_name, street, city_town, zip_code) VALUES
  (1, 'SU-01', 'Discovery School #67', '150 Hoyt St', 'Buffalo', '14201'),
  (2, 'SU-01', 'Frederick Law Olmsted School', '333 Days Park', 'Buffalo', '14202'),
  (3, 'SU-01', 'Buffalo Academy of Science', '1445 Jefferson Ave', 'Buffalo', '14203');

INSERT INTO STAFF (staff_id, name, zip_code, email) VALUES
  (1, 'Kiara Singh', '14202', 'kiara.staff@example.com');

INSERT INTO VOLUNTEER (volunteer_id, name, zip_code, email) VALUES
  (1, 'Jamie Rivera', '14202', 'jamie.volunteer@example.com');

-- Unclaimed events for the Explore search demo
INSERT INTO EVENT (event_id, school_id, staff_id, volunteer_id, day_of_week, date_of_event, time_of_event, type_of_event, zip_code, notes) VALUES
  (1, 1, 1, NULL, 'Tuesday', CURRENT_DATE + INTERVAL '5 day', '4:00 PM - 5:30 PM', 'Recruitment Table', '14201', 'Set up a table in the school lobby during pickup.'),
  (2, 2, 1, NULL, 'Thursday', CURRENT_DATE + INTERVAL '8 day', '3:30 PM - 5:00 PM', 'Info Session', '14202', 'Present troop options to interested families in the library.'),
  (3, 3, 1, NULL, 'Saturday', CURRENT_DATE + INTERVAL '12 day', '10:00 AM - 12:00 PM', 'Community Fair Booth', '14203', 'Staff a booth at the school''s fall community fair.');

-- Already-claimed events for Upcoming / Past demo
INSERT INTO EVENT (event_id, school_id, staff_id, volunteer_id, day_of_week, date_of_event, time_of_event, type_of_event, zip_code, notes) VALUES
  (4, 2, 1, 1, 'Wednesday', CURRENT_DATE + INTERVAL '3 day', '4:00 PM - 5:00 PM', 'Recruitment Table', '14202', 'Bring sign-up sheets and troop flyers.'),
  (5, 1, 1, 1, 'Friday', CURRENT_DATE - INTERVAL '10 day', '3:00 PM - 4:30 PM', 'Info Session', '14201', 'Completed — 6 families signed up.');
