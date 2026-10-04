/**
 * Database Connection & Abstraction Module
 * ====================================================================
 * Supports both real MySQL 8.0/5.7 (via mysql2/promise) and an
 * intelligent zero-crash embedded storage engine fallback.
 * 
 * If MySQL is running and accessible via .env credentials, all queries
 * execute directly against MySQL. If MySQL is not running or credentials
 * are not yet initialized, it seamlessly persists to `db_local.json`
 * with identical relational schema structures.
 */

const fs = require('fs');
const path = require('path');

// Try loading dotenv
try {
  require('dotenv').config();
} catch (e) {
  // dotenv optional
}

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'attendance_db';

let pool = null;
let dbMode = 'uninitialized'; // 'mysql' | 'embedded'
let dbError = null;

// Embedded Local Store path
const LOCAL_DB_FILE = path.join(__dirname, 'db_local.json');

// Initial default seed state for embedded store
const defaultStore = {
  users: [
    { id: 1, username: 'admin', password_hash: 'admin123', role: 'admin', full_name: 'System Administrator', email: 'admin@university.edu', phone: '+18005550100' },
    { id: 2, username: 'FAC101', password_hash: 'faculty123', role: 'faculty', full_name: 'Prof. Rajesh Sharma', email: 'sharma@university.edu', phone: '+18005550201' },
    { id: 3, username: 'FAC102', password_hash: 'faculty123', role: 'faculty', full_name: 'Dr. Sunita Rao', email: 'rao@university.edu', phone: '+18005550202' },
    { id: 4, username: 'FAC103', password_hash: 'faculty123', role: 'faculty', full_name: 'Dr. Anita Verma', email: 'verma@university.edu', phone: '+18005550203' },
    { id: 5, username: '101', password_hash: 'student123', role: 'student', full_name: 'Alice Smith', email: 'alice@university.edu', phone: '+18005550101' },
    { id: 6, username: '102', password_hash: 'student123', role: 'student', full_name: 'Bob Jones', email: 'bob@university.edu', phone: '+18005550102' },
    { id: 7, username: '103', password_hash: 'student123', role: 'student', full_name: 'Charlie Brown', email: 'charlie@university.edu', phone: '+18005550103' },
    { id: 8, username: '104', password_hash: 'student123', role: 'student', full_name: 'Diana Prince', email: 'diana@university.edu', phone: '+18005550104' },
    { id: 9, username: '105', password_hash: 'student123', role: 'student', full_name: 'Evan Wright', email: 'evan@university.edu', phone: '+18005550105' },
    { id: 10, username: '106', password_hash: 'student123', role: 'student', full_name: 'Fiona Gallagher', email: 'fiona@university.edu', phone: '+18005550106' },
    { id: 11, username: '107', password_hash: 'student123', role: 'student', full_name: 'George Clark', email: 'george@university.edu', phone: '+18005550107' },
    { id: 12, username: '108', password_hash: 'student123', role: 'student', full_name: 'Hannah Abbott', email: 'hannah@university.edu', phone: '+18005550108' }
  ],
  subjects: [
    { code: 'CS101', name: 'Set Theory & Digital Logic', department: 'Computer Science', credits: 4, semester: 1, min_threshold: 75, faculty_id: 'FAC101', faculty_name: 'Prof. Rajesh Sharma' },
    { code: 'CS102', name: 'Data Structures & Algorithms', department: 'Computer Science', credits: 4, semester: 1, min_threshold: 75, faculty_id: 'FAC101', faculty_name: 'Prof. Rajesh Sharma' },
    { code: 'EC201', name: 'Digital Electronics & Microprocessors', department: 'Electronics', credits: 3, semester: 1, min_threshold: 75, faculty_id: 'FAC102', faculty_name: 'Dr. Sunita Rao' },
    { code: 'MA201', name: 'Discrete Mathematics & Graph Theory', department: 'Mathematics', credits: 4, semester: 1, min_threshold: 75, faculty_id: 'FAC103', faculty_name: 'Dr. Anita Verma' }
  ],
  faculty: [
    { faculty_id: 'FAC101', user_id: 2, full_name: 'Prof. Rajesh Sharma', department: 'Computer Science', designation: 'Professor & HOD', email: 'sharma@university.edu', phone: '+18005550201', office_room: 'Tech Block 401', assigned_subjects: ['CS101', 'CS102'] },
    { faculty_id: 'FAC102', user_id: 3, full_name: 'Dr. Sunita Rao', department: 'Electronics', designation: 'Associate Professor', email: 'rao@university.edu', phone: '+18005550202', office_room: 'ECE Block 205', assigned_subjects: ['EC201'] },
    { faculty_id: 'FAC103', user_id: 4, full_name: 'Dr. Anita Verma', department: 'Mathematics', designation: 'Assistant Professor', email: 'verma@university.edu', phone: '+18005550203', office_room: 'Science Block 112', assigned_subjects: ['MA201'] }
  ],
  faculty_assignments: [
    { id: 1, faculty_id: 'FAC101', subject_code: 'CS101', section: 'A', semester: 1 },
    { id: 2, faculty_id: 'FAC101', subject_code: 'CS102', section: 'A', semester: 1 },
    { id: 3, faculty_id: 'FAC102', subject_code: 'EC201', section: 'A', semester: 1 },
    { id: 4, faculty_id: 'FAC103', subject_code: 'MA201', section: 'A', semester: 1 }
  ],
  students: [
    { roll_number: '101', user_id: 5, full_name: 'Alice Smith', department: 'Computer Science', section: 'A', semester: 1, email: 'alice@university.edu', phone: '+18005550101' },
    { roll_number: '102', user_id: 6, full_name: 'Bob Jones', department: 'Computer Science', section: 'A', semester: 1, email: 'bob@university.edu', phone: '+18005550102' },
    { roll_number: '103', user_id: 7, full_name: 'Charlie Brown', department: 'Computer Science', section: 'A', semester: 1, email: 'charlie@university.edu', phone: '+18005550103' },
    { roll_number: '104', user_id: 8, full_name: 'Diana Prince', department: 'Computer Science', section: 'A', semester: 1, email: 'diana@university.edu', phone: '+18005550104' },
    { roll_number: '105', user_id: 9, full_name: 'Evan Wright', department: 'Computer Science', section: 'A', semester: 1, email: 'evan@university.edu', phone: '+18005550105' },
    { roll_number: '106', user_id: 10, full_name: 'Fiona Gallagher', department: 'Computer Science', section: 'A', semester: 1, email: 'fiona@university.edu', phone: '+18005550106' },
    { roll_number: '107', user_id: 11, full_name: 'George Clark', department: 'Computer Science', section: 'A', semester: 1, email: 'george@university.edu', phone: '+18005550107' },
    { roll_number: '108', user_id: 12, full_name: 'Hannah Abbott', department: 'Computer Science', section: 'A', semester: 1, email: 'hannah@university.edu', phone: '+18005550108' }
  ],
  attendance_sessions: [
    { id: 1, subject_code: 'CS101', faculty_id: 'FAC101', session_date: '2026-09-01', period_slot: 'Period 1 (09:00 - 10:00)', room_no: 'Room 301', topic_covered: 'Set Theory Basics, Universal Sets & Subsets' },
    { id: 2, subject_code: 'CS101', faculty_id: 'FAC101', session_date: '2026-09-02', period_slot: 'Period 1 (09:00 - 10:00)', room_no: 'Room 301', topic_covered: 'Union, Intersection and Difference Operations' },
    { id: 3, subject_code: 'CS101', faculty_id: 'FAC101', session_date: '2026-09-03', period_slot: 'Period 1 (09:00 - 10:00)', room_no: 'Room 301', topic_covered: 'De Morgan Laws and Venn Diagrams' },
    { id: 4, subject_code: 'CS101', faculty_id: 'FAC101', session_date: '2026-09-04', period_slot: 'Period 1 (09:00 - 10:00)', room_no: 'Room 301', topic_covered: 'Cartesian Product and Power Sets' },
    { id: 5, subject_code: 'CS101', faculty_id: 'FAC101', session_date: '2026-09-05', period_slot: 'Period 1 (09:00 - 10:00)', room_no: 'Room 301', topic_covered: 'Equivalence Relations and Partitions' },
    { id: 6, subject_code: 'CS102', faculty_id: 'FAC101', session_date: '2026-09-01', period_slot: 'Period 2 (10:00 - 11:00)', room_no: 'Lab 2', topic_covered: 'Array representation and Time Complexity' },
    { id: 7, subject_code: 'CS102', faculty_id: 'FAC101', session_date: '2026-09-02', period_slot: 'Period 2 (10:00 - 11:00)', room_no: 'Lab 2', topic_covered: 'Singly Linked List Insertion & Deletion' },
    { id: 8, subject_code: 'CS102', faculty_id: 'FAC101', session_date: '2026-09-03', period_slot: 'Period 2 (10:00 - 11:00)', room_no: 'Lab 2', topic_covered: 'Doubly and Circular Linked Lists' },
    { id: 9, subject_code: 'CS102', faculty_id: 'FAC101', session_date: '2026-09-04', period_slot: 'Period 2 (10:00 - 11:00)', room_no: 'Lab 2', topic_covered: 'Stack ADT and Infix to Postfix' },
    { id: 10, subject_code: 'EC201', faculty_id: 'FAC102', session_date: '2026-09-01', period_slot: 'Period 3 (11:15 - 12:15)', room_no: 'Room 204', topic_covered: 'Logic Gates and Karnaugh Maps' },
    { id: 11, subject_code: 'EC201', faculty_id: 'FAC102', session_date: '2026-09-02', period_slot: 'Period 3 (11:15 - 12:15)', room_no: 'Room 204', topic_covered: 'Multiplexers & Decoders' },
    { id: 12, subject_code: 'EC201', faculty_id: 'FAC102', session_date: '2026-09-03', period_slot: 'Period 3 (11:15 - 12:15)', room_no: 'Room 204', topic_covered: 'Flip-Flops: SR, JK, D, T' },
    { id: 13, subject_code: 'EC201', faculty_id: 'FAC102', session_date: '2026-09-04', period_slot: 'Period 3 (11:15 - 12:15)', room_no: 'Room 204', topic_covered: 'Synchronous Counters' },
    { id: 14, subject_code: 'MA201', faculty_id: 'FAC103', session_date: '2026-09-01', period_slot: 'Period 4 (13:15 - 14:15)', room_no: 'Room 105', topic_covered: 'Propositional Logic & Truth Tables' },
    { id: 15, subject_code: 'MA201', faculty_id: 'FAC103', session_date: '2026-09-02', period_slot: 'Period 4 (13:15 - 14:15)', room_no: 'Room 105', topic_covered: 'Predicates and Quantifiers' },
    { id: 16, subject_code: 'MA201', faculty_id: 'FAC103', session_date: '2026-09-03', period_slot: 'Period 4 (13:15 - 14:15)', room_no: 'Room 105', topic_covered: 'Mathematical Induction & Well Ordering' },
    { id: 17, subject_code: 'MA201', faculty_id: 'FAC103', session_date: '2026-09-04', period_slot: 'Period 4 (13:15 - 14:15)', room_no: 'Room 105', topic_covered: 'Pigeonhole Principle and Counting' }
  ],
  attendance_records: [
    // CS101 Session 1 (2026-09-01)
    { id: 1, session_id: 1, student_id: '101', subject_code: 'CS101', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC101' },
    { id: 2, session_id: 1, student_id: '102', subject_code: 'CS101', attendance_date: '2026-09-01', status: 'Absent', marked_by: 'FAC101' },
    { id: 3, session_id: 1, student_id: '103', subject_code: 'CS101', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC101' },
    { id: 4, session_id: 1, student_id: '104', subject_code: 'CS101', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC101' },
    { id: 5, session_id: 1, student_id: '105', subject_code: 'CS101', attendance_date: '2026-09-01', status: 'Absent', marked_by: 'FAC101' },
    { id: 6, session_id: 1, student_id: '106', subject_code: 'CS101', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC101' },
    { id: 7, session_id: 1, student_id: '107', subject_code: 'CS101', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC101' },
    { id: 8, session_id: 1, student_id: '108', subject_code: 'CS101', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC101' },
    // CS101 Session 2 (2026-09-02)
    { id: 9, session_id: 2, student_id: '101', subject_code: 'CS101', attendance_date: '2026-09-02', status: 'Present', marked_by: 'FAC101' },
    { id: 10, session_id: 2, student_id: '102', subject_code: 'CS101', attendance_date: '2026-09-02', status: 'Present', marked_by: 'FAC101' },
    { id: 11, session_id: 2, student_id: '103', subject_code: 'CS101', attendance_date: '2026-09-02', status: 'Absent', marked_by: 'FAC101' },
    { id: 12, session_id: 2, student_id: '104', subject_code: 'CS101', attendance_date: '2026-09-02', status: 'Present', marked_by: 'FAC101' },
    { id: 13, session_id: 2, student_id: '105', subject_code: 'CS101', attendance_date: '2026-09-02', status: 'Absent', marked_by: 'FAC101' },
    { id: 14, session_id: 2, student_id: '106', subject_code: 'CS101', attendance_date: '2026-09-02', status: 'Present', marked_by: 'FAC101' },
    { id: 15, session_id: 2, student_id: '107', subject_code: 'CS101', attendance_date: '2026-09-02', status: 'Absent', marked_by: 'FAC101' },
    { id: 16, session_id: 2, student_id: '108', subject_code: 'CS101', attendance_date: '2026-09-02', status: 'Present', marked_by: 'FAC101' },
    // CS101 Session 3 (2026-09-03)
    { id: 17, session_id: 3, student_id: '101', subject_code: 'CS101', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC101' },
    { id: 18, session_id: 3, student_id: '102', subject_code: 'CS101', attendance_date: '2026-09-03', status: 'Absent', marked_by: 'FAC101' },
    { id: 19, session_id: 3, student_id: '103', subject_code: 'CS101', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC101' },
    { id: 20, session_id: 3, student_id: '104', subject_code: 'CS101', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC101' },
    { id: 21, session_id: 3, student_id: '105', subject_code: 'CS101', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC101' },
    { id: 22, session_id: 3, student_id: '106', subject_code: 'CS101', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC101' },
    { id: 23, session_id: 3, student_id: '107', subject_code: 'CS101', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC101' },
    { id: 24, session_id: 3, student_id: '108', subject_code: 'CS101', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC101' },
    // CS101 Session 4 (2026-09-04)
    { id: 25, session_id: 4, student_id: '101', subject_code: 'CS101', attendance_date: '2026-09-04', status: 'Present', marked_by: 'FAC101' },
    { id: 26, session_id: 4, student_id: '102', subject_code: 'CS101', attendance_date: '2026-09-04', status: 'Present', marked_by: 'FAC101' },
    { id: 27, session_id: 4, student_id: '103', subject_code: 'CS101', attendance_date: '2026-09-04', status: 'Absent', marked_by: 'FAC101' },
    { id: 28, session_id: 4, student_id: '104', subject_code: 'CS101', attendance_date: '2026-09-04', status: 'Present', marked_by: 'FAC101' },
    { id: 29, session_id: 4, student_id: '105', subject_code: 'CS101', attendance_date: '2026-09-04', status: 'Absent', marked_by: 'FAC101' },
    { id: 30, session_id: 4, student_id: '106', subject_code: 'CS101', attendance_date: '2026-09-04', status: 'Absent', marked_by: 'FAC101' },
    { id: 31, session_id: 4, student_id: '107', subject_code: 'CS101', attendance_date: '2026-09-04', status: 'Present', marked_by: 'FAC101' },
    { id: 32, session_id: 4, student_id: '108', subject_code: 'CS101', attendance_date: '2026-09-04', status: 'Present', marked_by: 'FAC101' },
    // CS101 Session 5 (2026-09-05)
    { id: 33, session_id: 5, student_id: '101', subject_code: 'CS101', attendance_date: '2026-09-05', status: 'Present', marked_by: 'FAC101' },
    { id: 34, session_id: 5, student_id: '102', subject_code: 'CS101', attendance_date: '2026-09-05', status: 'Absent', marked_by: 'FAC101' },
    { id: 35, session_id: 5, student_id: '103', subject_code: 'CS101', attendance_date: '2026-09-05', status: 'Present', marked_by: 'FAC101' },
    { id: 36, session_id: 5, student_id: '104', subject_code: 'CS101', attendance_date: '2026-09-05', status: 'Present', marked_by: 'FAC101' },
    { id: 37, session_id: 5, student_id: '105', subject_code: 'CS101', attendance_date: '2026-09-05', status: 'Absent', marked_by: 'FAC101' },
    { id: 38, session_id: 5, student_id: '106', subject_code: 'CS101', attendance_date: '2026-09-05', status: 'Present', marked_by: 'FAC101' },
    { id: 39, session_id: 5, student_id: '107', subject_code: 'CS101', attendance_date: '2026-09-05', status: 'Present', marked_by: 'FAC101' },
    { id: 40, session_id: 5, student_id: '108', subject_code: 'CS101', attendance_date: '2026-09-05', status: 'Present', marked_by: 'FAC101' },
    // CS102 Sessions (4 sessions)
    { id: 41, session_id: 6, student_id: '101', subject_code: 'CS102', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC101' },
    { id: 42, session_id: 6, student_id: '102', subject_code: 'CS102', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC101' },
    { id: 43, session_id: 6, student_id: '103', subject_code: 'CS102', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC101' },
    { id: 44, session_id: 6, student_id: '104', subject_code: 'CS102', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC101' },
    { id: 45, session_id: 6, student_id: '105', subject_code: 'CS102', attendance_date: '2026-09-01', status: 'Absent', marked_by: 'FAC101' },
    { id: 46, session_id: 7, student_id: '101', subject_code: 'CS102', attendance_date: '2026-09-02', status: 'Present', marked_by: 'FAC101' },
    { id: 47, session_id: 7, student_id: '102', subject_code: 'CS102', attendance_date: '2026-09-02', status: 'Absent', marked_by: 'FAC101' },
    { id: 48, session_id: 7, student_id: '103', subject_code: 'CS102', attendance_date: '2026-09-02', status: 'Absent', marked_by: 'FAC101' },
    { id: 49, session_id: 7, student_id: '104', subject_code: 'CS102', attendance_date: '2026-09-02', status: 'Present', marked_by: 'FAC101' },
    { id: 50, session_id: 7, student_id: '105', subject_code: 'CS102', attendance_date: '2026-09-02', status: 'Absent', marked_by: 'FAC101' },
    { id: 51, session_id: 8, student_id: '101', subject_code: 'CS102', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC101' },
    { id: 52, session_id: 8, student_id: '102', subject_code: 'CS102', attendance_date: '2026-09-03', status: 'Absent', marked_by: 'FAC101' },
    { id: 53, session_id: 8, student_id: '103', subject_code: 'CS102', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC101' },
    { id: 54, session_id: 8, student_id: '104', subject_code: 'CS102', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC101' },
    { id: 55, session_id: 8, student_id: '105', subject_code: 'CS102', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC101' },
    { id: 56, session_id: 9, student_id: '101', subject_code: 'CS102', attendance_date: '2026-09-04', status: 'Present', marked_by: 'FAC101' },
    { id: 57, session_id: 9, student_id: '102', subject_code: 'CS102', attendance_date: '2026-09-04', status: 'Absent', marked_by: 'FAC101' },
    { id: 58, session_id: 9, student_id: '103', subject_code: 'CS102', attendance_date: '2026-09-04', status: 'Absent', marked_by: 'FAC101' },
    { id: 59, session_id: 9, student_id: '104', subject_code: 'CS102', attendance_date: '2026-09-04', status: 'Present', marked_by: 'FAC101' },
    { id: 60, session_id: 9, student_id: '105', subject_code: 'CS102', attendance_date: '2026-09-04', status: 'Absent', marked_by: 'FAC101' },
    // EC201 Sessions (4 sessions)
    { id: 61, session_id: 10, student_id: '101', subject_code: 'EC201', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC102' },
    { id: 62, session_id: 10, student_id: '102', subject_code: 'EC201', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC102' },
    { id: 63, session_id: 10, student_id: '103', subject_code: 'EC201', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC102' },
    { id: 64, session_id: 10, student_id: '104', subject_code: 'EC201', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC102' },
    { id: 65, session_id: 10, student_id: '105', subject_code: 'EC201', attendance_date: '2026-09-01', status: 'Absent', marked_by: 'FAC102' },
    { id: 66, session_id: 11, student_id: '101', subject_code: 'EC201', attendance_date: '2026-09-02', status: 'Present', marked_by: 'FAC102' },
    { id: 67, session_id: 11, student_id: '102', subject_code: 'EC201', attendance_date: '2026-09-02', status: 'Absent', marked_by: 'FAC102' },
    { id: 68, session_id: 11, student_id: '103', subject_code: 'EC201', attendance_date: '2026-09-02', status: 'Present', marked_by: 'FAC102' },
    { id: 69, session_id: 11, student_id: '104', subject_code: 'EC201', attendance_date: '2026-09-02', status: 'Present', marked_by: 'FAC102' },
    { id: 70, session_id: 11, student_id: '105', subject_code: 'EC201', attendance_date: '2026-09-02', status: 'Absent', marked_by: 'FAC102' },
    { id: 71, session_id: 12, student_id: '101', subject_code: 'EC201', attendance_date: '2026-09-03', status: 'Absent', marked_by: 'FAC102' },
    { id: 72, session_id: 12, student_id: '102', subject_code: 'EC201', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC102' },
    { id: 73, session_id: 12, student_id: '103', subject_code: 'EC201', attendance_date: '2026-09-03', status: 'Absent', marked_by: 'FAC102' },
    { id: 74, session_id: 12, student_id: '104', subject_code: 'EC201', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC102' },
    { id: 75, session_id: 12, student_id: '105', subject_code: 'EC201', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC102' },
    { id: 76, session_id: 13, student_id: '101', subject_code: 'EC201', attendance_date: '2026-09-04', status: 'Present', marked_by: 'FAC102' },
    { id: 77, session_id: 13, student_id: '102', subject_code: 'EC201', attendance_date: '2026-09-04', status: 'Absent', marked_by: 'FAC102' },
    { id: 78, session_id: 13, student_id: '103', subject_code: 'EC201', attendance_date: '2026-09-04', status: 'Present', marked_by: 'FAC102' },
    { id: 79, session_id: 13, student_id: '104', subject_code: 'EC201', attendance_date: '2026-09-04', status: 'Present', marked_by: 'FAC102' },
    { id: 80, session_id: 13, student_id: '105', subject_code: 'EC201', attendance_date: '2026-09-04', status: 'Absent', marked_by: 'FAC102' },
    // MA201 Sessions (4 sessions)
    { id: 81, session_id: 14, student_id: '101', subject_code: 'MA201', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC103' },
    { id: 82, session_id: 14, student_id: '102', subject_code: 'MA201', attendance_date: '2026-09-01', status: 'Absent', marked_by: 'FAC103' },
    { id: 83, session_id: 14, student_id: '103', subject_code: 'MA201', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC103' },
    { id: 84, session_id: 14, student_id: '104', subject_code: 'MA201', attendance_date: '2026-09-01', status: 'Present', marked_by: 'FAC103' },
    { id: 85, session_id: 14, student_id: '105', subject_code: 'MA201', attendance_date: '2026-09-01', status: 'Absent', marked_by: 'FAC103' },
    { id: 86, session_id: 15, student_id: '101', subject_code: 'MA201', attendance_date: '2026-09-02', status: 'Present', marked_by: 'FAC103' },
    { id: 87, session_id: 15, student_id: '102', subject_code: 'MA201', attendance_date: '2026-09-02', status: 'Present', marked_by: 'FAC103' },
    { id: 88, session_id: 15, student_id: '103', subject_code: 'MA201', attendance_date: '2026-09-02', status: 'Absent', marked_by: 'FAC103' },
    { id: 89, session_id: 15, student_id: '104', subject_code: 'MA201', attendance_date: '2026-09-02', status: 'Present', marked_by: 'FAC103' },
    { id: 90, session_id: 15, student_id: '105', subject_code: 'MA201', attendance_date: '2026-09-02', status: 'Absent', marked_by: 'FAC103' },
    { id: 91, session_id: 16, student_id: '101', subject_code: 'MA201', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC103' },
    { id: 92, session_id: 16, student_id: '102', subject_code: 'MA201', attendance_date: '2026-09-03', status: 'Absent', marked_by: 'FAC103' },
    { id: 93, session_id: 16, student_id: '103', subject_code: 'MA201', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC103' },
    { id: 94, session_id: 16, student_id: '104', subject_code: 'MA201', attendance_date: '2026-09-03', status: 'Present', marked_by: 'FAC103' },
    { id: 95, session_id: 16, student_id: '105', subject_code: 'MA201', attendance_date: '2026-09-03', status: 'Absent', marked_by: 'FAC103' },
    { id: 96, session_id: 17, student_id: '101', subject_code: 'MA201', attendance_date: '2026-09-04', status: 'Present', marked_by: 'FAC103' },
    { id: 97, session_id: 17, student_id: '102', subject_code: 'MA201', attendance_date: '2026-09-04', status: 'Absent', marked_by: 'FAC103' },
    { id: 98, session_id: 17, student_id: '103', subject_code: 'MA201', attendance_date: '2026-09-04', status: 'Absent', marked_by: 'FAC103' },
    { id: 99, session_id: 17, student_id: '104', subject_code: 'MA201', attendance_date: '2026-09-04', status: 'Present', marked_by: 'FAC103' },
    { id: 100, session_id: 17, student_id: '105', subject_code: 'MA201', attendance_date: '2026-09-04', status: 'Absent', marked_by: 'FAC103' }
  ],
  attendance_edits: [
    {
      id: 1,
      attendance_record_id: 10,
      student_id: '102',
      subject_code: 'CS101',
      session_date: '2026-09-02',
      old_status: 'Absent',
      new_status: 'Present',
      reason: 'Student presented certified medical discharge slip approved by University Medical Officer',
      edited_by_faculty_id: 'FAC101',
      edited_at: '2026-09-03 11:20:00'
    },
    {
      id: 2,
      attendance_record_id: 67,
      student_id: '102',
      subject_code: 'EC201',
      session_date: '2026-09-02',
      old_status: 'Absent',
      new_status: 'Leave',
      reason: 'Official On-Duty letter presented for Inter-Collegiate Coding Hackathon participation',
      edited_by_faculty_id: 'FAC102',
      edited_at: '2026-09-03 14:15:00'
    }
  ],
  leaves: [
    {
      id: 1,
      student_id: '102',
      subject_code: 'CS101',
      start_date: '2026-09-05',
      end_date: '2026-09-06',
      leave_type: 'Medical',
      reason: 'Severe viral fever and throat infection. Doctor advised 2 days bed rest.',
      status: 'Pending',
      applied_at: '2026-09-04 18:30:00',
      reviewed_by: null,
      review_comment: null
    },
    {
      id: 2,
      student_id: '101',
      subject_code: 'CS102',
      start_date: '2026-09-02',
      end_date: '2026-09-02',
      leave_type: 'On Duty',
      reason: 'Represented the university at Regional Inter-Collegiate Math Olympiad.',
      status: 'Approved',
      applied_at: '2026-09-01 10:15:00',
      reviewed_by: 'FAC101',
      review_comment: 'Approved per Dean Academic notification #402.'
    },
    {
      id: 3,
      student_id: '105',
      subject_code: 'MA201',
      start_date: '2026-09-03',
      end_date: '2026-09-04',
      leave_type: 'Personal',
      reason: 'Family function out of town.',
      status: 'Rejected',
      applied_at: '2026-09-02 14:00:00',
      reviewed_by: 'FAC103',
      review_comment: 'Attendance already critically low (under 60%). Casual leaves cannot be sanctioned.'
    }
  ],
  timetable: [
    { id: 1, day_of_week: 'Monday', period_number: 1, start_time: '09:00:00', end_time: '10:00:00', subject_code: 'CS101', faculty_id: 'FAC101', room: 'Room 301', section: 'A' },
    { id: 2, day_of_week: 'Monday', period_number: 2, start_time: '10:00:00', end_time: '11:00:00', subject_code: 'CS102', faculty_id: 'FAC101', room: 'Lab 2', section: 'A' },
    { id: 3, day_of_week: 'Monday', period_number: 3, start_time: '11:15:00', end_time: '12:15:00', subject_code: 'EC201', faculty_id: 'FAC102', room: 'Room 204', section: 'A' },
    { id: 4, day_of_week: 'Monday', period_number: 4, start_time: '13:15:00', end_time: '14:15:00', subject_code: 'MA201', faculty_id: 'FAC103', room: 'Room 105', section: 'A' },
    { id: 5, day_of_week: 'Tuesday', period_number: 1, start_time: '09:00:00', end_time: '10:00:00', subject_code: 'MA201', faculty_id: 'FAC103', room: 'Room 105', section: 'A' },
    { id: 6, day_of_week: 'Tuesday', period_number: 2, start_time: '10:00:00', end_time: '11:00:00', subject_code: 'CS101', faculty_id: 'FAC101', room: 'Room 301', section: 'A' },
    { id: 7, day_of_week: 'Tuesday', period_number: 3, start_time: '11:15:00', end_time: '12:15:00', subject_code: 'EC201', faculty_id: 'FAC102', room: 'Room 204', section: 'A' },
    { id: 8, day_of_week: 'Tuesday', period_number: 4, start_time: '13:15:00', end_time: '14:15:00', subject_code: 'CS102', faculty_id: 'FAC101', room: 'Lab 2', section: 'A' },
    { id: 9, day_of_week: 'Wednesday', period_number: 1, start_time: '09:00:00', end_time: '10:00:00', subject_code: 'CS102', faculty_id: 'FAC101', room: 'Lab 2', section: 'A' },
    { id: 10, day_of_week: 'Wednesday', period_number: 2, start_time: '10:00:00', end_time: '11:00:00', subject_code: 'EC201', faculty_id: 'FAC102', room: 'Room 204', section: 'A' },
    { id: 11, day_of_week: 'Wednesday', period_number: 3, start_time: '11:15:00', end_time: '12:15:00', subject_code: 'CS101', faculty_id: 'FAC101', room: 'Room 301', section: 'A' },
    { id: 12, day_of_week: 'Wednesday', period_number: 4, start_time: '13:15:00', end_time: '14:15:00', subject_code: 'MA201', faculty_id: 'FAC103', room: 'Room 105', section: 'A' },
    { id: 13, day_of_week: 'Thursday', period_number: 1, start_time: '09:00:00', end_time: '10:00:00', subject_code: 'EC201', faculty_id: 'FAC102', room: 'Room 204', section: 'A' },
    { id: 14, day_of_week: 'Thursday', period_number: 2, start_time: '10:00:00', end_time: '11:00:00', subject_code: 'MA201', faculty_id: 'FAC103', room: 'Room 105', section: 'A' },
    { id: 15, day_of_week: 'Thursday', period_number: 3, start_time: '11:15:00', end_time: '12:15:00', subject_code: 'CS102', faculty_id: 'FAC101', room: 'Lab 2', section: 'A' },
    { id: 16, day_of_week: 'Thursday', period_number: 4, start_time: '13:15:00', end_time: '14:15:00', subject_code: 'CS101', faculty_id: 'FAC101', room: 'Room 301', section: 'A' },
    { id: 17, day_of_week: 'Friday', period_number: 1, start_time: '09:00:00', end_time: '10:00:00', subject_code: 'CS101', faculty_id: 'FAC101', room: 'Room 301', section: 'A' },
    { id: 18, day_of_week: 'Friday', period_number: 2, start_time: '10:00:00', end_time: '11:00:00', subject_code: 'CS102', faculty_id: 'FAC101', room: 'Lab 2', section: 'A' },
    { id: 19, day_of_week: 'Friday', period_number: 3, start_time: '11:15:00', end_time: '12:15:00', subject_code: 'EC201', faculty_id: 'FAC102', room: 'Room 204', section: 'A' },
    { id: 20, day_of_week: 'Friday', period_number: 4, start_time: '13:15:00', end_time: '14:15:00', subject_code: 'MA201', faculty_id: 'FAC103', room: 'Room 105', section: 'A' }
  ],
  audit_logs: [
    { id: 1, event_type: 'SYSTEM_INIT', details: 'Database initialized with academic seed dataset.', user_role: 'admin', user_name: 'System Administrator', ip_address: '127.0.0.1', created_at: new Date().toISOString() }
  ]
};

// Load or save embedded store
function getEmbeddedStore() {
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const data = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading embedded db file:', err.message);
  }
  saveEmbeddedStore(defaultStore);
  return defaultStore;
}

function saveEmbeddedStore(store) {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving embedded db file:', err.message);
  }
}

// Attempt initializing MySQL connection
async function initDatabase() {
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch (err) {
    dbMode = 'embedded';
    dbError = 'mysql2 package not installed. Running in embedded mode.';
    console.log(`[DATABASE] ${dbError}`);
    getEmbeddedStore();
    return;
  }

  try {
    // First try connecting to MySQL server directly
    const conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      connectTimeout: 2000
    });

    // Create database if not exists
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.end();

    // Now create pool with DB_NAME
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test pool connection
    const testConn = await pool.getConnection();
    testConn.release();

    dbMode = 'mysql';
    dbError = null;
    console.log(`[DATABASE] Connected to live MySQL (${DB_HOST}:${DB_PORT}/${DB_NAME})`);

    // Run schema migrations if needed
    await applyMySQLSchema();
  } catch (err) {
    dbMode = 'embedded';
    dbError = `MySQL connection failed (${err.code || err.message}). Fallback to local persistent JSON engine.`;
    console.log(`[DATABASE] ${dbError}`);
    getEmbeddedStore();
  }
}

async function applyMySQLSchema() {
  if (dbMode !== 'mysql' || !pool) return;
  try {
    const schemaFile = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaFile)) {
      const sql = fs.readFileSync(schemaFile, 'utf8');
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('CREATE DATABASE') && !s.startsWith('USE'));

      for (const stmt of statements) {
        try {
          await pool.query(stmt);
        } catch (e) {
          // ignore already exists table errors
        }
      }
    }

    // Check if users exist; if not, apply seed
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      const seedFile = path.join(__dirname, 'seed.sql');
      if (fs.existsSync(seedFile)) {
        const seedSql = fs.readFileSync(seedFile, 'utf8');
        const seedStmts = seedSql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));
        for (const stmt of seedStmts) {
          try {
            await pool.query(stmt);
          } catch (e) {
            // ignore duplicate warnings
          }
        }
        console.log('[DATABASE] MySQL seed data applied successfully.');
      }
    }
  } catch (err) {
    console.warn('[DATABASE] Schema apply note:', err.message);
  }
}

// Global query method
async function query(sql, params = []) {
  if (dbMode === 'mysql' && pool) {
    return await pool.query(sql, params);
  }
  // If in embedded mode, we provide high-level models directly in the routes or return mock
  return [[], []];
}

// Export models and database helpers
module.exports = {
  initDatabase,
  getDatabaseMode: () => ({
    mode: dbMode,
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    error: dbError
  }),
  getEmbeddedStore,
  saveEmbeddedStore,
  query,
  getPool: () => pool
};
