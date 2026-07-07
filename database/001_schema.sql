-- Drop in reverse dependency order first, so this file can be re-run safely
-- from a clean slate regardless of what partially ran before.
DROP TABLE IF EXISTS EVENT CASCADE;
DROP TABLE IF EXISTS VOLUNTEER CASCADE;
DROP TABLE IF EXISTS STAFF CASCADE;
DROP TABLE IF EXISTS SCHOOL CASCADE;
DROP TABLE IF EXISTS SCHOOL_UNIT CASCADE;
DROP TABLE IF EXISTS COUNTY_ZIPCODES CASCADE;
DROP TABLE IF EXISTS COUNTY CASCADE;
DROP TABLE IF EXISTS ZipCodes CASCADE;

-- 1. Create Base ZipCodes Master Table
CREATE TABLE ZipCodes (
    zip_code VARCHAR(20) NOT NULL, -- Matched to VARCHAR(20) used in SCHOOL
    CONSTRAINT PK_ZipCodes PRIMARY KEY (zip_code)
);

-- 2. Create COUNTY Table
CREATE TABLE COUNTY (
    county_name VARCHAR(255) NOT NULL,
    CONSTRAINT PK_COUNTY PRIMARY KEY (county_name)
);

-- 3. Mapping table for County and Zip Codes (Adjusted for county_name)
CREATE TABLE COUNTY_ZIPCODES (
    county_name VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    CONSTRAINT PK_COUNTY_ZIPCODES PRIMARY KEY (county_name, zip_code),
    CONSTRAINT FK_CZ_COUNTY FOREIGN KEY (county_name) REFERENCES COUNTY(county_name) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT FK_CZ_ZIPCODE FOREIGN KEY (zip_code) REFERENCES ZipCodes(zip_code) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 4. Create SCHOOL_UNIT Table
CREATE TABLE SCHOOL_UNIT (
    su_number VARCHAR(255) NOT NULL,
    county_name VARCHAR(255) NOT NULL,
    CONSTRAINT PK_SCHOOL_UNIT PRIMARY KEY (su_number),
    CONSTRAINT FK_SCHOOL_UNIT_COUNTY FOREIGN KEY (county_name) 
        REFERENCES COUNTY(county_name) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 5. Create SCHOOL Table (Enforced Foreign Key on zip_code)
CREATE TABLE SCHOOL (
    school_id INT NOT NULL,
    su_number VARCHAR(255) NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    street VARCHAR(255),
    city_town VARCHAR(255),
    zip_code VARCHAR(20),
    CONSTRAINT PK_SCHOOL PRIMARY KEY (school_id),
    CONSTRAINT FK_SCHOOL_SCHOOL_UNIT FOREIGN KEY (su_number) 
        REFERENCES SCHOOL_UNIT(su_number) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT FK_SCHOOL_ZIPCODE FOREIGN KEY (zip_code) 
        REFERENCES ZipCodes(zip_code) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 6. Create STAFF Table (Added zip_code reference to attach to Employee ID)
CREATE TABLE STAFF (
    staff_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20), 
    CONSTRAINT PK_STAFF PRIMARY KEY (staff_id),
    CONSTRAINT FK_STAFF_ZIPCODE FOREIGN KEY (zip_code) 
        REFERENCES ZipCodes(zip_code) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 7. Create VOLUNTEER Table (Added zip_code reference to attach to Employee ID)
CREATE TABLE VOLUNTEER (
    volunteer_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20),
    CONSTRAINT PK_VOLUNTEER PRIMARY KEY (volunteer_id),
    CONSTRAINT FK_VOLUNTEER_ZIPCODE FOREIGN KEY (zip_code) 
        REFERENCES ZipCodes(zip_code) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 8. Create EVENT Table (Fixed syntax missing comma before notes)
CREATE TABLE EVENT (
    event_id INT NOT NULL,
    school_id INT NOT NULL,
    staff_id INT NOT NULL,
    volunteer_id INT, 
    day_of_week VARCHAR(50),
    date_of_event DATE,
    time_of_event VARCHAR(50),
    type_of_event VARCHAR(100),
    zip_code VARCHAR(20), -- Directly tracked on the event or inherited from school
    notes TEXT,
    CONSTRAINT PK_EVENT PRIMARY KEY (event_id),
    CONSTRAINT FK_EVENT_SCHOOL FOREIGN KEY (school_id) 
        REFERENCES SCHOOL(school_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT FK_EVENT_STAFF FOREIGN KEY (staff_id) 
        REFERENCES STAFF(staff_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT FK_EVENT_VOLUNTEER FOREIGN KEY (volunteer_id) 
        REFERENCES VOLUNTEER(volunteer_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT FK_EVENT_ZIPCODE FOREIGN KEY (zip_code) 
        REFERENCES ZipCodes(zip_code) ON DELETE RESTRICT ON UPDATE CASCADE
);
