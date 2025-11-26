// setup_student_db.js
// One-time setup script for the student_db (PostgreSQL).
// Usage: ensure .env (POSTGRES_USER, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_PASSWORD) is set,
// ensure database 'student_db' exists, then: node setup_student_db.js

// This script is for the one-time setup of the student_db.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Pool } = require('pg'); // We only need the Pool from the 'pg' library

// --- THIS IS THE FIX ---
// Create a direct, temporary connection configuration for this script only.
const studentDbConfig = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: 'student_db', // Connect directly to the target database
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT, 10),
};
// --- END FIX ---


const setupSQL = `
  -- SAFER DROP ORDER (drop children first)
  DROP TABLE IF EXISTS enrollments;
  DROP TABLE IF EXISTS grades;
  DROP TABLE IF EXISTS courses;
  DROP TABLE IF EXISTS instructors;
  DROP TABLE IF EXISTS students;
  DROP TABLE IF EXISTS departments;

  -- Create the departments table
  CREATE TABLE departments (
      department_id SERIAL PRIMARY KEY,
      department_name VARCHAR(100) NOT NULL,
      department_head VARCHAR(100),
      building VARCHAR(50),
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Create the instructors table
  CREATE TABLE instructors (
      instructor_id SERIAL PRIMARY KEY,
      department_id INTEGER REFERENCES departments(department_id),
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20),
      hire_date DATE,
      salary DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Create the students table
  CREATE TABLE students (
      student_id SERIAL PRIMARY KEY,
      department_id INTEGER REFERENCES departments(department_id),
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20),
      date_of_birth DATE,
      enrollment_date DATE,
      gpa DECIMAL(3,2) CHECK (gpa >= 0.00 AND gpa <= 4.00),
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Create the courses table
  CREATE TABLE courses (
      course_id SERIAL PRIMARY KEY,
      department_id INTEGER REFERENCES departments(department_id),
      instructor_id INTEGER REFERENCES instructors(instructor_id),
      course_code VARCHAR(10) NOT NULL,
      course_name VARCHAR(100) NOT NULL,
      credits INTEGER CHECK (credits > 0),
      semester VARCHAR(20),
      year INTEGER,
      max_enrollment INTEGER DEFAULT 30,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Create the enrollments table
  CREATE TABLE enrollments (
      enrollment_id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(student_id),
      course_id INTEGER REFERENCES courses(course_id),
      enrollment_date DATE DEFAULT CURRENT_DATE,
      status VARCHAR(20) DEFAULT 'Enrolled',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, course_id)
  );

  -- Create the grades table
  CREATE TABLE grades (
      grade_id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(student_id),
      course_id INTEGER REFERENCES courses(course_id),
      grade_letter VARCHAR(3),
      grade_points DECIMAL(3,2),
      assignment_type VARCHAR(50),
      date_recorded DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Indexes for performance
  CREATE INDEX idx_students_department ON students(department_id);
  CREATE INDEX idx_courses_department ON courses(department_id);
  CREATE INDEX idx_courses_instructor ON courses(instructor_id);
  CREATE INDEX idx_enrollments_student ON enrollments(student_id);
  CREATE INDEX idx_enrollments_course ON enrollments(course_id);
  CREATE INDEX idx_grades_student ON grades(student_id);
  CREATE INDEX idx_grades_course ON grades(course_id);

  -- Insert sample departments (40 rows)
  INSERT INTO departments (department_name, department_head, building, phone) VALUES
  ('Computer Science', 'Dr. Sarah Johnson', 'Tech Building', '555-0101'),
  ('Mathematics', 'Dr. Michael Chen', 'Science Hall', '555-0102'),
  ('Physics', 'Dr. Emily Rodriguez', 'Science Hall', '555-0103'),
  ('Chemistry', 'Dr. David Thompson', 'Chemistry Lab', '555-0104'),
  ('Biology', 'Dr. Lisa Anderson', 'Life Sciences', '555-0105'),
  ('English Literature', 'Dr. James Wilson', 'Humanities', '555-0106'),
  ('History', 'Dr. Maria Garcia', 'Humanities', '555-0107'),
  ('Psychology', 'Dr. Robert Taylor', 'Social Sciences', '555-0108'),
  ('Sociology', 'Dr. Jennifer Brown', 'Social Sciences', '555-0109'),
  ('Economics', 'Dr. William Davis', 'Business', '555-0110'),
  ('Business Administration', 'Dr. Susan Miller', 'Business', '555-0111'),
  ('Marketing', 'Dr. Thomas Wilson', 'Business', '555-0112'),
  ('Mechanical Engineering', 'Dr. Christopher Lee', 'Engineering', '555-0113'),
  ('Electrical Engineering', 'Dr. Amanda White', 'Engineering', '555-0114'),
  ('Civil Engineering', 'Dr. Kevin Martinez', 'Engineering', '555-0115'),
  ('Art', 'Dr. Rachel Green', 'Arts Building', '555-0116'),
  ('Music', 'Dr. Daniel Clark', 'Arts Building', '555-0117'),
  ('Theater', 'Dr. Jessica Lewis', 'Arts Building', '555-0118'),
  ('Philosophy', 'Dr. Mark Robinson', 'Humanities', '555-0119'),
  ('Political Science', 'Dr. Laura Hall', 'Social Sciences', '555-0120'),
  ('Anthropology', 'Dr. Steven Young', 'Social Sciences', '555-0121'),
  ('Geography', 'Dr. Nancy King', 'Earth Sciences', '555-0122'),
  ('Environmental Science', 'Dr. Paul Wright', 'Earth Sciences', '555-0123'),
  ('Nursing', 'Dr. Carol Adams', 'Health Sciences', '555-0124'),
  ('Pre-Medicine', 'Dr. Brian Nelson', 'Health Sciences', '555-0125'),
  ('Education', 'Dr. Michelle Carter', 'Education', '555-0126'),
  ('Communications', 'Dr. Andrew Mitchell', 'Media Center', '555-0127'),
  ('Journalism', 'Dr. Stephanie Parker', 'Media Center', '555-0128'),
  ('Foreign Languages', 'Dr. Richard Evans', 'Language Center', '555-0129'),
  ('Statistics', 'Dr. Helen Turner', 'Science Hall', '555-0130'),
  ('Architecture', 'Dr. Joseph Phillips', 'Design Building', '555-0131'),
  ('Urban Planning', 'Dr. Karen Campbell', 'Design Building', '555-0132'),
  ('Film Studies', 'Dr. Charles Roberts', 'Media Center', '555-0133'),
  ('Criminology', 'Dr. Barbara Cooper', 'Social Sciences', '555-0134'),
  ('Public Health', 'Dr. Donald Reed', 'Health Sciences', '555-0135'),
  ('International Studies', 'Dr. Linda Bailey', 'Global Center', '555-0136'),
  ('Religious Studies', 'Dr. Gary Howard', 'Humanities', '555-0137'),
  ('Women Studies', 'Dr. Ruth Ward', 'Social Sciences', '555-0138'),
  ('Sports Management', 'Dr. Frank Torres', 'Athletic Center', '555-0139'),
  ('Information Technology', 'Dr. Janet Peterson', 'Tech Building', '555-0140');

  -- Insert sample instructors (40 rows)
  INSERT INTO instructors (department_id, first_name, last_name, email, phone, hire_date, salary) VALUES
  (1, 'Alice', 'Johnson', 'a.johnson@university.edu', '555-1001', '2018-08-15', 75000.00),
  (1, 'Bob', 'Smith', 'b.smith@university.edu', '555-1002', '2019-01-10', 72000.00),
  (2, 'Carol', 'Davis', 'c.davis@university.edu', '555-1003', '2017-09-01', 78000.00),
  (2, 'David', 'Wilson', 'd.wilson@university.edu', '555-1004', '2020-02-15', 70000.00),
  (3, 'Emma', 'Brown', 'e.brown@university.edu', '555-1005', '2016-08-20', 82000.00),
  (3, 'Frank', 'Miller', 'f.miller@university.edu', '555-1006', '2021-01-05', 68000.00),
  (4, 'Grace', 'Taylor', 'g.taylor@university.edu', '555-1007', '2018-03-12', 76000.00),
  (4, 'Henry', 'Anderson', 'h.anderson@university.edu', '555-1008', '2019-07-22', 74000.00),
  (5, 'Ivy', 'Thomas', 'i.thomas@university.edu', '555-1009', '2017-05-30', 79000.00),
  (5, 'Jack', 'Jackson', 'j.jackson@university.edu', '555-1010', '2020-09-14', 71000.00),
  (6, 'Kate', 'White', 'k.white@university.edu', '555-1011', '2015-08-25', 85000.00),
  (6, 'Liam', 'Harris', 'l.harris@university.edu', '555-1012', '2019-11-03', 73000.00),
  (7, 'Maya', 'Martin', 'm.martin@university.edu', '555-1013', '2018-01-18', 77000.00),
  (7, 'Noah', 'Thompson', 'n.thompson@university.edu', '555-1014', '2020-04-07', 69000.00),
  (8, 'Olivia', 'Garcia', 'o.garcia@university.edu', '555-1015', '2017-12-11', 80000.00),
  (8, 'Paul', 'Martinez', 'p.martinez@university.edu', '555-1016', '2019-06-28', 75000.00),
  (9, 'Quinn', 'Robinson', 'q.robinson@university.edu', '555-1017', '2018-10-15', 72000.00),
  (9, 'Ruby', 'Clark', 'r.clark@university.edu', '555-1018', '2020-12-01', 70000.00),
  (10, 'Sam', 'Rodriguez', 's.rodriguez@university.edu', '555-1019', '2016-03-22', 83000.00),
  (10, 'Tina', 'Lewis', 't.lewis@university.edu', '555-1020', '2019-08-17', 74000.00),
  (11, 'Uma', 'Lee', 'u.lee@university.edu', '555-1021', '2018-05-09', 78000.00),
  (11, 'Victor', 'Walker', 'v.walker@university.edu', '555-1022', '2020-10-26', 71000.00),
  (12, 'Wendy', 'Hall', 'w.hall@university.edu', '555-1023', '2017-07-13', 79000.00),
  (12, 'Xavier', 'Allen', 'x.allen@university.edu', '555-1024', '2019-03-05', 73000.00),
  (13, 'Yara', 'Young', 'y.young@university.edu', '555-1025', '2018-11-20', 81000.00),
  (13, 'Zack', 'King', 'z.king@university.edu', '555-1026', '2020-01-14', 72000.00),
  (14, 'Amy', 'Wright', 'a.wright@university.edu', '555-1027', '2017-04-28', 84000.00),
  (14, 'Ben', 'Lopez', 'b.lopez@university.edu', '555-1028', '2019-09-12', 75000.00),
  (15, 'Chloe', 'Hill', 'c.hill@university.edu', '555-1029', '2018-06-03', 77000.00),
  (15, 'Dan', 'Green', 'd.green@university.edu', '555-1030', '2020-11-19', 70000.00),
  (16, 'Elena', 'Adams', 'e.adams@university.edu', '555-1031', '2016-12-07', 82000.00),
  (16, 'Felix', 'Baker', 'f.baker@university.edu', '555-1032', '2019-02-21', 74000.00),
  (17, 'Gina', 'Gonzalez', 'g.gonzalez@university.edu', '555-1033', '2018-08-14', 76000.00),
  (17, 'Hugo', 'Nelson', 'h.nelson@university.edu', '555-1034', '2020-05-08', 72000.00),
  (18, 'Iris', 'Carter', 'i.carter@university.edu', '555-1035', '2017-10-25', 78000.00),
  (18, 'Jake', 'Mitchell', 'j.mitchell@university.edu', '555-1036', '2019-12-16', 71000.00),
  (19, 'Luna', 'Perez', 'l.perez@university.edu', '555-1037', '2018-04-11', 80000.00),
  (19, 'Max', 'Roberts', 'm.roberts@university.edu', '555-1038', '2020-07-29', 73000.00),
  (20, 'Nina', 'Turner', 'n.turner@university.edu', '555-1039', '2017-01-15', 85000.00),
  (20, 'Owen', 'Phillips', 'o.phillips@university.edu', '555-1040', '2019-05-23', 75000.00);

  -- Insert sample students (40 rows)
  INSERT INTO students (department_id, first_name, last_name, email, phone, date_of_birth, enrollment_date, gpa, status) VALUES
  (1, 'Alexander', 'Johnson', 'alex.johnson@student.edu', '555-2001', '2002-03-15', '2020-08-25', 3.85, 'Active'),
  (1, 'Sarah', 'Williams', 'sarah.williams@student.edu', '555-2002', '2001-07-22', '2019-08-25', 3.92, 'Active'),
  (2, 'Michael', 'Brown', 'michael.brown@student.edu', '555-2003', '2002-01-10', '2020-08-25', 3.67, 'Active'),
  (2, 'Emma', 'Davis', 'emma.davis@student.edu', '555-2004', '2001-11-05', '2019-08-25', 3.78, 'Active'),
  (3, 'James', 'Miller', 'james.miller@student.edu', '555-2005', '2002-05-18', '2020-08-25', 3.55, 'Active'),
  (3, 'Olivia', 'Wilson', 'olivia.wilson@student.edu', '555-2006', '2001-09-12', '2019-08-25', 3.89, 'Active'),
  (4, 'William', 'Moore', 'william.moore@student.edu', '555-2007', '2002-02-28', '2020-08-25', 3.72, 'Active'),
  (4, 'Sophia', 'Taylor', 'sophia.taylor@student.edu', '555-2008', '2001-12-03', '2019-08-25', 3.81, 'Active'),
  (5, 'Benjamin', 'Anderson', 'benjamin.anderson@student.edu', '555-2009', '2002-06-14', '2020-08-25', 3.63, 'Active'),
  (5, 'Isabella', 'Thomas', 'isabella.thomas@student.edu', '555-2010', '2001-08-07', '2019-08-25', 3.95, 'Active'),
  (6, 'Lucas', 'Jackson', 'lucas.jackson@student.edu', '555-2011', '2002-04-25', '2020-08-25', 3.76, 'Active'),
  (6, 'Mia', 'White', 'mia.white@student.edu', '555-2012', '2001-10-19', '2019-08-25', 3.88, 'Active'),
  (7, 'Henry', 'Harris', 'henry.harris@student.edu', '555-2013', '2002-01-31', '2020-08-25', 3.69, 'Active'),
  (7, 'Charlotte', 'Martin', 'charlotte.martin@student.edu', '555-2014', '2001-07-16', '2019-08-25', 3.84, 'Active'),
  (8, 'Sebastian', 'Garcia', 'sebastian.garcia@student.edu', '555-2015', '2002-09-08', '2020-08-25', 3.77, 'Active'),
  (8, 'Amelia', 'Rodriguez', 'amelia.rodriguez@student.edu', '555-2016', '2001-05-23', '2019-08-25', 3.91, 'Active'),
  (9, 'Mason', 'Lewis', 'mason.lewis@student.edu', '555-2017', '2002-03-11', '2020-08-25', 3.58, 'Active'),
  (9, 'Harper', 'Lee', 'harper.lee@student.edu', '555-2018', '2001-11-28', '2019-08-25', 3.82, 'Active'),
  (10, 'Ethan', 'Walker', 'ethan.walker@student.edu', '555-2019', '2002-07-04', '2020-08-25', 3.74, 'Active'),
  (10, 'Evelyn', 'Hall', 'evelyn.hall@student.edu', '555-2020', '2001-12-15', '2019-08-25', 3.86, 'Active'),
  (11, 'Alexander', 'Allen', 'alexander.allen@student.edu', '555-2021', '2002-02-17', '2020-08-25', 3.65, 'Active'),
  (11, 'Abigail', 'Young', 'abigail.young@student.edu', '555-2022', '2001-08-30', '2019-08-25', 3.93, 'Active'),
  (12, 'Daniel', 'King', 'daniel.king@student.edu', '555-2023', '2002-05-06', '2020-08-25', 3.71, 'Active'),
  (12, 'Emily', 'Wright', 'emily.wright@student.edu', '555-2024', '2001-09-21', '2019-08-25', 3.79, 'Active'),
  (13, 'Matthew', 'Lopez', 'matthew.lopez@student.edu', '555-2025', '2002-01-18', '2020-08-25', 3.68, 'Active'),
  (13, 'Elizabeth', 'Hill', 'elizabeth.hill@student.edu', '555-2026', '2001-06-09', '2019-08-25', 3.87, 'Active'),
  (14, 'Joseph', 'Green', 'joseph.green@student.edu', '555-2027', '2002-10-13', '2020-08-25', 3.75, 'Active'),
  (14, 'Sofia', 'Adams', 'sofia.adams@student.edu', '555-2028', '2001-04-02', '2019-08-25', 3.90, 'Active'),
  (15, 'David', 'Baker', 'david.baker@student.edu', '555-2029', '2002-08-27', '2020-08-25', 3.62, 'Active'),
  (15, 'Avery', 'Gonzalez', 'avery.gonzalez@student.edu', '555-2030', '2001-12-20', '2019-08-25', 3.83, 'Active'),
  (16, 'Samuel', 'Nelson', 'samuel.nelson@student.edu', '555-2031', '2002-03-05', '2020-08-25', 3.73, 'Active'),
  (16, 'Scarlett', 'Carter', 'scarlett.carter@student.edu', '555-2032', '2001-07-11', '2019-08-25', 3.85, 'Active'),
  (17, 'Jackson', 'Mitchell', 'jackson.mitchell@student.edu', '555-2033', '2002-11-24', '2020-08-25', 3.66, 'Active'),
  (17, 'Grace', 'Perez', 'grace.perez@student.edu', '555-2034', '2001-05-17', '2019-08-25', 3.89, 'Active'),
  (18, 'Luke', 'Roberts', 'luke.roberts@student.edu', '555-2035', '2002-09-03', '2020-08-25', 3.78, 'Active'),
  (18, 'Chloe', 'Turner', 'chloe.turner@student.edu', '555-2036', '2001-01-26', '2019-08-25', 3.94, 'Active'),
  (19, 'Gabriel', 'Phillips', 'gabriel.phillips@student.edu', '555-2037', '2002-06-19', '2020-08-25', 3.70, 'Active'),
  (19, 'Zoey', 'Campbell', 'zoey.campbell@student.edu', '555-2038', '2001-10-14', '2019-08-25', 3.81, 'Active'),
  (20, 'Owen', 'Parker', 'owen.parker@student.edu', '555-2039', '2002-04-08', '2020-08-25', 3.64, 'Active'),
  (20, 'Layla', 'Evans', 'layla.evans@student.edu', '555-2040', '2001-08-22', '2019-08-25', 3.92, 'Active');

  -- Insert sample courses (40 rows)
  INSERT INTO courses (department_id, instructor_id, course_code, course_name, credits, semester, year, max_enrollment) VALUES
  (1, 1, 'CS101', 'Introduction to Programming', 4, 'Fall', 2024, 35),
  (1, 2, 'CS201', 'Data Structures', 4, 'Spring', 2024, 30),
  (2, 3, 'MATH101', 'College Algebra', 3, 'Fall', 2024, 40),
  (2, 4, 'MATH201', 'Calculus I', 4, 'Spring', 2024, 35),
  (3, 5, 'PHYS101', 'General Physics I', 4, 'Fall', 2024, 30),
  (3, 6, 'PHYS201', 'General Physics II', 4, 'Spring', 2024, 30),
  (4, 7, 'CHEM101', 'General Chemistry I', 4, 'Fall', 2024, 25),
  (4, 8, 'CHEM201', 'Organic Chemistry I', 4, 'Spring', 2024, 20),
  (5, 9, 'BIO101', 'Introduction to Biology', 4, 'Fall', 2024, 35),
  (5, 10, 'BIO201', 'Cell Biology', 4, 'Spring', 2024, 25),
  (6, 11, 'ENG101', 'English Composition I', 3, 'Fall', 2024, 25),
  (6, 12, 'ENG201', 'World Literature', 3, 'Spring', 2024, 30),
  (7, 13, 'HIST101', 'World History I', 3, 'Fall', 2024, 35),
  (7, 14, 'HIST201', 'American History', 3, 'Spring', 2024, 30),
  (8, 15, 'PSYC101', 'Introduction to Psychology', 3, 'Fall', 2024, 40),
  (8, 16, 'PSYC201', 'Developmental Psychology', 3, 'Spring', 2024, 25),
  (9, 17, 'SOC101', 'Introduction to Sociology', 3, 'Fall', 2024, 35),
  (9, 18, 'SOC201', 'Social Problems', 3, 'Spring', 2024, 30),
  (10, 19, 'ECON101', 'Principles of Microeconomics', 3, 'Fall', 2024, 40),
  (10, 20, 'ECON201', 'Principles of Macroeconomics', 3, 'Spring', 2024, 35),
  (11, 21, 'BUS101', 'Introduction to Business', 3, 'Fall', 2024, 45),
  (11, 22, 'BUS201', 'Business Management', 3, 'Spring', 2024, 35),
  (12, 23, 'MKT101', 'Principles of Marketing', 3, 'Fall', 2024, 35),
  (12, 24, 'MKT201', 'Digital Marketing', 3, 'Spring', 2024, 30),
  (13, 25, 'ME101', 'Engineering Mechanics', 4, 'Fall', 2024, 25),
  (13, 26, 'ME201', 'Thermodynamics', 4, 'Spring', 2024, 20),
  (14, 27, 'EE101', 'Circuit Analysis', 4, 'Fall', 2024, 25),
  (14, 28, 'EE201', 'Electronics', 4, 'Spring', 2024, 20),
  (15, 29, 'CE101', 'Statics', 4, 'Fall', 2024, 30),
  (15, 30, 'CE201', 'Structural Analysis', 4, 'Spring', 2024, 25),
  (16, 31, 'ART101', 'Drawing Fundamentals', 3, 'Fall', 2024, 20),
  (16, 32, 'ART201', 'Painting Techniques', 3, 'Spring', 2024, 15),
  (17, 33, 'MUS101', 'Music Theory I', 3, 'Fall', 2024, 25),
  (17, 34, 'MUS201', 'Music History', 3, 'Spring', 2024, 30),
  (18, 35, 'THR101', 'Introduction to Theater', 3, 'Fall', 2024, 25),
  (18, 36, 'THR201', 'Acting Techniques', 3, 'Spring', 2024, 20),
  (19, 37, 'PHIL101', 'Introduction to Philosophy', 3, 'Fall', 2024, 30),
  (19, 38, 'PHIL201', 'Ethics', 3, 'Spring', 2024, 25),
  (20, 39, 'POLI101', 'American Government', 3, 'Fall', 2024, 40),
  (20, 40, 'POLI201', 'International Relations', 3, 'Spring', 2024, 35);

  -- Insert sample enrollments (40 rows)
  -- For simplicity each student is enrolled in one course (student_id -> course_id = same id)
  INSERT INTO enrollments (student_id, course_id, enrollment_date, status) VALUES
  (1, 1, '2024-08-20', 'Enrolled'),
  (2, 2, '2024-08-20', 'Enrolled'),
  (3, 3, '2024-08-20', 'Enrolled'),
  (4, 4, '2024-08-20', 'Enrolled'),
  (5, 5, '2024-08-20', 'Enrolled'),
  (6, 6, '2024-08-20', 'Enrolled'),
  (7, 7, '2024-08-20', 'Enrolled'),
  (8, 8, '2024-08-20', 'Enrolled'),
  (9, 9, '2024-08-20', 'Enrolled'),
  (10, 10, '2024-08-20', 'Enrolled'),
  (11, 11, '2024-08-20', 'Enrolled'),
  (12, 12, '2024-08-20', 'Enrolled'),
  (13, 13, '2024-08-20', 'Enrolled'),
  (14, 14, '2024-08-20', 'Enrolled'),
  (15, 15, '2024-08-20', 'Enrolled'),
  (16, 16, '2024-08-20', 'Enrolled'),
  (17, 17, '2024-08-20', 'Enrolled'),
  (18, 18, '2024-08-20', 'Enrolled'),
  (19, 19, '2024-08-20', 'Enrolled'),
  (20, 20, '2024-08-20', 'Enrolled'),
  (21, 21, '2024-08-20', 'Enrolled'),
  (22, 22, '2024-08-20', 'Enrolled'),
  (23, 23, '2024-08-20', 'Enrolled'),
  (24, 24, '2024-08-20', 'Enrolled'),
  (25, 25, '2024-08-20', 'Enrolled'),
  (26, 26, '2024-08-20', 'Enrolled'),
  (27, 27, '2024-08-20', 'Enrolled'),
  (28, 28, '2024-08-20', 'Enrolled'),
  (29, 29, '2024-08-20', 'Enrolled'),
  (30, 30, '2024-08-20', 'Enrolled'),
  (31, 31, '2024-08-20', 'Enrolled'),
  (32, 32, '2024-08-20', 'Enrolled'),
  (33, 33, '2024-08-20', 'Enrolled'),
  (34, 34, '2024-08-20', 'Enrolled'),
  (35, 35, '2024-08-20', 'Enrolled'),
  (36, 36, '2024-08-20', 'Enrolled'),
  (37, 37, '2024-08-20', 'Enrolled'),
  (38, 38, '2024-08-20', 'Enrolled'),
  (39, 39, '2024-08-20', 'Enrolled'),
  (40, 40, '2024-08-20', 'Enrolled');

  -- Insert sample grades (40 rows)
  -- grade_points approximate common GPA mapping (A=4.00, A-=3.70, B+=3.30, B=3.00, B-=2.70, C+=2.30, C=2.00, D=1.00, F=0.00)
  INSERT INTO grades (student_id, course_id, grade_letter, grade_points, assignment_type, date_recorded) VALUES
  (1, 1,  'A',  4.00, 'Final',    '2024-12-15'),
  (2, 2,  'A-', 3.70, 'Final',    '2024-12-15'),
  (3, 3,  'B+', 3.30, 'Final',    '2024-12-15'),
  (4, 4,  'B',  3.00, 'Final',    '2024-12-15'),
  (5, 5,  'A',  4.00, 'Midterm',  '2024-10-15'),
  (6, 6,  'B-', 2.70, 'Midterm',  '2024-10-15'),
  (7, 7,  'C+', 2.30, 'Assignment','2024-09-30'),
  (8, 8,  'A',  4.00, 'Final',    '2024-12-15'),
  (9, 9,  'B+', 3.30, 'Final',    '2024-12-15'),
  (10, 10,'A-', 3.70, 'Final',    '2024-12-15'),
  (11, 11,'B',  3.00, 'Midterm',  '2024-10-15'),
  (12, 12,'A',  4.00, 'Final',    '2024-12-15'),
  (13, 13,'B+', 3.30, 'Assignment','2024-11-05'),
  (14, 14,'A',  4.00, 'Final',    '2024-12-15'),
  (15, 15,'A-', 3.70, 'Final',    '2024-12-15'),
  (16, 16,'B',  3.00, 'Midterm',  '2024-10-15'),
  (17, 17,'C',  2.00, 'Assignment','2024-11-01'),
  (18, 18,'B+', 3.30, 'Final',    '2024-12-15'),
  (19, 19,'A',  4.00, 'Final',    '2024-12-15'),
  (20, 20,'B-', 2.70, 'Midterm',  '2024-10-15'),
  (21, 21,'A',  4.00, 'Final',    '2024-12-15'),
  (22, 22,'A-', 3.70, 'Final',    '2024-12-15'),
  (23, 23,'B+', 3.30, 'Assignment','2024-11-07'),
  (24, 24,'B',  3.00, 'Midterm',  '2024-10-15'),
  (25, 25,'A',  4.00, 'Final',    '2024-12-15'),
  (26, 26,'B',  3.00, 'Final',    '2024-12-15'),
  (27, 27,'C+', 2.30, 'Assignment','2024-11-03'),
  (28, 28,'A',  4.00, 'Final',    '2024-12-15'),
  (29, 29,'B+', 3.30, 'Final',    '2024-12-15'),
  (30, 30,'A-', 3.70, 'Midterm',  '2024-10-15'),
  (31, 31,'B',  3.00, 'Final',    '2024-12-15'),
  (32, 32,'A',  4.00, 'Final',    '2024-12-15'),
  (33, 33,'B+', 3.30, 'Assignment','2024-11-06'),
  (34, 34,'A',  4.00, 'Final',    '2024-12-15'),
  (35, 35,'B-', 2.70, 'Final',    '2024-12-15'),
  (36, 36,'C',  2.00, 'Assignment','2024-11-02'),
  (37, 37,'A',  4.00, 'Final',    '2024-12-15'),
  (38, 38,'B+', 3.30, 'Final',    '2024-12-15'),
  (39, 39,'A-', 3.70, 'Final',    '2024-12-15'),
  (40, 40,'B',  3.00, 'Midterm',  '2024-10-15');
`;
async function setup() {
  console.log('Connecting to the database...');
  const pool = new Pool(studentDbConfig); // <-- IMPORTANT: use student_db
  const client = await pool.connect();
  console.log('Connection successful. Running setup script...');

  try {
    await client.query(setupSQL);
    console.log('✅ Database setup complete. Tables and sample data created.');
  } catch (err) {
    console.error('❌ Error executing setup script:', err.stack);
  } finally {
    client.release(); // Return the client to the pool
    pool.end();       // Close all pool connections
  }
}

setup();