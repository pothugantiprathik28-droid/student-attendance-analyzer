-- ====================================================================
-- STUDENT ATTENDANCE ANALYZER ULTIMATE - SAMPLE SEED DATA
-- ====================================================================
USE attendance_db;

-- --------------------------------------------------------------------
-- 1. SEED USERS (Admin, Faculty, Students)
-- --------------------------------------------------------------------
INSERT INTO users (id, username, password_hash, role, full_name, email, phone) VALUES
(1, 'admin', 'admin123', 'admin', 'System Administrator', 'admin@university.edu', '+18005550100'),
(2, 'FAC101', 'faculty123', 'faculty', 'Prof. Rajesh Sharma', 'sharma@university.edu', '+18005550201'),
(3, 'FAC102', 'faculty123', 'faculty', 'Dr. Sunita Rao', 'rao@university.edu', '+18005550202'),
(4, 'FAC103', 'faculty123', 'faculty', 'Dr. Anita Verma', 'verma@university.edu', '+18005550203'),
(5, '101', 'student123', 'student', 'Alice Smith', 'alice@university.edu', '+18005550101'),
(6, '102', 'student123', 'student', 'Bob Jones', 'bob@university.edu', '+18005550102'),
(7, '103', 'student123', 'student', 'Charlie Brown', 'charlie@university.edu', '+18005550103'),
(8, '104', 'student123', 'student', 'Diana Prince', 'diana@university.edu', '+18005550104'),
(9, '105', 'student123', 'student', 'Evan Wright', 'evan@university.edu', '+18005550105'),
(10, '106', 'student123', 'student', 'Fiona Gallagher', 'fiona@university.edu', '+18005550106'),
(11, '107', 'student123', 'student', 'George Clark', 'george@university.edu', '+18005550107'),
(12, '108', 'student123', 'student', 'Hannah Abbott', 'hannah@university.edu', '+18005550108')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- --------------------------------------------------------------------
-- 2. SEED SUBJECTS
-- --------------------------------------------------------------------
INSERT INTO subjects (code, name, department, credits, semester, min_threshold, description) VALUES
('CS101', 'Set Theory & Digital Logic', 'Computer Science', 4, 1, 75, 'Fundamental set theory, Boolean algebra, relations, and digital logic circuits.'),
('CS102', 'Data Structures & Algorithms', 'Computer Science', 4, 1, 75, 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs and sorting algorithms.'),
('EC201', 'Digital Electronics & Microprocessors', 'Electronics', 3, 1, 75, 'Combinational logic, sequential state machines, and 8086 microprocessors.'),
('MA201', 'Discrete Mathematics & Graph Theory', 'Mathematics', 4, 1, 75, 'Combinatorics, recurrences, graph theory, and proof techniques.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- --------------------------------------------------------------------
-- 3. SEED FACULTY
-- --------------------------------------------------------------------
INSERT INTO faculty (faculty_id, user_id, full_name, department, designation, email, phone, office_room) VALUES
('FAC101', 2, 'Prof. Rajesh Sharma', 'Computer Science', 'Professor & HOD', 'sharma@university.edu', '+18005550201', 'Tech Block 401'),
('FAC102', 3, 'Dr. Sunita Rao', 'Electronics', 'Associate Professor', 'rao@university.edu', '+18005550202', 'ECE Block 205'),
('FAC103', 4, 'Dr. Anita Verma', 'Mathematics', 'Assistant Professor', 'verma@university.edu', '+18005550203', 'Science Block 112')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- --------------------------------------------------------------------
-- 4. SEED FACULTY ASSIGNMENTS (FACULTY SEES ONLY THEIR ASSIGNED SUBJECTS)
-- --------------------------------------------------------------------
-- Prof. Rajesh Sharma teaches CS101 and CS102
-- Dr. Sunita Rao teaches EC201
-- Dr. Anita Verma teaches MA201
INSERT INTO faculty_assignments (faculty_id, subject_code, section, academic_year, semester) VALUES
('FAC101', 'CS101', 'A', '2025-2026', 1),
('FAC101', 'CS102', 'A', '2025-2026', 1),
('FAC102', 'EC201', 'A', '2025-2026', 1),
('FAC103', 'MA201', 'A', '2025-2026', 1)
ON DUPLICATE KEY UPDATE section=VALUES(section);

-- --------------------------------------------------------------------
-- 5. SEED STUDENTS
-- --------------------------------------------------------------------
INSERT INTO students (roll_number, user_id, full_name, department, section, semester, email, phone, admission_year) VALUES
('101', 5, 'Alice Smith', 'Computer Science', 'A', 1, 'alice@university.edu', '+18005550101', 2024),
('102', 6, 'Bob Jones', 'Computer Science', 'A', 1, 'bob@university.edu', '+18005550102', 2024),
('103', 7, 'Charlie Brown', 'Computer Science', 'A', 1, 'charlie@university.edu', '+18005550103', 2024),
('104', 8, 'Diana Prince', 'Computer Science', 'A', 1, 'diana@university.edu', '+18005550104', 2024),
('105', 9, 'Evan Wright', 'Computer Science', 'A', 1, 'evan@university.edu', '+18005550105', 2024),
('106', 10, 'Fiona Gallagher', 'Computer Science', 'A', 1, 'fiona@university.edu', '+18005550106', 2024),
('107', 11, 'George Clark', 'Computer Science', 'A', 1, 'george@university.edu', '+18005550107', 2024),
('108', 12, 'Hannah Abbott', 'Computer Science', 'A', 1, 'hannah@university.edu', '+18005550108', 2024)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- --------------------------------------------------------------------
-- 6. SEED ATTENDANCE SESSIONS & RECORDS
-- --------------------------------------------------------------------
-- CS101 Sessions (Conducted by FAC101)
INSERT INTO attendance_sessions (id, subject_code, faculty_id, session_date, period_slot, room_no, topic_covered) VALUES
(1, 'CS101', 'FAC101', '2026-09-01', 'Period 1 (09:00 - 10:00)', 'Room 301', 'Set Theory Basics, Universal Sets & Subsets'),
(2, 'CS101', 'FAC101', '2026-09-02', 'Period 1 (09:00 - 10:00)', 'Room 301', 'Union, Intersection and Difference Operations'),
(3, 'CS101', 'FAC101', '2026-09-03', 'Period 1 (09:00 - 10:00)', 'Room 301', 'De Morgan Laws and Venn Diagrams'),
(4, 'CS101', 'FAC101', '2026-09-04', 'Period 1 (09:00 - 10:00)', 'Room 301', 'Cartesian Product and Power Sets'),
(5, 'CS101', 'FAC101', '2026-09-05', 'Period 1 (09:00 - 10:00)', 'Room 301', 'Equivalence Relations and Partitions'),
-- CS102 Sessions (Conducted by FAC101)
(6, 'CS102', 'FAC101', '2026-09-01', 'Period 2 (10:00 - 11:00)', 'Lab 2', 'Array representation and Time Complexity'),
(7, 'CS102', 'FAC101', '2026-09-02', 'Period 2 (10:00 - 11:00)', 'Lab 2', 'Singly Linked List Insertion & Deletion'),
(8, 'CS102', 'FAC101', '2026-09-03', 'Period 2 (10:00 - 11:00)', 'Lab 2', 'Doubly and Circular Linked Lists'),
(9, 'CS102', 'FAC101', '2026-09-04', 'Period 2 (10:00 - 11:00)', 'Lab 2', 'Stack ADT and Infix to Postfix'),
-- EC201 Sessions (Conducted by FAC102)
(10, 'EC201', 'FAC102', '2026-09-01', 'Period 3 (11:15 - 12:15)', 'Room 204', 'Logic Gates and Karnaugh Maps'),
(11, 'EC201', 'FAC102', '2026-09-02', 'Period 3 (11:15 - 12:15)', 'Room 204', 'Multiplexers & Decoders'),
(12, 'EC201', 'FAC102', '2026-09-03', 'Period 3 (11:15 - 12:15)', 'Room 204', 'Flip-Flops: SR, JK, D, T'),
(13, 'EC201', 'FAC102', '2026-09-04', 'Period 3 (11:15 - 12:15)', 'Room 204', 'Synchronous Counters'),
-- MA201 Sessions (Conducted by FAC103)
(14, 'MA201', 'FAC103', '2026-09-01', 'Period 4 (13:15 - 14:15)', 'Room 105', 'Propositional Logic & Truth Tables'),
(15, 'MA201', 'FAC103', '2026-09-02', 'Period 4 (13:15 - 14:15)', 'Room 105', 'Predicates and Quantifiers'),
(16, 'MA201', 'FAC103', '2026-09-03', 'Period 4 (13:15 - 14:15)', 'Room 105', 'Mathematical Induction & Well Ordering'),
(17, 'MA201', 'FAC103', '2026-09-04', 'Period 4 (13:15 - 14:15)', 'Room 105', 'Pigeonhole Principle and Counting')
ON DUPLICATE KEY UPDATE topic_covered=VALUES(topic_covered);

-- --------------------------------------------------------------------
-- Attendance Records:
-- Alice (101): Present in almost all (High Attendance: ~90%)
-- Bob (102): Misses multiple classes (Shortage Warning: ~65%)
-- Charlie (103): Borderline (~70%)
-- Diana (104): 100% Present
-- Evan (105): Critical Shortage (~50%)
-- --------------------------------------------------------------------
INSERT INTO attendance_records (session_id, student_id, subject_code, attendance_date, status, marked_by) VALUES
-- CS101 - Session 1
(1, '101', 'CS101', '2026-09-01', 'Present', 'FAC101'),
(1, '102', 'CS101', '2026-09-01', 'Absent', 'FAC101'),
(1, '103', 'CS101', '2026-09-01', 'Present', 'FAC101'),
(1, '104', 'CS101', '2026-09-01', 'Present', 'FAC101'),
(1, '105', 'CS101', '2026-09-01', 'Absent', 'FAC101'),
(1, '106', 'CS101', '2026-09-01', 'Present', 'FAC101'),
(1, '107', 'CS101', '2026-09-01', 'Present', 'FAC101'),
(1, '108', 'CS101', '2026-09-01', 'Present', 'FAC101'),
-- CS101 - Session 2
(2, '101', 'CS101', '2026-09-02', 'Present', 'FAC101'),
(2, '102', 'CS101', '2026-09-02', 'Present', 'FAC101'),
(2, '103', 'CS101', '2026-09-02', 'Absent', 'FAC101'),
(2, '104', 'CS101', '2026-09-02', 'Present', 'FAC101'),
(2, '105', 'CS101', '2026-09-02', 'Absent', 'FAC101'),
(2, '106', 'CS101', '2026-09-02', 'Present', 'FAC101'),
(2, '107', 'CS101', '2026-09-02', 'Absent', 'FAC101'),
(2, '108', 'CS101', '2026-09-02', 'Present', 'FAC101'),
-- CS101 - Session 3
(3, '101', 'CS101', '2026-09-03', 'Present', 'FAC101'),
(3, '102', 'CS101', '2026-09-03', 'Absent', 'FAC101'),
(3, '103', 'CS101', '2026-09-03', 'Present', 'FAC101'),
(3, '104', 'CS101', '2026-09-03', 'Present', 'FAC101'),
(3, '105', 'CS101', '2026-09-03', 'Present', 'FAC101'),
(3, '106', 'CS101', '2026-09-03', 'Present', 'FAC101'),
(3, '107', 'CS101', '2026-09-03', 'Present', 'FAC101'),
(3, '108', 'CS101', '2026-09-03', 'Present', 'FAC101'),
-- CS101 - Session 4
(4, '101', 'CS101', '2026-09-04', 'Present', 'FAC101'),
(4, '102', 'CS101', '2026-09-04', 'Present', 'FAC101'),
(4, '103', 'CS101', '2026-09-04', 'Absent', 'FAC101'),
(4, '104', 'CS101', '2026-09-04', 'Present', 'FAC101'),
(4, '105', 'CS101', '2026-09-04', 'Absent', 'FAC101'),
(4, '106', 'CS101', '2026-09-04', 'Absent', 'FAC101'),
(4, '107', 'CS101', '2026-09-04', 'Present', 'FAC101'),
(4, '108', 'CS101', '2026-09-04', 'Present', 'FAC101'),
-- CS101 - Session 5
(5, '101', 'CS101', '2026-09-05', 'Present', 'FAC101'),
(5, '102', 'CS101', '2026-09-05', 'Absent', 'FAC101'),
(5, '103', 'CS101', '2026-09-05', 'Present', 'FAC101'),
(5, '104', 'CS101', '2026-09-05', 'Present', 'FAC101'),
(5, '105', 'CS101', '2026-09-05', 'Absent', 'FAC101'),
(5, '106', 'CS101', '2026-09-05', 'Present', 'FAC101'),
(5, '107', 'CS101', '2026-09-05', 'Present', 'FAC101'),
(5, '108', 'CS101', '2026-09-05', 'Present', 'FAC101'),
-- CS102 - Sessions
(6, '101', 'CS102', '2026-09-01', 'Present', 'FAC101'),
(6, '102', 'CS102', '2026-09-01', 'Present', 'FAC101'),
(6, '103', 'CS102', '2026-09-01', 'Present', 'FAC101'),
(6, '104', 'CS102', '2026-09-01', 'Present', 'FAC101'),
(6, '105', 'CS102', '2026-09-01', 'Absent', 'FAC101'),
(7, '101', 'CS102', '2026-09-02', 'Present', 'FAC101'),
(7, '102', 'CS102', '2026-09-02', 'Absent', 'FAC101'),
(7, '103', 'CS102', '2026-09-02', 'Absent', 'FAC101'),
(7, '104', 'CS102', '2026-09-02', 'Present', 'FAC101'),
(7, '105', 'CS102', '2026-09-02', 'Absent', 'FAC101'),
(8, '101', 'CS102', '2026-09-03', 'Present', 'FAC101'),
(8, '102', 'CS102', '2026-09-03', 'Absent', 'FAC101'),
(8, '103', 'CS102', '2026-09-03', 'Present', 'FAC101'),
(8, '104', 'CS102', '2026-09-03', 'Present', 'FAC101'),
(8, '105', 'CS102', '2026-09-03', 'Present', 'FAC101'),
(9, '101', 'CS102', '2026-09-04', 'Present', 'FAC101'),
(9, '102', 'CS102', '2026-09-04', 'Absent', 'FAC101'),
(9, '103', 'CS102', '2026-09-04', 'Absent', 'FAC101'),
(9, '104', 'CS102', '2026-09-04', 'Present', 'FAC101'),
(9, '105', 'CS102', '2026-09-04', 'Absent', 'FAC101'),
-- EC201 Sessions
(10, '101', 'EC201', '2026-09-01', 'Present', 'FAC102'),
(10, '102', 'EC201', '2026-09-01', 'Present', 'FAC102'),
(10, '103', 'EC201', '2026-09-01', 'Present', 'FAC102'),
(10, '104', 'EC201', '2026-09-01', 'Present', 'FAC102'),
(10, '105', 'EC201', '2026-09-01', 'Absent', 'FAC102'),
(11, '101', 'EC201', '2026-09-02', 'Present', 'FAC102'),
(11, '102', 'EC201', '2026-09-02', 'Absent', 'FAC102'),
(11, '103', 'EC201', '2026-09-02', 'Present', 'FAC102'),
(11, '104', 'EC201', '2026-09-02', 'Present', 'FAC102'),
(11, '105', 'EC201', '2026-09-02', 'Absent', 'FAC102'),
(12, '101', 'EC201', '2026-09-03', 'Absent', 'FAC102'),
(12, '102', 'EC201', '2026-09-03', 'Present', 'FAC102'),
(12, '103', 'EC201', '2026-09-03', 'Absent', 'FAC102'),
(12, '104', 'EC201', '2026-09-03', 'Present', 'FAC102'),
(12, '105', 'EC201', '2026-09-03', 'Present', 'FAC102'),
(13, '101', 'EC201', '2026-09-04', 'Present', 'FAC102'),
(13, '102', 'EC201', '2026-09-04', 'Absent', 'FAC102'),
(13, '103', 'EC201', '2026-09-04', 'Present', 'FAC102'),
(13, '104', 'EC201', '2026-09-04', 'Present', 'FAC102'),
(13, '105', 'EC201', '2026-09-04', 'Absent', 'FAC102'),
-- MA201 Sessions
(14, '101', 'MA201', '2026-09-01', 'Present', 'FAC103'),
(14, '102', 'MA201', '2026-09-01', 'Absent', 'FAC103'),
(14, '103', 'MA201', '2026-09-01', 'Present', 'FAC103'),
(14, '104', 'MA201', '2026-09-01', 'Present', 'FAC103'),
(14, '105', 'MA201', '2026-09-01', 'Absent', 'FAC103'),
(15, '101', 'MA201', '2026-09-02', 'Present', 'FAC103'),
(15, '102', 'MA201', '2026-09-02', 'Present', 'FAC103'),
(15, '103', 'MA201', '2026-09-02', 'Absent', 'FAC103'),
(15, '104', 'MA201', '2026-09-02', 'Present', 'FAC103'),
(15, '105', 'MA201', '2026-09-02', 'Absent', 'FAC103'),
(16, '101', 'MA201', '2026-09-03', 'Present', 'FAC103'),
(16, '102', 'MA201', '2026-09-03', 'Absent', 'FAC103'),
(16, '103', 'MA201', '2026-09-03', 'Present', 'FAC103'),
(16, '104', 'MA201', '2026-09-03', 'Present', 'FAC103'),
(16, '105', 'MA201', '2026-09-03', 'Absent', 'FAC103'),
(17, '101', 'MA201', '2026-09-04', 'Present', 'FAC103'),
(17, '102', 'MA201', '2026-09-04', 'Absent', 'FAC103'),
(17, '103', 'MA201', '2026-09-04', 'Absent', 'FAC103'),
(17, '104', 'MA201', '2026-09-04', 'Present', 'FAC103'),
(17, '105', 'MA201', '2026-09-04', 'Absent', 'FAC103')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- --------------------------------------------------------------------
-- 7. SEED ATTENDANCE EDITS (With Mandatory Reasons)
-- --------------------------------------------------------------------
INSERT INTO attendance_edits (attendance_record_id, student_id, subject_code, session_date, old_status, new_status, reason, edited_by_faculty_id) VALUES
(2, '102', 'CS101', '2026-09-02', 'Absent', 'Present', 'Student presented certified medical discharge slip approved by University Medical Officer', 'FAC101'),
(11, '102', 'EC201', '2026-09-02', 'Absent', 'Leave', 'Official On-Duty letter presented for Inter-Collegiate Coding Hackathon participation', 'FAC102');

-- --------------------------------------------------------------------
-- 8. SEED LEAVES
-- --------------------------------------------------------------------
INSERT INTO leaves (id, student_id, subject_code, start_date, end_date, leave_type, reason, status, applied_at, reviewed_by, review_comment) VALUES
(1, '102', 'CS101', '2026-09-05', '2026-09-06', 'Medical', 'Severe viral fever and throat infection. Doctor advised 2 days bed rest.', 'Pending', '2026-09-04 18:30:00', NULL, NULL),
(2, '101', 'CS102', '2026-09-02', '2026-09-02', 'On Duty', 'Represented the university at Regional Inter-Collegiate Math Olympiad.', 'Approved', '2026-09-01 10:15:00', 'FAC101', 'Approved per Dean Academic notification #402.'),
(3, '105', 'MA201', '2026-09-03', '2026-09-04', 'Personal', 'Family function out of town.', 'Rejected', '2026-09-02 14:00:00', 'FAC103', 'Attendance already critically low (under 60%). Casual leaves cannot be sanctioned.')
ON DUPLICATE KEY UPDATE reason=VALUES(reason);

-- --------------------------------------------------------------------
-- 9. SEED TIMETABLE
-- --------------------------------------------------------------------
INSERT INTO timetable (day_of_week, period_number, start_time, end_time, subject_code, faculty_id, room, section) VALUES
('Monday', 1, '09:00:00', '10:00:00', 'CS101', 'FAC101', 'Room 301', 'A'),
('Monday', 2, '10:00:00', '11:00:00', 'CS102', 'FAC101', 'Lab 2', 'A'),
('Monday', 3, '11:15:00', '12:15:00', 'EC201', 'FAC102', 'Room 204', 'A'),
('Monday', 4, '13:15:00', '14:15:00', 'MA201', 'FAC103', 'Room 105', 'A'),
('Tuesday', 1, '09:00:00', '10:00:00', 'MA201', 'FAC103', 'Room 105', 'A'),
('Tuesday', 2, '10:00:00', '11:00:00', 'CS101', 'FAC101', 'Room 301', 'A'),
('Tuesday', 3, '11:15:00', '12:15:00', 'EC201', 'FAC102', 'Room 204', 'A'),
('Tuesday', 4, '13:15:00', '14:15:00', 'CS102', 'FAC101', 'Lab 2', 'A'),
('Wednesday', 1, '09:00:00', '10:00:00', 'CS102', 'FAC101', 'Lab 2', 'A'),
('Wednesday', 2, '10:00:00', '11:00:00', 'EC201', 'FAC102', 'Room 204', 'A'),
('Wednesday', 3, '11:15:00', '12:15:00', 'CS101', 'FAC101', 'Room 301', 'A'),
('Wednesday', 4, '13:15:00', '14:15:00', 'MA201', 'FAC103', 'Room 105', 'A'),
('Thursday', 1, '09:00:00', '10:00:00', 'EC201', 'FAC102', 'Room 204', 'A'),
('Thursday', 2, '10:00:00', '11:00:00', 'MA201', 'FAC103', 'Room 105', 'A'),
('Thursday', 3, '11:15:00', '12:15:00', 'CS102', 'FAC101', 'Lab 2', 'A'),
('Thursday', 4, '13:15:00', '14:15:00', 'CS101', 'FAC101', 'Room 301', 'A'),
('Friday', 1, '09:00:00', '10:00:00', 'CS101', 'FAC101', 'Room 301', 'A'),
('Friday', 2, '10:00:00', '11:00:00', 'CS102', 'FAC101', 'Lab 2', 'A'),
('Friday', 3, '11:15:00', '12:15:00', 'EC201', 'FAC102', 'Room 204', 'A'),
('Friday', 4, '13:15:00', '14:15:00', 'MA201', 'FAC103', 'Room 105', 'A')
ON DUPLICATE KEY UPDATE room=VALUES(room);

-- --------------------------------------------------------------------
-- 10. SEED AUDIT LOGS
-- --------------------------------------------------------------------
INSERT INTO audit_logs (event_type, details, user_role, user_name, ip_address) VALUES
('SYSTEM_INIT', 'Database schema initialized and seed data successfully populated.', 'admin', 'System Administrator', '127.0.0.1'),
('ATTENDANCE_EDIT', 'Attendance record for Bob Jones (102) updated from Absent to Present. Reason: Medical slip verified.', 'faculty', 'Prof. Rajesh Sharma', '192.168.1.15'),
('LEAVE_APPROVED', 'Leave application #2 for Alice Smith (101) approved for Math Olympiad duty.', 'faculty', 'Prof. Rajesh Sharma', '192.168.1.15');
