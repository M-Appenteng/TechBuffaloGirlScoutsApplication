-- Volunteer Login Querey
SELECT e.*, s.school_name 
FROM EVENT e
JOIN SCHOOL s ON e.school_id = s.school_id
WHERE e.volunteer_id IS NULL 
  AND e.zip_code = (
      SELECT v.zip_code 
      FROM VOLUNTEER v 
      WHERE v.volunteer_id = :logged_in_id
  );

-- Staff Login Querey
SELECT e.*, s.school_name, v.name AS volunteer_name
FROM EVENT e
JOIN SCHOOL s ON e.school_id = s.school_id
LEFT JOIN VOLUNTEER v ON e.volunteer_id = v.volunteer_id
WHERE e.zip_code = (
      SELECT st.zip_code 
      FROM STAFF st 
      WHERE st.staff_id = :logged_in_id
  );
