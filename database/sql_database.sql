-- 1. Create COUNTY Table
CREATE TABLE COUNTY (
    county_name VARCHAR(255) NOT NULL,
    CONSTRAINT PK_COUNTY PRIMARY KEY (county_name)
);

-- 2. Create SCHOOL_UNIT Table
CREATE TABLE SCHOOL_UNIT (
    su_number VARCHAR(255) NOT NULL,
    county_name VARCHAR(255) NOT NULL,
    CONSTRAINT PK_SCHOOL_UNIT PRIMARY KEY (su_number),
    CONSTRAINT FK_SCHOOL_UNIT_COUNTY FOREIGN KEY (county_name) 
        REFERENCES COUNTY(county_name) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 3. Create SCHOOL Table
CREATE TABLE SCHOOL (
    school_id INT NOT NULL,
    su_number VARCHAR(255) NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    street VARCHAR(255),
    city_town VARCHAR(255),
    zip_code VARCHAR(20),
    CONSTRAINT PK_SCHOOL PRIMARY KEY (school_id),
    CONSTRAINT FK_SCHOOL_SCHOOL_UNIT FOREIGN KEY (su_number) 
        REFERENCES SCHOOL_UNIT(su_number) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 4. Create STAFF Table
CREATE TABLE STAFF (
    staff_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT PK_STAFF PRIMARY KEY (staff_id)
);

-- 5. Create VOLUNTEER Table
CREATE TABLE VOLUNTEER (
    volunteer_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT PK_VOLUNTEER PRIMARY KEY (volunteer_id)
);

-- 6. Create EVENT Table
CREATE TABLE EVENT (
    event_id INT NOT NULL,
    school_id INT NOT NULL,
    staff_id INT NOT NULL,
    volunteer_id INT, -- Keeps this nullable so an event can exist before a volunteer claims it
    day_of_week VARCHAR(50),
    date_of_event DATE,
    time_of_event VARCHAR(50),
    type_of_event VARCHAR(100),
    notes TEXT,
    CONSTRAINT PK_EVENT PRIMARY KEY (event_id),
    CONSTRAINT FK_EVENT_SCHOOL FOREIGN KEY (school_id) 
        REFERENCES SCHOOL(school_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT FK_EVENT_STAFF FOREIGN KEY (staff_id) 
        REFERENCES STAFF(staff_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT FK_EVENT_VOLUNTEER FOREIGN KEY (volunteer_id) 
        REFERENCES VOLUNTEER(volunteer_id) ON DELETE SET NULL ON UPDATE CASCADE
);
